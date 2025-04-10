// This file contains environment variable validation to ensure all required variables are present
// and properly formatted before the application starts.

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Supabase Configuration
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_DB_URL: z.string().min(1, 'SUPABASE_DB_URL is required'),
  
  // OpenAI Configuration
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  
  // Google Cloud Configuration
  GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
  GOOGLE_APPLICATION_CREDENTIALS_JSON: z.string().min(1, 'GOOGLE_APPLICATION_CREDENTIALS_JSON is required'),
  GCS_BUCKET_NAME: z.string().min(1, 'GCS_BUCKET_NAME is required'),
  GCS_PROJECT_ID: z.string().min(1, 'GCS_PROJECT_ID is required'),
  
  // Optional configurations with defaults
  WS_URL: z.string().optional(),
  FLASK_ENV: z.enum(['development', 'production']).default('production'),
});

// Type for validated environment variables
export type EnvVariables = z.infer<typeof envSchema>;

// Function to validate environment variables
export function validateEnv(): EnvVariables {
  try {
    // For development environment, use import.meta.env
    // For production, use window.env if available (injected at build time)
    const env = typeof window !== 'undefined' && window.env 
      ? window.env 
      : {
          SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
          SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
          SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
          SUPABASE_DB_URL: import.meta.env.VITE_SUPABASE_DB_URL,
          OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
          GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY,
          GOOGLE_APPLICATION_CREDENTIALS_JSON: import.meta.env.VITE_GOOGLE_APPLICATION_CREDENTIALS_JSON,
          GCS_BUCKET_NAME: import.meta.env.VITE_GCS_BUCKET_NAME,
          GCS_PROJECT_ID: import.meta.env.VITE_GCS_PROJECT_ID,
          WS_URL: import.meta.env.VITE_WS_URL,
          FLASK_ENV: import.meta.env.VITE_FLASK_ENV,
        };
    
    // Provide fallback values for development if needed
    if (import.meta.env.DEV) {
      // Only apply these fallbacks in development mode
      if (!env.SUPABASE_URL) env.SUPABASE_URL = 'https://your-supabase-project-id.supabase.co';
      if (!env.SUPABASE_ANON_KEY) env.SUPABASE_ANON_KEY = 'your-supabase-anon-key';
      // Add other fallbacks as needed
    }
    
    // Parse and validate environment variables
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment variable validation failed:');
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Application cannot start due to missing or invalid environment variables');
    }
    throw error;
  }
}

// Add this to the global Window interface
declare global {
  interface Window {
    env?: Record<string, string>;
  }
}

// Export validated environment variables
export const env = validateEnv();

export default env;
