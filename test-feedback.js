// Test script for feedback system
import { submitFeedback, validateFeedback } from './utils/supabase/feedbackService';

// Mock data for testing
const validFeedback = {
  user_id: 'test-user-id',
  email: 'test@example.com',
  type: 'suggestion',
  message: 'This is a test feedback message that is long enough to pass validation',
  status: 'new'
};

const invalidFeedback = {
  user_id: 'test-user-id',
  email: 'invalid-email',
  type: 'unknown-type',
  message: '',
  status: 'new'
};

// Test validation function
console.log('Testing feedback validation...');
const validResult = validateFeedback(validFeedback);
console.log('Valid feedback validation result:', validResult);

const invalidResult = validateFeedback(invalidFeedback);
console.log('Invalid feedback validation result:', invalidResult);

// Test submission function (commented out to avoid actual API calls)
/*
async function testSubmission() {
  console.log('Testing feedback submission...');
  
  try {
    const result = await submitFeedback(validFeedback);
    console.log('Submission result:', result);
  } catch (error) {
    console.error('Submission error:', error);
  }
}

testSubmission();
*/

console.log('Feedback system test complete');
