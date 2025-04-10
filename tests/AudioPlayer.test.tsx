import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AudioPlayer from '../src/components/audio/AudioPlayer';
import { audioProxyService } from '../src/services/audioProxyService';

// Mock the audioProxyService
jest.mock('../src/services/audioProxyService', () => ({
  audioProxyService: {
    getProxiedAudioUrl: jest.fn(),
  },
}));

// Mock the HTMLMediaElement API
window.HTMLMediaElement.prototype.load = jest.fn();
window.HTMLMediaElement.prototype.play = jest.fn().mockImplementation(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();

describe('AudioPlayer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful proxy
    (audioProxyService.getProxiedAudioUrl as jest.Mock).mockResolvedValue('blob:http://localhost/mock-audio-url');
  });

  test('renders audio player with title', async () => {
    render(<AudioPlayer src="https://example.com/audio.mp3" title="Test Audio" />);
    
    // Check if title is rendered
    expect(screen.getByText('Test Audio')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(audioProxyService.getProxiedAudioUrl).toHaveBeenCalledWith('https://example.com/audio.mp3');
    });
  });

  test('shows loading state while proxying audio', async () => {
    // Delay the proxy resolution
    (audioProxyService.getProxiedAudioUrl as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('blob:http://localhost/mock-audio-url'), 100))
    );
    
    render(<AudioPlayer src="https://example.com/audio.mp3" title="Test Audio" />);
    
    // Loading state should be visible
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(audioProxyService.getProxiedAudioUrl).toHaveBeenCalledWith('https://example.com/audio.mp3');
    });
  });

  test('handles play/pause button click', async () => {
    render(<AudioPlayer src="https://example.com/audio.mp3" title="Test Audio" />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(audioProxyService.getProxiedAudioUrl).toHaveBeenCalled();
    });
    
    // Find play button and click it
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    // Play should have been called
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    
    // Find pause button (after state change) and click it
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);
    
    // Pause should have been called
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  test('handles proxy error', async () => {
    // Mock proxy error
    (audioProxyService.getProxiedAudioUrl as jest.Mock).mockRejectedValue(new Error('Proxy error'));
    
    const onErrorMock = jest.fn();
    render(<AudioPlayer src="https://example.com/audio.mp3" title="Test Audio" onError={onErrorMock} />);
    
    // Wait for error to be handled
    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
      expect(screen.getByText(/failed to load audio file/i)).toBeInTheDocument();
    });
  });

  test('handles download button click', async () => {
    // Mock document.createElement and other DOM methods
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor;
      return document.createElement(tag);
    });
    
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    
    render(<AudioPlayer src="https://example.com/audio.mp3" title="Test Audio" />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(audioProxyService.getProxiedAudioUrl).toHaveBeenCalled();
    });
    
    // Find download button and click it
    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);
    
    // Check if download was triggered
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAnchor.download).toBe('test_audio.mp3');
  });
});
