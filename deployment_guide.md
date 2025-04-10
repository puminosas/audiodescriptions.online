# AudioDescriptions.online Project Deployment Guide

This document provides instructions for deploying the improved AudioDescriptions.online project.

## Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- A Supabase account with the existing project
- Google Cloud Platform account with TTS API enabled
- OpenAI API key

## Project Structure

The project has been improved with:

1. **Responsive Design**: All components now properly adapt to different screen sizes
2. **Enhanced AI Assistant**: The assistant can now access and analyze files while respecting security constraints
3. **Improved Error Handling**: Better error handling throughout the application
4. **Comprehensive Tests**: Unit tests for all major components

## Deployment Steps

### 1. Local Setup and Testing

```bash
# Clone the repository
git clone <your-repository-url>
cd audio-description-magic

# Install dependencies
npm install

# Run tests to verify functionality
npm test

# Start development server
npm run dev
```

### 2. Environment Configuration

Ensure all environment variables are properly set in your deployment platform:

```
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SUPABASE_DB_URL=<your-supabase-db-url>
OPENAI_API_KEY=<your-openai-api-key>
GOOGLE_API_KEY=<your-google-api-key>
GOOGLE_APPLICATION_CREDENTIALS_JSON=<your-google-credentials-json>
GCS_BUCKET_NAME=<your-gcs-bucket-name>
GCS_PROJECT_ID=<your-gcs-project-id>
```

### 3. Building for Production

```bash
# Build the project
npm run build

# Test the production build locally
npm run preview
```

### 4. Deploying to Render.com

1. Log in to your Render.com account
2. Create a new Web Service
3. Connect to your GitHub repository
4. Configure the service:
   - Name: audiodescriptions-online
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
5. Add all environment variables from step 2
6. Deploy the service

### 5. Supabase Edge Functions

The project uses Supabase Edge Functions for serverless functionality. Deploy them using:

```bash
# Navigate to the supabase functions directory
cd supabase/functions

# Deploy the generate-description function
supabase functions deploy generate-description --project-ref <your-project-ref>

# Deploy other functions as needed
```

### 6. Post-Deployment Verification

After deployment, verify:

1. The application loads correctly on desktop and mobile devices
2. User authentication works
3. The AI assistant can access and analyze files
4. Audio generation functionality works correctly
5. Feedback system is operational

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure all API keys are correctly set in environment variables
2. **CORS Errors**: Check Supabase configuration for proper CORS settings
3. **File Access Problems**: Verify file permissions in the AI assistant
4. **Mobile Layout Issues**: Test on various device sizes using browser dev tools

### Support

For additional support, contact the development team or refer to the project documentation.

## Maintenance

Regular maintenance tasks:

1. Update dependencies monthly
2. Monitor API usage and costs
3. Review and update AI prompts as needed
4. Check for security vulnerabilities
5. Backup database regularly
