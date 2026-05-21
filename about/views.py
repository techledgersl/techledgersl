"""
Views for the about app.
"""
from django.views.generic import TemplateView


class IndexView(TemplateView):
    """
    About page view.
    """
    template_name = 'about/index.html'
