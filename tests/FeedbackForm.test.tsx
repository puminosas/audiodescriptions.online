import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FeedbackForm from '../src/components/feedback/FeedbackForm';

// Mock fetch
global.fetch = jest.fn();

describe('FeedbackForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  test('renders feedback form with all fields', () => {
    render(
      <BrowserRouter>
        <FeedbackForm />
      </BrowserRouter>
    );
    
    // Check if all form elements are rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
  });

  test('validates form fields on submission', async () => {
    render(
      <BrowserRouter>
        <FeedbackForm />
      </BrowserRouter>
    );
    
    // Submit form without filling any fields
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument();
    });
    
    // Fetch should not have been called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    render(
      <BrowserRouter>
        <FeedbackForm />
      </BrowserRouter>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'This is a test message that is long enough.' } });
    
    // Select rating
    const ratingButton = screen.getByRole('button', { name: '4' });
    fireEvent.click(ratingButton);
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    fireEvent.click(submitButton);
    
    // Check if fetch was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message that is long enough.',
          rating: 4,
        }),
      });
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Server error' }),
    });
    
    render(
      <BrowserRouter>
        <FeedbackForm />
      </BrowserRouter>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'This is a test message that is long enough.' } });
    
    // Select rating
    const ratingButton = screen.getByRole('button', { name: '4' });
    fireEvent.click(ratingButton);
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    // Delay the API response
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true }),
      }), 100))
    );
    
    render(
      <BrowserRouter>
        <FeedbackForm />
      </BrowserRouter>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'This is a test message that is long enough.' } });
    
    // Select rating
    const ratingButton = screen.getByRole('button', { name: '4' });
    fireEvent.click(ratingButton);
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit feedback/i });
    fireEvent.click(submitButton);
    
    // Check for loading state
    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });
});
