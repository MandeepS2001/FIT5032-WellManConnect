#!/bin/bash

# Setup script for environment variables
echo "🔧 Setting up environment variables for WellMan Connect..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Please edit it manually."
    echo "📋 Current contents:"
    cat .env.local
    exit 0
fi

# Copy template to .env.local
echo "📋 Copying environment template..."
cp env.template .env.local

echo "✅ Environment template copied to .env.local"
echo ""
echo "🔑 Next steps:"
echo "1. Edit .env.local and replace 'your_sendgrid_api_key_here' with your actual SendGrid API key"
echo "2. Restart your development server: npm run dev"
echo ""
echo "📧 To get your SendGrid API key:"
echo "1. Go to https://app.sendgrid.com/"
echo "2. Navigate to Settings → API Keys"
echo "3. Create a new API key with Mail Send permissions"
echo "4. Copy the key and paste it in .env.local"
echo ""
echo "🚀 For Vercel deployment:"
echo "1. Go to your Vercel dashboard"
echo "2. Add VITE_SENDGRID_API_KEY environment variable"
echo "3. Redeploy your application"
echo ""
echo "📖 See EMAIL_SETUP.md for detailed instructions"
