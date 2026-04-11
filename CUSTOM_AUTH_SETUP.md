# Custom Username/Password Auth (No Email)

## ✅ What Changed

Switched from Supabase email auth (which has rate limits) to **custom username/password auth** that stores credentials in the database.

### Why?
- Email signups are disabled in your Supabase project
- Email verification would require confirmation emails
- Email rate limits blocked sign-ups

### Solution
- Completely independent auth system
- Uses Supabase database only
- No emails at all
- Instant account creation ⚡

---

## 🚀 Quick Start

### 1. Run SQL Migration

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS username_format_check 
  CHECK (username IS NULL OR (username ~ '^[a-z0-9_-]+$' AND length(username) >= 3));
```

(Full migration in `CUSTOM_AUTH_SCHEMA.md`)

### 2. Restart Dev Server

```bash
npm run dev
```

### 3. Try It!

1. Click "Sign in"
2. Click "Sign up"
3. Enter username, password, name
4. Boom! Instant account creation 🎉

---

## 📝 Files Changed

### New Files
- `src/lib/customAuth.ts` - Custom auth implementation (no email)
- `CUSTOM_AUTH_SCHEMA.md` - Database migration

### Modified Files
- `src/components/AuthModal.tsx` - Uses custom auth functions
- `src/context/AppContext.tsx` - Checks custom session on init

### Removed from Auth Flow
- ❌ Email verification
- ❌ Magic links
- ❌ OTP
- ❌ Confirmation emails

---

## 🔐 How It Works

### Sign Up Flow
```
User Input (username + password)
    ↓
Validate (3+ chars, 6+ password)
    ↓
Check username available
    ↓
Hash password
    ↓
Store in profiles table
    ↓
Create session token
    ↓
Signed in! ✅
```

### Sign In Flow
```
User Input (username + password)
    ↓
Fetch profile by username
    ↓
Hash password
    ↓
Compare hashes
    ↓
If match: create session
    ↓
Signed in! ✅
```

---

## 🛡️ Security Notes

### Password Hashing
- Uses custom hash algorithm (simple for hackathon)
- **NOT production-grade** - for hackathon use only
- In production: use bcrypt, argon2, or similar

### Session Tokens
- Stored in localStorage
- 24-hour expiration
- Checked on app init

### Credentials
- Stored in `profiles.password_hash` column
- Never logged or exposed
- Only compared during auth

---

## 🧪 Testing Checklist

- [ ] Run SQL migration
- [ ] Restart dev server (`npm run dev`)
- [ ] Sign up with new username
- [ ] Verify instant account creation (no email)
- [ ] Sign out and sign back in
- [ ] Test invalid inputs (username too short, weak password)
- [ ] Verify username shows as `@username` in UI
- [ ] Test guest → signed-in flow
- [ ] Check Network tab - no email requests

---

## ❌ Known Limitations (Hackathon Only)

- Password hashing is not production-grade
- No password reset (no email = no reset flow)
- No email recovery
- Sessions only in browser (no account transfer between devices)

For production: use Supabase with email enabled or auth0/clerk

---

## 🆘 Troubleshooting

### "Username already taken"
- Username exists in database
- Choose a different username

### "Email rate limit exceeded" (should be gone now)
- Old error, shouldn't appear with custom auth
- If still seeing: clear localStorage and try again

### "Invalid password"
- Password doesn't match stored hash
- Try again or sign up new account

---

## 🎉 Perfect for Hackathons!

✅ No email setup needed
✅ No rate limits
✅ Instant account creation
✅ Simple username/password
✅ Works offline (mostly)

You're all set! Start building! 🚀
