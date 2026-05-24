# Quick Fix: Create User Roles (Groups)

## Problem
The Groups field appears when creating users, but the "Available groups" list is empty.

## Solution: Create the Groups

You need to create the role groups first. Here are two ways to do it:

### Method 1: Using Management Command (Recommended)

1. **Open your terminal/command prompt**
2. **Navigate to your project directory:**
   ```bash
   cd C:\Users\THINKPAD\techledger
   ```

3. **Run the setup command:**
   ```bash
   python manage.py setup_roles
   ```

4. **You should see output like:**
   ```
   Setting up user roles and permissions...
   Created Admin group
   ✓ Admin group configured with full permissions
   Created Finance group
   ✓ Finance group configured with view/change ContactInquiry and view-only Service
   Created Operations group
   ✓ Operations group configured with full access to Service and ContactInquiry
   
   ✓ All roles have been set up successfully!
   ```

5. **Refresh your browser** on the "Add user" page
6. **The groups should now appear** in the "Available groups" box

### Method 2: Create Groups Manually in Admin

If the command doesn't work, you can create groups manually:

1. **Go to Django Admin:** `http://localhost:8000/admin/`
2. **Click on "Groups"** (under Authentication and Authorization)
3. **Click "Add Group"** (top right)
4. **Create each group one by one:**

   **Group 1: Admin**
   - Name: `Admin`
   - Click "Save"
   - Then edit the group and assign all permissions (or skip permissions for now)

   **Group 2: Finance**
   - Name: `Finance`
   - Click "Save"

   **Group 3: Operations**
   - Name: `Operations`
   - Click "Save"

5. **Go back to "Add User"** page
6. **Refresh the page** - groups should now appear

## Verify Groups Were Created

1. Go to `/admin/` → **Groups**
2. You should see three groups:
   - Admin
   - Finance
   - Operations

## After Groups Are Created

1. Go back to **Users** → **Add User**
2. Fill in username and password
3. In the **Groups** section, you should now see:
   - **Available groups** (left box): Admin, Finance, Operations
   - **Chosen groups** (right box): (empty)
4. Select a group from the left box
5. Click the **→** arrow to move it to the right box
6. Click **Save**

## Troubleshooting

### Command Not Found Error
If you see "Unknown command: 'setup_roles'":
- Make sure you're in the project root directory
- Make sure Django is installed: `pip install django`
- Try: `python manage.py help` to see available commands

### Groups Still Not Showing
- Make sure you've saved the groups (they exist in the database)
- Refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Restart Django server: Stop (Ctrl+C) and run `python manage.py runserver` again
