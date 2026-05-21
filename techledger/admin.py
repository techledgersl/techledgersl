"""
Custom admin site configuration for TechLedger Solutions.
"""
from django.contrib import admin
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin, GroupAdmin
from techledger.admin_mixins import RoleBasedAdminMixin
from techledger.forms import CustomUserCreationForm, CustomUserChangeForm


class AdminOnlyUserAdmin(RoleBasedAdminMixin, UserAdmin):
    """User admin that only allows Admin group and superusers."""
    
    # Use custom forms for user creation and editing
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    
    # Hide the groups field since we're using role dropdown instead
    filter_horizontal = ('user_permissions',)
    
    # Customize fieldsets - replace groups with role
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Role & Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Fields shown when adding a new user - now includes role dropdown
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'role'),
        }),
    )
    
    def get_form(self, request, obj=None, **kwargs):
        """Use custom form for adding and editing users."""
        defaults = {}
        if obj is None:
            # Adding a new user - use custom creation form with role field
            defaults['form'] = CustomUserCreationForm
        else:
            # Editing existing user - use custom change form with role field
            defaults['form'] = CustomUserChangeForm
        return super().get_form(request, obj, **defaults)
    
    def save_model(self, request, obj, form, change):
        """Save the user and assign role from form."""
        # Get role from form before saving (in case form.cleaned_data is not available after)
        role = None
        if hasattr(form, 'cleaned_data') and form.cleaned_data:
            role = form.cleaned_data.get('role', '')
        
        # Save the user first (this calls form.save() internally)
        super().save_model(request, obj, form, change)
        
        # Assign role after user is saved
        if role:
            # Clear existing groups and assign the selected role
            obj.groups.clear()
            try:
                group = Group.objects.get(name=role)
                obj.groups.add(group)
            except Group.DoesNotExist:
                # If group doesn't exist, it means setup_roles hasn't been run
                # We could create it here, but it's better to run setup_roles
                pass
    
    def has_module_permission(self, request):
        """Only Admin group and superusers can see User management."""
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()
    
    def has_view_permission(self, request, obj=None):
        """Only Admin group and superusers can view users."""
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()
    
    def has_add_permission(self, request):
        """Only Admin group and superusers can add users."""
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()
    
    def has_change_permission(self, request, obj=None):
        """Only Admin group and superusers can change users."""
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()
    
    def has_delete_permission(self, request, obj=None):
        """Only Admin group and superusers can delete users."""
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()


class AdminOnlyGroupAdmin(RoleBasedAdminMixin, GroupAdmin):
    """Group admin that only allows Admin group and superusers."""
    
    def has_module_permission(self, request):
        """Only Admin group and superusers can see Group management."""
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()
    
    def has_view_permission(self, request, obj=None):
        """Only Admin group and superusers can view groups."""
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()
    
    def has_add_permission(self, request):
        """Only Admin group and superusers can add groups."""
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()
    
    def has_change_permission(self, request, obj=None):
        """Only Admin group and superusers can change groups."""
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()
    
    def has_delete_permission(self, request, obj=None):
        """Only Admin group and superusers can delete groups."""
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()


class TechLedgerAdminSite(admin.AdminSite):
    """
    Custom admin site with role-based model visibility.
    """
    site_header = 'TechLedger Solutions - Internal Operations'
    site_title = 'TechLedger Admin'
    index_title = 'Internal Operations Dashboard'

    def has_permission(self, request):
        """
        Only authenticated users can access the admin site.
        """
        return request.user.is_authenticated

    def get_app_list(self, request):
        """
        Filter app list based on user role.
        Non-admin users won't see User/Group management.
        """
        app_list = super().get_app_list(request)
        
        # Superusers and Admin group see everything
        if request.user.is_superuser or request.user.groups.filter(name='Admin').exists():
            return app_list
        
        # Filter out auth app (Users and Groups) for non-admin users
        filtered_app_list = []
        for app in app_list:
            if app['app_label'] == 'auth':
                # Skip auth app for non-admin users
                continue
            filtered_app_list.append(app)
        
        return filtered_app_list


# Create custom admin site instance
admin_site = TechLedgerAdminSite(name='techledger_admin')

# Register User and Group with role-based access
admin_site.register(User, AdminOnlyUserAdmin)
admin_site.register(Group, AdminOnlyGroupAdmin)
