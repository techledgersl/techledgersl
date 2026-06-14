"""
Admin configuration for contact app.
"""
from django.contrib import admin
from techledger.admin_mixins import AdminFinanceOperationsAccessMixin
from .models import ContactInquiry


class ContactInquiryAdmin(AdminFinanceOperationsAccessMixin, admin.ModelAdmin):
    """
    Admin interface for ContactInquiry model.
    """
    list_display = ['name', 'email', 'phone', 'subject', 'topic', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'email', 'phone', 'subject', 'topic', 'message']
    readonly_fields = ['created_at']
    list_editable = ['status']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Message Details', {
            'fields': ('subject', 'topic', 'message')
        }),
        ('Status', {
            'fields': ('status', 'created_at')
        }),
    )


# Register with custom admin site
from techledger.admin import admin_site
admin_site.register(ContactInquiry, ContactInquiryAdmin)
