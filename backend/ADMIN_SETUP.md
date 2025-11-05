# Admin Setup Guide

## 🔐 Creating the First Admin User

### Method 1: Using the Script (Recommended for First Setup)

Run the admin creation script:

```bash
npm run create-admin
```

**Default Credentials:**
- Email: `admin@alumni.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the default password immediately after first login!

### Method 2: Using Environment Variables (Secure)

For production or custom credentials, set environment variables in your `.env` file:

```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Your Admin Name
```

Then run:
```bash
npm run create-admin
```

### Method 3: Using the Admin Dashboard (After First Admin)

Once you have at least one admin account:

1. Login as admin
2. Navigate to Admin Dashboard
3. Click "Create Admin" button
4. Fill in the form with new admin details
5. Submit

## 🛡️ Security Best Practices

### ✅ DO:
- Change default password immediately after first login
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Keep admin credentials secure and private
- Regularly audit admin accounts
- Remove inactive admin accounts
- Use environment variables for production

### ❌ DON'T:
- Share admin credentials
- Use default passwords in production
- Commit credentials to version control
- Create unnecessary admin accounts
- Use weak or common passwords

## 📋 Admin Privileges

Admin users can:
- ✅ View all users, students, and alumni
- ✅ Verify/unverify users
- ✅ Approve/reject events
- ✅ Create new admin accounts
- ✅ Manage job postings
- ✅ Access all platform features

## 🔄 Password Reset

If you forget the admin password:

1. **Option 1:** Delete the admin user from database and run `npm run create-admin` again
2. **Option 2:** Use another admin account to create a new admin
3. **Option 3:** Manually update the password in the database (requires database access)

## 📊 Accessing Admin Dashboard

After creating admin account:

1. Go to: `http://localhost:5173/login`
2. Enter admin credentials
3. You'll be redirected to: `http://localhost:5173/admin-dashboard`

## 🔍 Troubleshooting

### "Admin user already exists"
- An admin account is already created
- Use the existing credentials to login
- If you forgot the password, see Password Reset section

### "Cannot connect to database"
- Ensure MongoDB is running
- Check your `.env` file has correct `MONGO_URI`
- Verify database connection settings

### "Permission denied"
- Ensure you're logged in as admin
- Check JWT token is valid
- Try logging out and logging in again

## 📝 Notes

- The script uses default credentials if environment variables are not set
- Passwords are automatically hashed before storing in database
- Admin accounts are automatically verified (`isVerified: true`)
- Only admins can create other admin accounts

---

**For security reasons, credentials are not displayed in console output.**
**Keep this file secure and do not commit it with actual credentials!**
