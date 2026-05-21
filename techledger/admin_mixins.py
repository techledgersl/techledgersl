"""
Admin mixins for role-based access control.
"""
from django.contrib import admin
from django.core.exceptions import PermissionDenied


class RoleBasedAdminMixin:
    """
    Mixin to add role-based access control to admin classes.
    """
    
    def has_view_permission(self, request, obj=None):
        """Check if user has view permission based on role."""
        if request.user.is_superuser:
            return True
        
        # Check if user is in Admin group
        if request.user.groups.filter(name='Admin').exists():
            return True
        
        # Check specific role permissions
        return self._check_role_permission(request, 'view')
    
    def has_add_permission(self, request):
        """Check if user has add permission based on role."""
        if request.user.is_superuser:
            return True
        
        if request.user.groups.filter(name='Admin').exists():
            return True
        
        return self._check_role_permission(request, 'add')
    
    def has_change_permission(self, request, obj=None):
        """Check if user has change permission based on role."""
        if request.user.is_superuser:
            return True
        
        if request.user.groups.filter(name='Admin').exists():
            return True
        
        return self._check_role_permission(request, 'change')
    
    def has_delete_permission(self, request, obj=None):
        """Check if user has delete permission based on role."""
        if request.user.is_superuser:
            return True
        
        if request.user.groups.filter(name='Admin').exists():
            return True
        
        return self._check_role_permission(request, 'delete')
    
    def _check_role_permission(self, request, permission_type):
        """
        Check if user has specific permission based on their role.
        Override this method in subclasses to define role-specific permissions.
        """
        return False
    
    def get_queryset(self, request):
        """Filter queryset based on user permissions."""
        qs = super().get_queryset(request)
        
        # Superusers and Admins see everything
        if request.user.is_superuser or request.user.groups.filter(name='Admin').exists():
            return qs
        
        # Apply role-specific filtering
        return self._filter_queryset_by_role(request, qs)
    
    def _filter_queryset_by_role(self, request, qs):
        """
        Filter queryset based on user role.
        Override this method in subclasses for role-specific filtering.
        """
        return qs


class AdminOperationsAccessMixin(RoleBasedAdminMixin):
    """
    Mixin for models accessible by Admin and Operations roles.
    """
    
    def _check_role_permission(self, request, permission_type):
        """Admin and Operations have full access."""
        return request.user.groups.filter(name__in=['Admin', 'Operations']).exists()
    
    def _filter_queryset_by_role(self, request, qs):
        """No filtering needed - Admin and Operations see all."""
        return qs


class AdminFinanceOperationsAccessMixin(RoleBasedAdminMixin):
    """
    Mixin for models accessible by Admin, Finance, and Operations roles.
    Finance has view/change only, Admin and Operations have full access.
    """
    
    def _check_role_permission(self, request, permission_type):
        """Check permissions based on role."""
        user_groups = request.user.groups.values_list('name', flat=True)
        
        # Admin and Operations have full access
        if 'Admin' in user_groups or 'Operations' in user_groups:
            return True
        
        # Finance has view and change only
        if 'Finance' in user_groups:
            return permission_type in ['view', 'change']
        
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Finance cannot delete."""
        if request.user.is_superuser:
            return True
        
        if request.user.groups.filter(name__in=['Admin', 'Operations']).exists():
            return True
        
        return False
    
    def _filter_queryset_by_role(self, request, qs):
        """No filtering needed - all roles see all records."""
        return qs


class FinanceReadOnlyMixin(RoleBasedAdminMixin):
    """
    Mixin for models that Finance can only view (read-only).
    Admin and Operations have full access.
    """
    
    def _check_role_permission(self, request, permission_type):
        """Check permissions based on role."""
        user_groups = request.user.groups.values_list('name', flat=True)
        
        # Admin and Operations have full access
        if 'Admin' in user_groups or 'Operations' in user_groups:
            return True
        
        # Finance has view only
        if 'Finance' in user_groups:
            return permission_type == 'view'
        
        return False
    
    def has_add_permission(self, request):
        """Finance cannot add."""
        if request.user.is_superuser or request.user.groups.filter(name__in=['Admin', 'Operations']).exists():
            return True
        return False
    
    def has_change_permission(self, request, obj=None):
        """Finance cannot change."""
        if request.user.is_superuser or request.user.groups.filter(name__in=['Admin', 'Operations']).exists():
            return True
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Finance cannot delete."""
        if request.user.is_superuser or request.user.groups.filter(name__in=['Admin', 'Operations']).exists():
            return True
        return False
    
    def _filter_queryset_by_role(self, request, qs):
        """No filtering needed."""
        return qs
