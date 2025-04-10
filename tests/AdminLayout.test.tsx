import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminLayout from '../src/components/layout/AdminLayout';
import { useMediaQuery } from '../src/hooks/use-media-query';

// Mock the useMediaQuery hook
jest.mock('../src/hooks/use-media-query', () => ({
  useMediaQuery: jest.fn()
}));

// Mock the useAuth hook
jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    signOut: jest.fn().mockResolvedValue({}),
    user: { email: 'test@example.com' }
  })
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/admin/ai-chat' })
}));

describe('AdminLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to desktop view
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  });

  test('renders admin layout with sidebar and content', () => {
    render(
      <BrowserRouter>
        <AdminLayout>
          <div data-testid="test-content">Test Content</div>
        </AdminLayout>
      </BrowserRouter>
    );
    
    // Check if sidebar is rendered
    expect(screen.getByText('Audio Descriptions')).toBeInTheDocument();
    expect(screen.getByText('Administration Portal')).toBeInTheDocument();
    
    // Check if navigation links are rendered
    expect(screen.getByText('AI Chat')).toBeInTheDocument();
    expect(screen.getByText('Live Analytics')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    
    // Check if content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check if sign out button is rendered
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  test('handles mobile view correctly', () => {
    // Mock mobile view
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>
      </BrowserRouter>
    );
    
    // Check if mobile menu button is rendered
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton).toBeInTheDocument();
    
    // Sidebar should be hidden initially on mobile
    const sidebar = document.querySelector('.transform');
    expect(sidebar).toHaveClass('-translate-x-full');
    
    // Click menu button to open sidebar
    fireEvent.click(menuButton);
    
    // Sidebar should be visible
    expect(sidebar).toHaveClass('translate-x-0');
    
    // Overlay should be visible
    const overlay = screen.getByRole('presentation');
    expect(overlay).toBeInTheDocument();
    
    // Click overlay to close sidebar
    fireEvent.click(overlay);
    
    // Sidebar should be hidden again
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  test('handles sign out correctly', async () => {
    render(
      <BrowserRouter>
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>
      </BrowserRouter>
    );
    
    // Click sign out button
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);
    
    // Check if navigate was called with correct path
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('highlights active route', () => {
    render(
      <BrowserRouter>
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>
      </BrowserRouter>
    );
    
    // AI Chat should be highlighted as active
    const aiChatButton = screen.getByRole('button', { name: /ai chat/i });
    expect(aiChatButton).toHaveClass('bg-secondary');
    
    // Other buttons should not be highlighted
    const analyticsButton = screen.getByRole('button', { name: /live analytics/i });
    expect(analyticsButton).not.toHaveClass('bg-secondary');
  });
});
