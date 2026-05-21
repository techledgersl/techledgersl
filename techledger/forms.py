"""
Custom forms for TechLedger admin.
"""
from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User, Group


class CustomUserCreationForm(UserCreationForm):
    """
    Custom user creation form with role selection.
    """
    ROLE_CHOICES = [
        ('', 'Select a Role'),
        ('Admin', 'Admin'),
        ('Finance', 'Finance'),
        ('Operations', 'Operations'),
    ]
    
    role = forms.ChoiceField(
        choices=ROLE_CHOICES,
        required=True,
        label='Role',
        help_text='Select the user role. This will automatically assign the user to the appropriate group.',
        widget=forms.Select(attrs={
            'class': 'form-control',
        })
    )
    
    class Meta:
        model = User
        fields = ('username', 'password1', 'password2', 'role')
    
    def save(self, commit=True):
        """Save the user and assign to the selected role group."""
        user = super().save(commit=commit)
        
        # Get the selected role from cleaned_data
        role = self.cleaned_data.get('role', '')
        if role and commit:
            # Clear existing groups and assign the selected role
            user.groups.clear()
            try:
                group = Group.objects.get(name=role)
                user.groups.add(group)
            except Group.DoesNotExist:
                # If group doesn't exist, create it (shouldn't happen if setup_roles was run)
                pass
        
        return user


class CustomUserChangeForm(UserChangeForm):
    """
    Custom user change form with role selection for editing existing users.
    """
    ROLE_CHOICES = [
        ('', 'Select a Role'),
        ('Admin', 'Admin'),
        ('Finance', 'Finance'),
        ('Operations', 'Operations'),
    ]
    
    role = forms.ChoiceField(
        choices=ROLE_CHOICES,
        required=False,
        label='Role',
        help_text='Select the user role. This will automatically assign the user to the appropriate group.',
        widget=forms.Select(attrs={
            'class': 'form-control',
        })
    )
    
    class Meta:
        model = User
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set initial role value from user's groups
        if self.instance and self.instance.pk:
            user_groups = self.instance.groups.all()
            if user_groups.exists():
                # Get the first group name (assuming one role per user)
                group_name = user_groups.first().name
                if group_name in ['Admin', 'Finance', 'Operations']:
                    self.fields['role'].initial = group_name
    
    def save(self, commit=True):
        """Save the user and update role group assignment."""
        user = super().save(commit=commit)
        
        # Get the selected role from cleaned_data
        role = self.cleaned_data.get('role', '')
        if commit:
            if role:
                # Clear existing groups and assign the selected role
                user.groups.clear()
                try:
                    group = Group.objects.get(name=role)
                    user.groups.add(group)
                except Group.DoesNotExist:
                    pass
            else:
                # If role is cleared, remove all groups
                user.groups.clear()
        
        return user
