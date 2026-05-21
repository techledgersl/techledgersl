import logging
import uuid
from decimal import Decimal, InvalidOperation

import requests
from django.conf import settings
from django.contrib import messages
from django.core.cache import cache
from django.core.mail import send_mail
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from services.models import Service

# Cache key prefix and TTL for one-time receipt data (no sensitive data in URLs)
PAYMENT_RECEIPT_CACHE_PREFIX = 'payment_receipt_'
PAYMENT_RECEIPT_CACHE_TIMEOUT = 3600  # 1 hour

logger = logging.getLogger(__name__)


# Fallback services used when there are no Service records in the database.
# These mirror the static services shown on templates/services/index.html.
FALLBACK_SERVICES = [
    ('technology-solutions', 'Technology Solutions'),
    ('financial-management', 'Financial Management'),
    ('research-analytics', 'Research & Analytics'),
    ('consulting-services', 'Consulting Services'),
    ('custom-development', 'Custom Development'),
    ('system-integration', 'System Integration'),
]


class CheckoutView(TemplateView):
    """
    Display a simple checkout page with a dropdown of services
    that can be paid for using Monime.
    """

    template_name = 'payments/checkout.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        payment_services = []

        # Prefer real Service records when available
        db_services = Service.objects.filter(is_active=True).order_by('display_order', 'name')
        for service in db_services:
            payment_services.append({
                'value': f'db:{service.pk}',
                'label': service.name,
            })

        # If no DB services exist, fall back to static list derived from services template
        if not payment_services:
            for key, label in FALLBACK_SERVICES:
                payment_services.append({
                    'value': f'static:{key}',
                    'label': label,
                })

        context['payment_services'] = payment_services
        return context


@method_decorator(csrf_exempt, name='dispatch')
class PaymentSuccessView(View):
    """
    Monime redirects the user here after payment (often as POST with Origin null).
    Receipt data is looked up by one-time token (tid); no email or payment details in URL or logs.
    """

    def get(self, request, *args, **kwargs):
        self._handle_success(request)
        return redirect(reverse('payments:checkout') + '?payment=success')

    def post(self, request, *args, **kwargs):
        self._handle_success(request)
        return redirect(reverse('payments:checkout') + '?payment=success')

    def _handle_success(self, request):
        tid = (request.GET.get('tid') or request.POST.get('tid') or '').strip()
        if not tid:
            messages.success(request, 'Your payment was successful. Thank you!')
            return

        cache_key = f"{PAYMENT_RECEIPT_CACHE_PREFIX}{tid}"
        receipt_data = cache.get(cache_key)
        if receipt_data:
            cache.delete(cache_key)  # one-time use
            email = receipt_data.get('email', '').strip()
            if email:
                subject = 'Your TechLedger payment receipt'
                amount = receipt_data.get('amount', '')
                currency = receipt_data.get('currency', 'SLE')
                service_name = receipt_data.get('service_name', 'TechLedger Service')
                lines = [
                    'Thank you for your payment to TechLedger.',
                    '',
                    f'Service: {service_name}',
                    f'Amount: {amount} {currency}' if amount else f'Currency: {currency}',
                    '',
                    'If you have any questions, simply reply to this email.',
                ]
                body = '\n'.join(lines)
                try:
                    send_mail(
                        subject,
                        body,
                        settings.DEFAULT_FROM_EMAIL,
                        [email],
                        fail_silently=True,
                    )
                except Exception:
                    logger.exception('Failed to send payment receipt email.')

        messages.success(request, 'Your payment was successful. A receipt has been sent to your email.')


