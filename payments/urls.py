from django.urls import path

from . import views

app_name = 'payments'

urlpatterns = [
    path('', views.CheckoutView.as_view(), name='checkout'),
    path('create-session/', views.CreateCheckoutSessionView.as_view(), name='create_session'),
    path('success/', views.PaymentSuccessView.as_view(), name='success'),
]

