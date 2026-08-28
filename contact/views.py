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
from django.http import HttpResponseRedirect
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
        # Honeypot — discard silently without saving, bot thinks it succeeded
        if form.cleaned_data.get('website'):
            logger.warning('Honeypot triggered from IP %s', _get_client_ip(self.request))
            messages.success(
                self.request,
                'Thank you for contacting us! We have received your message and will get back to you soon.'
            )
            return HttpResponseRedirect(self.get_success_url())

        # Rate limiting — max RATE_LIMIT submissions per IP per hour
        ip = _get_client_ip(self.request)
        cache_key = f'contact_rl_{ip}'
        count = cache.get(cache_key, 0)
        if count >= RATE_LIMIT:
            messages.error(
                self.request,
                'Too many messages sent. Please wait an hour before trying again.'
            )
            return self.render_to_response(self.get_context_data(form=form))
        cache.set(cache_key, count + 1, RATE_WINDOW)

        # Save the inquiry to database
        inquiry = form.save()
        
        # Get the service name from the choice value
        service_choices = dict(ContactForm.SERVICE_CHOICES)
        service_name = service_choices.get(inquiry.subject, inquiry.subject)
        
        # Email notifications temporarily disabled
        logger.info(
            'Contact form submission saved (email disabled)',
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
