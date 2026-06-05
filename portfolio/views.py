"""
Views for the portfolio app.
"""
from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = 'portfolio/index.html'


class HealthDashboardView(TemplateView):
    template_name = 'portfolio/detail/health-dashboard.html'


class FocusGymView(TemplateView):
    template_name = 'portfolio/detail/focus-gym.html'


class SlpnnaView(TemplateView):
    template_name = 'portfolio/detail/slpnna.html'


class CollegeView(TemplateView):
    template_name = 'portfolio/detail/college.html'


class MamaCareView(TemplateView):
    template_name = 'portfolio/detail/mamacare.html'
