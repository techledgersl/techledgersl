"""
Views for the services app.
"""
from django.views.generic import ListView, DetailView
from .models import Service


class IndexView(ListView):
    """
    Services listing page view.
    """
    model = Service
    template_name = 'services/index.html'
    context_object_name = 'services'

    def get_queryset(self):
        """Return only active services."""
        return Service.objects.filter(is_active=True)


class ServiceDetailView(DetailView):
    """
    Individual service detail page view.
    """
    model = Service
    template_name = 'services/detail.html'
    context_object_name = 'service'
    slug_url_kwarg = 'slug'
    slug_field = 'slug'

    def get_queryset(self):
        """Return only active services."""
        return Service.objects.filter(is_active=True)
