"""
URL configuration for services app.
"""
from django.urls import path
from . import views

app_name = 'services'

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('<slug:slug>/', views.ServiceDetailView.as_view(), name='detail'),
]

