# 📧 Email Setup Guide - SendGrid Configuration

This guide will help you configure SendGrid email functionality securely without exposing your API key in the code.

## 🔐 Security Issue Resolved

**Problem**: SendGrid automatically detects and revokes API keys that are committed to public repositories.

**Solution**: Use environment variables only - never commit API keys to code.

## 🚀 Setup Instructions

### 1. Create a New SendGrid API Key

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access** (recommended)
5. Give it a name like "WellMan Connect API"
6. Set permissions:
   - ✅ **Mail Send**: Full Access
   - ✅ **Mail Settings**: Read Access (optional)
7. Click **Create & View**
8. **Copy the API key immediately** - you won't be able to see it again!

### 2. Configure Environment Variables

#### For Local Development:
Create a `.env.local` file in your project root:
```bash
# .env.local (DO NOT COMMIT THIS FILE)
VITE_SENDGRID_API_KEY=your_actual_sendgrid_api_key_here
```

#### For Vercel Deployment:
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **FIT5032-WellManConnect** project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `VITE_SENDGRID_API_KEY`
   - **Value**: `your_actual_sendgrid_api_key_here`
   - **Environment**: Production, Preview, Development (select all)
5. Click **Save**

### 3. Verify Sender Email

Make sure your sender email is verified in SendGrid:
1. Go to **Settings** → **Sender Authentication**
2. Verify your email: `mdan0028@student.monash.edu`
3. Complete the verification process

## 🧪 Testing Email Functionality

### Test Methods:
1. **Welcome Email**: Sign up for a new account
2. **Admin Email Composer**: Use the Email Composer in admin panel
3. **Email Service**: Use the Email Service page

### Expected Behavior:
- ✅ **With API Key**: Real emails sent to your inbox
- ⚠️ **Without API Key**: Demo mode with console logs

## 🔍 Troubleshooting

### Common Issues:

1. **"SendGrid API key not configured"**
   - Check environment variable is set correctly
   - Verify the variable name is exactly `VITE_SENDGRID_API_KEY`
   - Restart your development server after adding the variable

2. **"Unauthorized" Error**
   - API key might be revoked by SendGrid
   - Create a new API key and update environment variables

3. **Emails not received**
   - Check spam/junk folder
   - Verify sender email is authenticated in SendGrid
   - Check SendGrid activity feed for delivery status

### Debug Steps:
1. Check browser console for email service logs
2. Check Vercel function logs: `vercel logs --follow`
3. Check SendGrid activity feed in dashboard

## 📝 Important Notes

- **Never commit API keys to code**
- **Use environment variables only**
- **Restart development server after changing .env files**
- **Keep your API key secure and don't share it**

## 🎯 Current Status

After following this guide:
- ✅ API key removed from code
- ✅ Secure environment variable setup
- ✅ SendGrid integration ready
- ✅ Real email functionality enabled

Your emails should now be sent successfully to your inbox! 🎉
