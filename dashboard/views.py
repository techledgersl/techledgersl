"""
Views for the dashboard app.
"""
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from .forms import LoginForm
from .decorators import get_user_role, role_required
from services.models import Service
from contact.models import ContactInquiry
from django.contrib.auth.models import User


def login_view(request):
    """
    Login view for internal dashboard access.
    """
    # If user is already logged in, redirect to their dashboard
    if request.user.is_authenticated:
        user_role = get_user_role(request.user)
        if user_role:
            return redirect(f'dashboard:{user_role.lower()}_dashboard')
        return redirect('dashboard:login')
    
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            
            user = authenticate(request, username=username, password=password)
            if user is not None:
                # Check if user has a role (Admin, Finance, or Operations)
                user_role = get_user_role(user)
                if user_role:
                    login(request, user)
                    messages.success(request, f'Welcome, {user.username}!')
                    return redirect(f'dashboard:{user_role.lower()}_dashboard')
                else:
                    messages.error(request, 'Your account does not have an assigned role. Please contact an administrator.')
            else:
                messages.error(request, 'Invalid username or password.')
    else:
        form = LoginForm()
    
    return render(request, 'dashboard/login.html', {'form': form})


@login_required(login_url='dashboard:login')
def dashboard_home(request):
    """
    Dashboard home - redirects to role-specific dashboard.
    """
    user_role = get_user_role(request.user)
    if user_role:
        return redirect(f'dashboard:{user_role.lower()}_dashboard')
    messages.error(request, 'Your account does not have an assigned role.')
    return redirect('dashboard:login')


@role_required('Admin')
def admin_dashboard(request):
    """
    Admin dashboard with full access.
    """
    # Statistics
    total_services = Service.objects.count()
    total_inquiries = ContactInquiry.objects.count()
    new_inquiries = ContactInquiry.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=7)
    ).count()
    total_users = User.objects.count()
    
    # Recent data
    recent_services = Service.objects.all()[:5]
    recent_inquiries = ContactInquiry.objects.all()[:5]
    
    context = {
        'total_services': total_services,
        'total_inquiries': total_inquiries,
        'new_inquiries': new_inquiries,
        'total_users': total_users,
        'recent_services': recent_services,
        'recent_inquiries': recent_inquiries,
        'user_role': 'Admin',
    }
    return render(request, 'dashboard/admin_dashboard.html', context)


@role_required('Finance')
def finance_dashboard(request):
    """
    Finance dashboard - Contact inquiries and read-only services.
    """
    # Statistics
    total_inquiries = ContactInquiry.objects.count()
    new_inquiries = ContactInquiry.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Inquiries by status
    inquiries_by_status = ContactInquiry.objects.values('status').annotate(
        count=Count('id')
    ).order_by('status')
    
    # Recent inquiries
    recent_inquiries = ContactInquiry.objects.all()[:10]
    
    # Services (read-only)
    services = Service.objects.filter(is_active=True)
    
    context = {
        'total_inquiries': total_inquiries,
        'new_inquiries': new_inquiries,
        'inquiries_by_status': inquiries_by_status,
        'recent_inquiries': recent_inquiries,
        'services': services,
        'user_role': 'Finance',
    }
    return render(request, 'dashboard/finance_dashboard.html', context)


@role_required('Operations')
def operations_dashboard(request):
    """
    Operations dashboard - Services and Contact inquiries management.
    """
    # Statistics
    total_services = Service.objects.count()
    active_services = Service.objects.filter(is_active=True).count()
    total_inquiries = ContactInquiry.objects.count()
    new_inquiries = ContactInquiry.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Recent data
    recent_services = Service.objects.all()[:5]
    recent_inquiries = ContactInquiry.objects.all()[:5]
    
    context = {
        'total_services': total_services,
        'active_services': active_services,
        'total_inquiries': total_inquiries,
        'new_inquiries': new_inquiries,
        'recent_services': recent_services,
        'recent_inquiries': recent_inquiries,
        'user_role': 'Operations',
    }
    return render(request, 'dashboard/operations_dashboard.html', context)


@login_required(login_url='dashboard:login')
def logout_view(request):
    """
    Logout view - clears session and redirects to login.
    """
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('dashboard:login')
