import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import AdminLayout from '../src/components/layout/AdminLayout';

// Mock the hooks
jest.mock('../src/hooks/use-media-query', () => ({
  useMediaQuery: jest.fn()
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    signOut: jest.fn(),
    user: { id: '1', email: 'test@example.com' }
  })
}));

describe('AdminLayout Component', () => {
  beforeEach(() => {
    // Reset mocks
    (useMediaQuery as jest.Mock).mockReset();
  });

  test('renders desktop layout when not on mobile', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    
    render(
      <BrowserRouter>
        <AdminLayout>
          <div data-testid="child-content">Test Content</div>
        </AdminLayout>
      </BrowserRouter>
    );
    
    // Check that the sidebar is visible
    expect(screen.getByText('Audio Descriptions')).toBeInTheDocument();
    expect(screen.getByText('Administration Portal')).toBeInTheDocument();
    
    // Check that the child content is rendered
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    
    // Mobile menu button should not be visible
    const mobileMenuButton = screen.queryByLabelText('Open menu');
    expect(mobileMenuButton).not.toBeVisible();
  });

  test('renders mobile layout with hidden sidebar when on mobile', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <AdminLayout>
          <div data-testid="child-content">Test Content</div>
        </AdminLayout>
      </BrowserRouter>
    );
    
    // Mobile menu button should be visible
    const mobileMenuButton = screen.getByLabelText('Open menu');
    expect(mobileMenuButton).toBeVisible();
    
    // Sidebar should be hidden initially
    expect(screen.getByText('Audio Descriptions')).not.toBeVisible();
    
    // Child content should be visible
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    
    // Click the menu button to show sidebar
    fireEvent.click(mobileMenuButton);
    
    // Sidebar should now be visible
    expect(screen.getByText('Audio Descriptions')).toBeVisible();
    
    // Close button should be visible
    const closeButton = screen.getByLabelText('Close menu');
    expect(closeButton).toBeVisible();
    
    // Click the close button
    fireEvent.click(closeButton);
    
    // Sidebar should be hidden again
    expect(screen.getByText('Audio Descriptions')).not.toBeVisible();
  });
});
