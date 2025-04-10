import { createClient } from '@supabase/supabase-js';
import { env } from '@/utils/env';

// Create a Supabase client
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

interface FeedbackData {
  name: string;
  email: string;
  message: string;
  rating: number;
}

/**
 * Service for handling feedback submission with retry logic and validation
 */
export const feedbackService = {
  /**
   * Submit feedback to the Supabase database
   * @param data The feedback data to submit
   * @returns A promise that resolves when the feedback is submitted
   */
  async submitFeedback(data: FeedbackData): Promise<{ success: boolean; message: string }> {
    try {
      // Validate the data
      if (!data.name) {
        throw new Error('Name is required');
      }
      
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('Valid email is required');
      }
      
      if (!data.message || data.message.length < 10) {
        throw new Error('Message must be at least 10 characters');
      }
      
      if (!data.rating || data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      
      // Add retry logic with exponential backoff
      const maxRetries = 3;
      let retryCount = 0;
      let error: Error | null = null;
      
      while (retryCount < maxRetries) {
        try {
          // Insert the feedback into the database
          const { data: insertedData, error: insertError } = await supabase
            .from('feedback')
            .insert([
              {
                name: data.name,
                email: data.email,
                message: data.message,
                rating: data.rating,
                created_at: new Date().toISOString(),
              },
            ]);
          
          if (insertError) {
            throw new Error(insertError.message);
          }
          
          return {
            success: true,
            message: 'Feedback submitted successfully',
          };
        } catch (err) {
          error = err instanceof Error ? err : new Error('Unknown error occurred');
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Exponential backoff: wait 2^retryCount * 1000 ms before retrying
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      }
      
      // If we've exhausted all retries, throw the last error
      throw error || new Error('Failed to submit feedback after multiple attempts');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  },
  
  /**
   * Get all feedback from the Supabase database
   * @returns A promise that resolves to an array of feedback items
   */
  async getAllFeedback(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }
  },
};

export default feedbackService;
