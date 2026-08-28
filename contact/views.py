"""
Views for the contact app.
"""
import logging
from django.views.generic import FormView
from django.urls import reverse_lazy
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
from .forms import ContactForm

logger = logging.getLogger('contact')

RATE_LIMIT = 3       # max submissions
RATE_WINDOW = 3600   # per hour (seconds)


def _get_client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


class IndexView(FormView):
    """
    Contact page view with form handling.
    """
    template_name = 'contact/index.html'
    form_class = ContactForm
    success_url = reverse_lazy('contact:index')

    def form_valid(self, form):
        # Honeypot check — silently discard bot submissions
        if form.cleaned_data.get('website'):
            logger.warning('Honeypot triggered from IP %s', _get_client_ip(self.request))
            messages.success(
                self.request,
                'Thank you for contacting us! We have received your message and will get back to you soon.'
            )
            return super().form_valid(form)

        # Rate limiting — max RATE_LIMIT submissions per IP per hour
        ip = _get_client_ip(self.request)
        cache_key = f'contact_rl_{ip}'
        count = cache.get(cache_key, 0)
        if count >= RATE_LIMIT:
            messages.error(
                self.request,
                'Too many messages sent. Please wait an hour before trying again.'
            )
            return self.form_invalid(form)
        cache.set(cache_key, count + 1, RATE_WINDOW)

        """Handle valid form submission."""
        # Save the inquiry to database
        inquiry = form.save()
        
        # Get the service name from the choice value
        service_choices = dict(ContactForm.SERVICE_CHOICES)
        service_name = service_choices.get(inquiry.subject, inquiry.subject)
        
        # Send email notification to company
        try:
            subject = f'New Contact Inquiry: {service_name}'
            
            # Email body for company notification
            message = f"""
New contact form submission received:

Name: {inquiry.name}
Email: {inquiry.email}
Phone: {inquiry.phone or 'Not provided'}
Service: {service_name}
Subject: {inquiry.topic or 'Not provided'}
Message:
{inquiry.message}

---
This message was sent from the TechLedger Solutions contact form.
            """
            
            # Send email to company
            send_mail(
                subject=subject,
                message=message.strip(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.CONTACT_EMAIL],
                fail_silently=False,
            )
            
            # Send confirmation email to client
            confirmation_subject = 'Thank you for contacting TechLedger Solutions'
            confirmation_message = f"""
Dear {inquiry.name},

Thank you for contacting TechLedger Solutions. We have received your inquiry regarding {service_name}.

Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.

Your inquiry details:
Service: {service_name}
Message: {inquiry.message[:100]}{'...' if len(inquiry.message) > 100 else ''}

If you have any urgent questions, please feel free to contact us directly at tech.ledger.sl@gmail.com.

Best regards,
TechLedger Solutions Team
            """
            
            send_mail(
                subject=confirmation_subject,
                message=confirmation_message.strip(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[inquiry.email],
                fail_silently=False,
            )
            
            # Log successful email sending
            logger.info(
                'Contact form submission processed successfully',
                extra={
                    'inquiry_id': inquiry.id,
                    'inquiry_name': inquiry.name,
                    'inquiry_email': inquiry.email,
                    'service': service_name,
                }
            )
            
        except Exception as e:
            # Log the error with full context but don't fail the form submission
            logger.error(
                'Failed to send email notification for contact inquiry',
                exc_info=True,
                extra={
                    'inquiry_id': inquiry.id,
                    'inquiry_name': inquiry.name,
                    'inquiry_email': inquiry.email,
                    'service': service_name,
                }
            )
        
        messages.success(
            self.request,
            'Thank you for contacting us! We have received your message and will get back to you soon.'
        )
        return super().form_valid(form)

    def form_invalid(self, form):
        """Handle invalid form submission."""
        messages.error(
            self.request,
            'Please correct the errors below and try again.'
        )
        return super().form_invalid(form)
