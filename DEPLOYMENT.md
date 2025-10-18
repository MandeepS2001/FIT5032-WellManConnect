# Deployment Guide for WellMan Connect

This guide covers deploying the WellMan Connect application to various cloud platforms to meet Business Requirement D.4.

## Prerequisites

1. **Firebase Project Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Get your Firebase configuration

2. **SendGrid Account Setup**
   - Create a SendGrid account at [SendGrid](https://sendgrid.com/)
   - Generate an API key
   - Verify your sender identity

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef

# SendGrid Configuration
VITE_SENDGRID_API_KEY=SG.your-sendgrid-api-key

# Application Configuration
VITE_APP_NAME=WellMan Connect
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all the environment variables from your `.env` file

4. **Custom Domain (Optional)**
   - Add your custom domain in Vercel Dashboard
   - Configure DNS settings

### Option 2: Netlify

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Configure environment variables in Netlify Dashboard

3. **Custom Domain (Optional)**
   - Add your custom domain in Netlify Dashboard
   - Configure DNS settings

### Option 3: Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```

3. **Configure firebase.json**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Option 4: Google Cloud Platform

1. **Install Google Cloud SDK**
   - Download from [Google Cloud SDK](https://cloud.google.com/sdk)

2. **Create a new project**
   ```bash
   gcloud projects create wellman-connect-prod
   gcloud config set project wellman-connect-prod
   ```

3. **Enable required APIs**
   ```bash
   gcloud services enable compute.googleapis.com
   gcloud services enable storage.googleapis.com
   ```

4. **Deploy using Cloud Run**
   ```bash
   # Build and deploy
   gcloud run deploy wellman-connect \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## Post-Deployment Configuration

### 1. Firebase Authentication Setup
- Enable Email/Password authentication in Firebase Console
- Configure authorized domains to include your deployed URL
- Set up password reset email templates

### 2. SendGrid Configuration
- Verify your sender domain in SendGrid
- Set up DNS records for domain authentication
- Configure webhook endpoints (if needed)

### 3. Security Headers
The application includes security headers in `src/utils/security.js`. Ensure your hosting platform supports:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### 4. Performance Optimization
- Enable gzip compression on your hosting platform
- Configure CDN for static assets
- Set up caching headers for assets

## Monitoring and Analytics

### 1. Error Tracking
- Set up Sentry or similar error tracking service
- Monitor application performance

### 2. Analytics
- Integrate Google Analytics or similar
- Monitor user behavior and application usage

### 3. Uptime Monitoring
- Use services like UptimeRobot or Pingdom
- Set up alerts for downtime

## SSL/HTTPS Configuration

All recommended hosting platforms provide free SSL certificates:
- **Vercel**: Automatic SSL with custom domains
- **Netlify**: Automatic SSL with custom domains
- **Firebase Hosting**: Automatic SSL with custom domains
- **Google Cloud**: Configure SSL certificates in Cloud Console

## Backup and Recovery

### 1. Code Backup
- Use Git for version control
- Regular commits and pushes to GitHub

### 2. Database Backup
- Firebase Firestore provides automatic backups
- Configure backup retention policies

### 3. Environment Variables Backup
- Store environment variables securely
- Use password managers or secure vaults

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables Not Loading**
   - Ensure variables start with `VITE_` prefix
   - Check variable names match exactly
   - Restart development server after changes

3. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check network connectivity
   - Ensure Firebase project is active

4. **SendGrid Email Issues**
   - Verify API key is correct
   - Check sender verification status
   - Review SendGrid activity logs

### Performance Issues

1. **Slow Loading**
   - Enable gzip compression
   - Optimize images and assets
   - Use CDN for static content

2. **Bundle Size**
   - Analyze bundle with `npm run build -- --analyze`
   - Remove unused dependencies
   - Use dynamic imports for large components

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different keys for development and production
   - Rotate API keys regularly

2. **Firebase Security Rules**
   - Configure appropriate Firestore security rules
   - Limit user access to their own data
   - Enable authentication for sensitive operations

3. **API Rate Limiting**
   - Implement rate limiting for API calls
   - Monitor for suspicious activity
   - Set up alerts for unusual usage patterns

## Support and Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging environment

2. **Monitoring**
   - Set up application monitoring
   - Monitor error rates and performance
   - Regular security audits

3. **Documentation**
   - Keep deployment documentation updated
   - Document any custom configurations
   - Maintain runbooks for common tasks

## Cost Optimization

1. **Hosting Costs**
   - Monitor usage and costs
   - Use appropriate hosting tiers
   - Consider reserved instances for predictable workloads

2. **API Costs**
   - Monitor Firebase and SendGrid usage
   - Implement caching to reduce API calls
   - Set up usage alerts and limits

This deployment guide ensures your WellMan Connect application is properly deployed to the cloud with all business requirements met.
