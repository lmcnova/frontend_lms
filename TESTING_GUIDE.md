# Testing Guide

## Quick Testing Steps

### 1. Start the Backend API
Make sure your FastAPI backend is running on `http://localhost:8000`

```bash
# In your backend directory
python main.py
# or
uvicorn main:app --reload
```

### 2. Application is Already Running
Your React app is running at: **http://localhost:3001**

### 3. Test Login Flow

#### Option A: With Real Backend
If you have the backend running with test data:
- Go to http://localhost:3001/login
- Use your test credentials
- Login should redirect to the appropriate dashboard

#### Option B: Create Test Admin First
1. Go to http://localhost:3001/register/admin
2. Fill in:
   - College Name: Test University
   - Email: admin@test.com
   - Student Limit: 100
   - Password: admin123
3. Click Register
4. You'll be redirected to login
5. Login with the credentials you just created

### 4. Check Browser Console
Open browser DevTools (F12) and check Console tab for:
- Login attempt logs
- API responses
- Any errors

### 5. Common Issues & Solutions

#### Issue: "Login successful but no redirect"
**Check:**
1. Browser console for errors
2. Network tab - did the API call succeed?
3. Application tab -> Local Storage -> Check if token is saved

**Solution:**
- The login now has console logs to debug
- Check if `result.success` is true
- Check if `result.role` has a value

#### Issue: "401 Unauthorized" or "Network Error"
**Solution:**
- Make sure backend is running on port 8000
- Check CORS settings in backend
- Verify `.env` file has correct API URL

#### Issue: "Cannot read properties of undefined"
**Solution:**
- Backend might be returning different data structure
- Check browser Network tab for actual response
- API might need CORS configuration

### 6. Debugging Login

The login flow now has extensive logging:

```javascript
// You'll see in console:
"Attempting login with: { email: 'admin@test.com' }"
"Login result: { success: true, role: 'admin', user: {...} }"
// If successful, you should see redirect
```

### 7. Testing Each Role

#### Admin Testing:
```
Email: admin@test.com
Password: admin123
Expected: Redirect to /admin/dashboard
Should see: Stats for students, teachers, courses
```

#### Teacher Testing:
```
Email: teacher@test.com
Password: teacher123
Expected: Redirect to /teacher/dashboard
Should see: Course stats and quick actions
```

#### Student Testing:
```
Email: student@test.com
Password: student123
Expected: Redirect to /student/dashboard
Should see: Enrolled courses and progress
```

### 8. What to Check After Login

1. **URL should change** to `/admin/dashboard`, `/teacher/dashboard`, or `/student/dashboard`
2. **Sidebar should appear** with role-specific menu items
3. **Navbar should show** your user avatar and name
4. **Dashboard stats** should load (might be 0 if no data)

### 9. Backend API Requirements

Your backend should return this structure for login:

```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "role": "admin",
  "user_data": {
    "uuid_id": "...",
    "email_id": "admin@test.com",
    "college_name": "Test University",
    // other user-specific fields
  }
}
```

### 10. Manual Testing Checklist

- [ ] Can register new admin
- [ ] Can login with admin account
- [ ] Redirects to correct dashboard
- [ ] Sidebar shows correct menu items
- [ ] Can logout successfully
- [ ] Theme toggle works (dark/light)
- [ ] Navbar dropdown shows user info
- [ ] Protected routes work (try accessing /admin without login)
- [ ] Different roles see different dashboards

### 11. Test API Connection

Open browser console and run:
```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => console.log('Backend status:', d))
```

Should return: `{ "status": "healthy" }`

### 12. Clear Cache if Issues Persist

If you encounter persistent issues:
```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## Current Application Status

✅ **Working:**
- Login page with validation
- Admin registration
- Protected routes
- Role-based navigation
- Theme switching
- Dashboard layouts for all 3 roles

⏳ **Needs Backend:**
- Actual login authentication
- User data fetching
- Course data
- Progress tracking
- All CRUD operations

---

## Next Steps After Login Works

1. Test navigation between pages
2. Verify API calls in dashboards work
3. Test logout functionality
4. Begin building CRUD pages
5. Test with multiple user accounts
