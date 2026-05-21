"""
Admin configuration for services app.
"""
from django.contrib import admin
from techledger.admin_mixins import FinanceReadOnlyMixin
from .models import Service


class ServiceAdmin(FinanceReadOnlyMixin, admin.ModelAdmin):
    """
    Admin interface for Service model.
    """
    list_display = ['name', 'display_order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['display_order', 'is_active']
    
    fieldsets = (
        ('Service Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Display Settings', {
            'fields': ('icon_class', 'display_order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Register with custom admin site
from techledger.admin import admin_site
admin_site.register(Service, ServiceAdmin)
