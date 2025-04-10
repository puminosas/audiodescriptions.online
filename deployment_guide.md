# Deployment Guide for AudioDescriptions.online

This guide provides step-by-step instructions for deploying the AudioDescriptions.online application to production.

## Prerequisites

- Node.js 16+ and npm
- Supabase account
- Google Cloud account with Text-to-Speech API enabled
- OpenAI API key
- Git

## Environment Variables

Before deployment, ensure you have the following environment variables configured:

```
SUPABASE_URL=https://your-supabase-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
OPENAI_API_KEY=your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
GCS_BUCKET_NAME=your-gcs-bucket-name
GCS_PROJECT_ID=your-gcs-project-id
```

## Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/audiodescriptions.online.git
   cd audiodescriptions.online
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the environment variables listed above.

4. Start the development server:
   ```
   npm run dev
   ```

5. The application will be available at `http://localhost:5173`.

## Supabase Edge Functions Deployment

1. Install Supabase CLI:
   ```
   npm install -g supabase
   ```

2. Login to Supabase:
   ```
   supabase login
   ```

3. Link your project:
   ```
   supabase link --project-ref your-project-ref
   ```

4. Deploy the Edge Functions:
   ```
   supabase functions deploy generate-description
   supabase functions deploy audio-proxy
   ```

## Production Deployment with Render.com

1. Create a new Web Service on Render.com.

2. Connect your GitHub repository.

3. Configure the following settings:
   - **Name**: audiodescriptions-online
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

4. Add all the environment variables listed above in the Environment section.

5. Click "Create Web Service".

6. Your application will be deployed to a URL like `https://audiodescriptions-online.onrender.com`.

## Post-Deployment Verification

After deployment, verify the following functionality:

1. Text-to-Audio generation
2. Admin panel access
3. Feedback submission
4. Audio playback across different browsers

## Troubleshooting

If you encounter issues after deployment:

1. **CORS Errors**: Ensure the audio-proxy Edge Function is properly deployed and accessible.

2. **Environment Variables**: Verify all environment variables are correctly set in your production environment.

3. **API Limits**: Check if you've reached any API limits for OpenAI or Google Cloud.

4. **Console Errors**: Use browser developer tools to check for any JavaScript errors.

## Updating the Application

To update the application:

1. Push changes to your GitHub repository.

2. Render.com will automatically deploy the new version.

3. For Edge Functions, redeploy them using the Supabase CLI:
   ```
   supabase functions deploy function-name
   ```

## Support

If you need assistance, please contact support@audiodescriptions.online.