class CreateCheckoutSessionView(View):
    """
    Handle form submission, create a Monime checkout session and
    redirect the user to Monime's hosted checkout.
    """

    def post(self, request, *args, **kwargs):
        email = (request.POST.get('email') or '').strip()
        if not email:
            messages.error(request, 'Please enter an email address so we can send your receipt.')
            return redirect('payments:checkout')

        service_key = request.POST.get('service_key')

        if not service_key:
            messages.error(request, 'Please select a service to pay for.')
            return redirect('payments:checkout')

        service_obj = None
        service_name = None
        reference = None

        # Database-backed service (value like \"db:1\")
        if service_key.startswith('db:'):
            try:
                pk = int(service_key.split(':', 1)[1])
                service_obj = Service.objects.filter(is_active=True).get(pk=pk)
                service_name = service_obj.name
                reference = f'db:{service_obj.pk}'
            except (ValueError, Service.DoesNotExist):
                messages.error(request, 'The selected service is not available.')
                return redirect('payments:checkout')

        # Static fallback service (value like \"static:technology-solutions\")
        elif service_key.startswith('static:'):
            slug = service_key.split(':', 1)[1]
            mapping = {key: label for key, label in FALLBACK_SERVICES}
            service_name = mapping.get(slug)
            if not service_name:
                messages.error(request, 'The selected service is not available.')
                return redirect('payments:checkout')
            reference = f'static:{slug}'

        else:
            messages.error(request, 'Invalid service selection.')
            return redirect('payments:checkout')

        currency = (request.POST.get('currency') or 'SLE').strip().upper()
        if len(currency) != 3:
            currency = 'SLE'

        raw_amount = request.POST.get('amount')
        if not raw_amount:
            messages.error(request, 'Please enter an amount to pay.')
            return redirect('payments:checkout')

        try:
            amount_major = Decimal(str(raw_amount))
        except (TypeError, InvalidOperation):
            messages.error(request, 'Please enter a valid numeric amount.')
            return redirect('payments:checkout')

        if amount_major <= 0:
            messages.error(request, 'Amount must be greater than zero.')
            return redirect('payments:checkout')

        # Convert from major units (e.g. SLE 1.00) to minor units expected by Monime.
        # For SLE and most currencies, 1 unit = 100 minor units.
        minor_unit_multipliers = {
            'SLE': Decimal('100'),
            'USD': Decimal('100'),
            'EUR': Decimal('100'),
        }
        multiplier = minor_unit_multipliers.get(currency, Decimal('100'))
        amount_minor = int((amount_major * multiplier).quantize(Decimal('1')))

        if amount_minor <= 0:
            messages.error(request, 'Amount must be greater than zero.')
            return redirect('payments:checkout')

        api_token = getattr(settings, 'MONIME_API_TOKEN', '')
        space_id = getattr(settings, 'MONIME_SPACE_ID', '')

        if not api_token or not space_id:
            logger.error('Monime API credentials are not configured.')
            messages.error(request, 'Payment is currently unavailable. Please try again later.')
            return redirect('payments:checkout')

        session_name = f'TechLedger - {service_name}'[:150]

        # Store receipt data server-side; success URL contains only a one-time token (no PII).
        receipt_token = uuid.uuid4().hex
        cache_key = f"{PAYMENT_RECEIPT_CACHE_PREFIX}{receipt_token}"
        cache.set(
            cache_key,
            {
                'email': email,
                'amount': str(amount_major),
                'currency': currency,
                'service_name': service_name,
            },
            timeout=PAYMENT_RECEIPT_CACHE_TIMEOUT,
        )
        success_url = f"{request.build_absolute_uri(reverse('payments:success'))}?tid={receipt_token}"
        cancel_url = request.build_absolute_uri(reverse('payments:checkout'))

        payload = {
            'name': session_name,
            'lineItems': [
                {
                    'type': 'custom',
                    'name': service_name[:100],
                    'price': {
                        'currency': currency,
                        'value': amount_minor,
                    },
                    'quantity': 1,
                }
            ],
            'successUrl': success_url,
            'cancelUrl': cancel_url,
            'reference': reference,
            'metadata': {
                'customer_email': email,
            },
        }

        headers = {
            'Authorization': f'Bearer {api_token}',
            'Monime-Space-Id': space_id,
            'Idempotency-Key': uuid.uuid4().hex,
            'Content-Type': 'application/json',
        }

        try:
            response = requests.post(
                'https://api.monime.io/v1/checkout-sessions',
                json=payload,
                headers=headers,
                timeout=15,
            )
        except requests.RequestException:
            logger.exception('Error communicating with Monime API.')
            messages.error(request, 'Could not start payment. Please try again in a moment.')
            return redirect('payments:checkout')

        if not response.ok:
            logger.error('Monime API returned error status %s', response.status_code)
            messages.error(request, 'Could not start payment. Please contact support if this persists.')
            return redirect('payments:checkout')

        try:
            data = response.json()
        except ValueError:
            logger.error('Monime API returned non-JSON response.')
            messages.error(request, 'Unexpected response from payment provider.')
            return redirect('payments:checkout')

        # Monime returns redirectUrl inside result: { success, messages, result: { redirectUrl, ... } }
        result = data.get('result') or {}
        redirect_url = result.get('redirectUrl') or data.get('redirectUrl')
        if not redirect_url:
            logger.error('Monime API response missing redirectUrl.')
            messages.error(request, 'Payment could not be started. Please try again later.')
            return redirect('payments:checkout')

        return redirect(redirect_url)

