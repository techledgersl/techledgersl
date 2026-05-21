"""
URL configuration for dashboard app.
"""
from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.login_view, name='login'),
    path('dashboard/', views.dashboard_home, name='dashboard_home'),
    path('dashboard/admin/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard/finance/', views.finance_dashboard, name='finance_dashboard'),
    path('dashboard/operations/', views.operations_dashboard, name='operations_dashboard'),
    path('logout/', views.logout_view, name='logout'),
]
