"""
Views for the home app.
"""
from django.views.generic import TemplateView


class IndexView(TemplateView):
    """
    Home page view.
    """
    template_name = 'home/index.html'
