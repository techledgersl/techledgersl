"""
URL configuration for portfolio app.
"""
from django.urls import path
from . import views

app_name = 'portfolio'

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('inter-district-health-dashboard/', views.HealthDashboardView.as_view(), name='health-dashboard'),
    path('focus-gym/', views.FocusGymView.as_view(), name='focus-gym'),
    path('slpnna/', views.SlpnnaView.as_view(), name='slpnna'),
    path('college-management-system/', views.CollegeView.as_view(), name='college'),
    path('mamacare-sierra-leone/', views.MamaCareView.as_view(), name='mamacare'),
]
