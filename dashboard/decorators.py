"""
Authentication decorators for dashboard access.
"""
from functools import wraps
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages


def get_user_role(user):
    """
    Get the user's role from their groups.
    Returns: 'Admin', 'Finance', 'Operations', or None
    """
    if user.is_superuser:
        return 'Admin'
    
    user_groups = user.groups.values_list('name', flat=True)
    if 'Admin' in user_groups:
        return 'Admin'
    elif 'Finance' in user_groups:
        return 'Finance'
    elif 'Operations' in user_groups:
        return 'Operations'
    
    return None


def role_required(*allowed_roles):
    """
    Decorator to restrict access to specific roles.
    
    Usage:
        @role_required('Admin', 'Finance')
        def my_view(request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapper(request, *args, **kwargs):
            user_role = get_user_role(request.user)
            
            if user_role not in allowed_roles:
                messages.error(request, 'You do not have permission to access this page.')
                # Redirect to their role-specific dashboard or login
                if user_role:
                    return redirect(f'dashboard:{user_role.lower()}_dashboard')
                return redirect('dashboard:login')
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def dashboard_login_required(view_func):
    """
    Decorator to require authentication for dashboard access.
    Redirects to login if not authenticated.
    """
    @wraps(view_func)
    @login_required(login_url='dashboard:login')
    def wrapper(request, *args, **kwargs):
        return view_func(request, *args, **kwargs)
    return wrapper
