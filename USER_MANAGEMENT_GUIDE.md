# User Management and Login Guide - TechLedger Solutions

## Overview
This guide explains how to add users and how they can log in to access their role-based dashboards in the Django admin interface.

## Prerequisites

### 1. Initialize Roles (First Time Setup)
Before adding users, you need to create the role groups. Run this command once:

```bash
python manage.py setup_roles
```

This creates three groups:
- **Admin** - Full access to everything
- **Finance** - View/change Contact Inquiries, read-only Services
- **Operations** - Full access to Services and Contact Inquiries

### 2. Create a Superuser (If Not Already Created)
You need at least one superuser to manage the system:

```bash
python manage.py createsuperuser
```

Follow the prompts to enter:
- Username
- Email (optional)
- Password

## Adding Users

### Step 1: Access Admin Interface
1. Start your Django development server:
   ```bash
   python manage.py runserver
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000/admin/
   ```

3. Log in with your **superuser** credentials

### Step 2: Verify Groups Exist
Before creating users, make sure the role groups exist:

1. In the Django admin dashboard, look for the **"Authentication and Authorization"** section
2. Click on **"Groups"**
3. You should see three groups:
   - **Admin**
   - **Finance**
   - **Operations**

**If groups are missing**, run this command in your terminal:
```bash
python manage.py setup_roles
```

### Step 3: Create a New User
1. In the Django admin dashboard, look for the **"Authentication and Authorization"** section
2. Click on **"Users"**
3. Click the **"Add User"** button (top right)
4. Fill in the form:
   - **Username**: Enter a unique username (e.g., `john.doe`, `finance.user`)
   - **Password**: Enter a secure password
   - **Password confirmation**: Re-enter the same password
   - **Groups**: You should see a "Groups" field with available groups (Admin, Finance, Operations)
     - Select the appropriate group(s) from the left box
     - Click the **right arrow (→)** to move the group to the right box
5. Click **"Save"**

### Step 4: Assign Role to User (If Not Done During Creation)
If you didn't assign a group during user creation, you can do it now:

1. After creating the user, you'll be redirected to the user edit page (or click on the user to edit)
2. Scroll down to the **"Permissions"** section
3. Find the **"Groups"** field
4. In the **"Available groups"** box (left side), you'll see:
   - Admin
   - Finance
   - Operations
5. Select the appropriate group(s) for the user
6. Click the **right arrow (→)** to move the group to **"Chosen groups"** (right side)
7. Click **"Save"** at the bottom of the page

**Note**: 
- A user can belong to multiple groups, but typically you'll assign one role per user
- If you don't see groups in the dropdown, make sure you've run `python manage.py setup_roles` first

## User Login Process

### Step 1: Navigate to Admin Login
Users should navigate to:
```
http://localhost:8000/admin/
```
(Or your production domain: `https://yourdomain.com/admin/`)

### Step 2: Enter Credentials
1. Enter the **username** you created
2. Enter the **password** you set
3. Click **"Log in"**

### Step 3: Access Role-Based Dashboard
After logging in, users will see a dashboard customized based on their role:

#### Admin Dashboard
- **Services** - Full access (create, edit, delete)
- **Contact Inquiries** - Full access (create, edit, delete)
- **Users** - Full access (create, edit, delete users)
- **Groups** - Full access (manage roles)

#### Finance Dashboard
- **Contact Inquiries** - View and change (can update status, mark as resolved/closed)
- **Services** - Read-only (can view but cannot modify)

**Note**: Finance users cannot see Users or Groups sections.

#### Operations Dashboard
- **Services** - Full access (create, edit, delete, manage display order)
- **Contact Inquiries** - Full access (view, edit, update status)

**Note**: Operations users cannot see Users or Groups sections.

## Example Workflow

### Creating a Finance User
1. Log in as superuser at `/admin/`
2. Go to **Users** → **Add User**
3. Username: `finance.user`
4. Password: `SecurePassword123!`
5. Save
6. In user edit page, assign to **Finance** group
7. Save

### Finance User Login
1. Finance user goes to `/admin/`
2. Enters: `finance.user` / `SecurePassword123!`
3. Sees only:
   - Contact Inquiries (can view and change)
   - Services (read-only)

### Creating an Operations User
1. Log in as superuser at `/admin/`
2. Go to **Users** → **Add User**
3. Username: `ops.user`
4. Password: `SecurePassword123!`
5. Save
6. In user edit page, assign to **Operations** group
7. Save

### Operations User Login
1. Operations user goes to `/admin/`
2. Enters: `ops.user` / `SecurePassword123!`
3. Sees only:
   - Services (full access)
   - Contact Inquiries (full access)

## Troubleshooting

### User Cannot Log In
- Verify the username and password are correct
- Ensure the user account is **active** (check the "Active" checkbox in user edit page)
- Verify the user is assigned to at least one group

### User Doesn't See Expected Models
- Check which group(s) the user belongs to
- Verify the role permissions match the expected access
- Superusers see everything regardless of group membership

### Cannot See Users/Groups Section
- Only **Admin** group members and **superusers** can see Users and Groups
- Finance and Operations users will not see these sections (by design)

### Permission Denied Errors
- Ensure the user is assigned to the correct group
- Run `python manage.py setup_roles` again if groups were deleted
- Check that the user account is active

## Security Notes

- All access is through Django's built-in admin interface at `/admin/`
- No frontend login form is needed
- Users must be authenticated to access the admin
- Permissions are enforced at the model level
- Only Admin group and superusers can manage users and roles

## Quick Reference

| Role | Services | Contact Inquiries | Users/Groups |
|------|----------|-------------------|--------------|
| Admin | Full (CRUD) | Full (CRUD) | Full (CRUD) |
| Finance | Read-only | View/Change | None |
| Operations | Full (CRUD) | Full (CRUD) | None |
| Superuser | Full (CRUD) | Full (CRUD) | Full (CRUD) |
