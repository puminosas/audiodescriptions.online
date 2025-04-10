import { supabase } from '@/integrations/supabase/client';

/**
 * Type definition for feedback data
 */
export type FeedbackData = {
  user_id: string | null;
  email: string | null;
  type: 'suggestion' | 'bug' | 'other';
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
};

/**
 * Validates feedback data before submission
 * @param data The feedback data to validate
 * @returns An object containing validation result and any error messages
 */
export const validateFeedback = (data: Partial<FeedbackData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if message is provided and not empty
  if (!data.message || data.message.trim().length === 0) {
    errors.push('Feedback message is required');
  } else if (data.message.trim().length < 10) {
    errors.push('Feedback message must be at least 10 characters long');
  }

  // Check if type is valid
  if (!data.type || !['suggestion', 'bug', 'other'].includes(data.type)) {
    errors.push('Valid feedback type is required');
  }

  // If email is provided, validate it
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push('Please provide a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Submits feedback to the database with improved error handling and retry mechanism
 * @param data The feedback data to submit
 * @returns A promise that resolves to the result of the operation
 */
export const submitFeedback = async (data: FeedbackData) => {
  // Validate the feedback data
  const validation = validateFeedback(data);
  if (!validation.isValid) {
    return {
      success: false,
      error: {
        message: 'Validation failed',
        details: validation.errors
      }
    };
  }

  // Implement retry mechanism
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < maxRetries) {
    try {
      // Add timestamps
      const now = new Date().toISOString();
      const feedbackData = {
        ...data,
        created_at: now,
        updated_at: now
      };

      // Insert feedback into the database
      const { data: result, error } = await supabase
        .from('feedback')
        .insert(feedbackData);

      if (error) throw error;

      return {
        success: true,
        data: result
      };
    } catch (error) {
      lastError = error;
      retryCount++;
      
      // Log the error
      console.error(`Attempt ${retryCount}/${maxRetries} failed:`, error);
      
      // Wait before retrying (exponential backoff)
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 500; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  return {
    success: false,
    error: {
      message: 'Failed to submit feedback after multiple attempts',
      details: lastError
    }
  };
};

/**
 * Fetches feedback entries with pagination
 * @param page The page number (starting from 1)
 * @param pageSize The number of items per page
 * @returns A promise that resolves to the paginated feedback entries
 */
export const getFeedbackEntries = async (page = 1, pageSize = 10) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      }
    };
  } catch (error) {
    console.error('Error fetching feedback entries:', error);
    return {
      success: false,
      error: {
        message: 'Failed to fetch feedback entries',
        details: error
      }
    };
  }
};

/**
 * Updates the status of a feedback entry
 * @param id The ID of the feedback entry to update
 * @param status The new status
 * @param adminNotes Optional admin notes to add
 * @returns A promise that resolves to the result of the operation
 */
export const updateFeedbackStatus = async (
  id: string,
  status: 'new' | 'in_progress' | 'resolved' | 'closed',
  adminNotes?: string
) => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return {
      success: false,
      error: {
        message: 'Failed to update feedback status',
        details: error
      }
    };
  }
};
