# Internal Access Guide - TechLedger Solutions

## Overview
This system provides role-based access control for internal company operations through Django admin interface. No frontend login is required - all access is through `/admin/`.

## Roles

### Admin
- **Full access** to all models (Services, Contact Inquiries, Users, Groups)
- Can create, edit, and delete all records
- Can manage other users and roles

### Finance
- **View and change** Contact Inquiries (can update status, mark as resolved/closed)
- **Read-only** access to Services (for reference only)
- Cannot modify services or manage users

### Operations
- **Full access** to Services (create, edit, delete, manage display order)
- **Full access** to Contact Inquiries (view, edit, update status)
- Cannot manage users or groups

## Setup Instructions

### 1. Initialize Roles
Run the management command to create groups and assign permissions:
```bash
python manage.py setup_roles
```

This will create three groups:
- Admin
- Finance
- Operations

### 2. Create Users
1. Access Django admin at `/admin/`
2. Log in as a superuser
3. Navigate to **Authentication and Authorization > Users**
4. Click **Add User**
5. Enter username and password
6. Save the user

### 3. Assign Roles
1. After creating a user, edit the user
2. Scroll to **Groups** section
3. Select the appropriate group (Admin, Finance, or Operations)
4. Save

## Accessing the System

1. Navigate to `/admin/` in your browser
2. Log in with your username and password
3. You will see only the models you have permission to access

## Permission Matrix

| Model | Admin | Finance | Operations |
|-------|-------|---------|------------|
| Service | Full (CRUD) | Read-only | Full (CRUD) |
| Contact Inquiry | Full (CRUD) | View/Change | Full (CRUD) |
| User | Full (CRUD) | None | None |
| Group | Full (CRUD) | None | None |

## Notes

- Superusers have full access to everything regardless of group membership
- Users must be assigned to at least one group to access the admin interface
- Finance users cannot delete Contact Inquiries
- Finance users cannot modify Services (view-only)
- Operations and Finance users cannot see or manage Users/Groups
