"""
Management command to set up user roles and permissions.
Run: python manage.py setup_roles
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from services.models import Service
from contact.models import ContactInquiry


class Command(BaseCommand):
    help = 'Creates Admin, Finance, and Operations groups with appropriate permissions'

    def handle(self, *args, **options):
        self.stdout.write('Setting up user roles and permissions...')

        # Get content types for models
        service_ct = ContentType.objects.get_for_model(Service)
        contact_ct = ContentType.objects.get_for_model(ContactInquiry)
        user_ct = ContentType.objects.get(app_label='auth', model='user')
        group_ct = ContentType.objects.get(app_label='auth', model='group')

        # Get all permissions for each model
        service_permissions = Permission.objects.filter(content_type=service_ct)
        contact_permissions = Permission.objects.filter(content_type=contact_ct)
        user_permissions = Permission.objects.filter(content_type=user_ct)
        group_permissions = Permission.objects.filter(content_type=group_ct)

        # Create Admin Group
        admin_group, created = Group.objects.get_or_create(name='Admin')
        if created:
            self.stdout.write(self.style.SUCCESS('Created Admin group'))
        else:
            self.stdout.write('Admin group already exists, updating permissions...')
        
        # Admin gets all permissions
        admin_group.permissions.set(
            list(service_permissions) +
            list(contact_permissions) +
            list(user_permissions) +
            list(group_permissions)
        )
        self.stdout.write(self.style.SUCCESS('✓ Admin group configured with full permissions'))

        # Create Finance Group
        finance_group, created = Group.objects.get_or_create(name='Finance')
        if created:
            self.stdout.write(self.style.SUCCESS('Created Finance group'))
        else:
            self.stdout.write('Finance group already exists, updating permissions...')
        
        # Finance: View/Change ContactInquiry, View-only Service
        finance_permissions = []
        finance_permissions.extend(
            Permission.objects.filter(
                content_type=contact_ct,
                codename__in=['view_contactinquiry', 'change_contactinquiry']
            )
        )
        finance_permissions.extend(
            Permission.objects.filter(
                content_type=service_ct,
                codename='view_service'
            )
        )
        finance_group.permissions.set(finance_permissions)
        self.stdout.write(self.style.SUCCESS('✓ Finance group configured with view/change ContactInquiry and view-only Service'))

        # Create Operations Group
        operations_group, created = Group.objects.get_or_create(name='Operations')
        if created:
            self.stdout.write(self.style.SUCCESS('Created Operations group'))
        else:
            self.stdout.write('Operations group already exists, updating permissions...')
        
        # Operations: Full access to Service and ContactInquiry
        operations_permissions = []
        operations_permissions.extend(list(service_permissions))
        operations_permissions.extend(list(contact_permissions))
        operations_group.permissions.set(operations_permissions)
        self.stdout.write(self.style.SUCCESS('✓ Operations group configured with full access to Service and ContactInquiry'))

        self.stdout.write(self.style.SUCCESS('\n✓ All roles have been set up successfully!'))
        self.stdout.write('\nNext steps:')
        self.stdout.write('1. Create users via Django admin: /admin/auth/user/add/')
        self.stdout.write('2. Assign users to appropriate groups')
        self.stdout.write('3. Users can access the system at /admin/')
