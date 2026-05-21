"""
URL configuration for techledger project.
"""
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from techledger.admin import admin_site

urlpatterns = [
    path('admin/', admin_site.urls),
    path('login/', include('dashboard.urls')),
    path('', include('home.urls')),
    path('services/', include('services.urls')),
    path('pay/', include('payments.urls')),
    path('contact/', include('contact.urls')),
    path('about/', include('about.urls')),
    path('portfolio/', include('portfolio.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
