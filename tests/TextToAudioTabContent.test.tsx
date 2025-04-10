import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TextToAudioTabContent from '../src/components/generator/TextToAudioTabContent';
import { audioProxyService } from '../src/services/audioProxyService';

// Mock the audioProxyService
jest.mock('../src/services/audioProxyService', () => ({
  audioProxyService: {
    getProxiedAudioUrl: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('TextToAudioTabContent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ audioUrl: 'https://example.com/audio.mp3' }),
    });
    // Mock successful proxy
    (audioProxyService.getProxiedAudioUrl as jest.Mock).mockResolvedValue('blob:http://localhost/mock-audio-url');
  });

  test('renders text to audio form with all fields', () => {
    render(<TextToAudioTabContent />);
    
    // Check if all form elements are rendered
    expect(screen.getByLabelText(/text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/voice/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate audio/i })).toBeInTheDocument();
  });

  test('validates text input before submission', async () => {
    render(<TextToAudioTabContent />);
    
    // Submit form without entering text
    const generateButton = screen.getByRole('button', { name: /generate audio/i });
    fireEvent.click(generateButton);
    
    // Check for validation error
    expect(screen.getByText(/please enter some text to generate audio/i)).toBeInTheDocument();
    
    // Fetch should not have been called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('generates audio with valid input', async () => {
    render(<TextToAudioTabContent />);
    
    // Enter text
    const textInput = screen.getByLabelText(/text/i);
    fireEvent.change(textInput, { target: { value: 'This is a test message for audio generation.' } });
    
    // Select language
    const languageSelect = screen.getByLabelText(/language/i);
    fireEvent.mouseDown(languageSelect);
    const englishOption = screen.getByText('English (US)');
    fireEvent.click(englishOption);
    
    // Select voice
    const voiceSelect = screen.getByLabelText(/voice/i);
    fireEvent.mouseDown(voiceSelect);
    const femaleVoice = screen.getByText('Female (Neural)');
    fireEvent.click(femaleVoice);
    
    // Submit form
    const generateButton = screen.getByRole('button', { name: /generate audio/i });
    fireEvent.click(generateButton);
    
    // Check for loading state
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
    
    // Check if fetch was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'This is a test message for audio generation.',
          language: 'en-US',
          voice: 'en-US-Neural2-F',
        }),
      });
    });
    
    // Check if audio player is rendered after successful generation
    await waitFor(() => {
      expect(audioProxyService.getProxiedAudioUrl).toHaveBeenCalledWith('https://example.com/audio.mp3');
      expect(screen.getByText(/generated audio/i)).toBeInTheDocument();
    });
    
    // Check if embed code is displayed
    expect(screen.getByLabelText(/embed code/i)).toBeInTheDocument();
    expect(screen.getByText(/copy this code to embed the audio in your website/i)).toBeInTheDocument();
  });

  test('handles API error', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to generate audio' }),
    });
    
    render(<TextToAudioTabContent />);
    
    // Enter text and submit
    const textInput = screen.getByLabelText(/text/i);
    fireEvent.change(textInput, { target: { value: 'This is a test message for audio generation.' } });
    
    const generateButton = screen.getByRole('button', { name: /generate audio/i });
    fireEvent.click(generateButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to generate audio/i)).toBeInTheDocument();
    });
  });

  test('updates voice options when language changes', async () => {
    render(<TextToAudioTabContent />);
    
    // Initially should have English voices
    const voiceSelect = screen.getByLabelText(/voice/i);
    fireEvent.mouseDown(voiceSelect);
    expect(screen.getByText('Female (Neural)')).toBeInTheDocument();
    fireEvent.click(document.body); // Close the dropdown
    
    // Change language to Lithuanian
    const languageSelect = screen.getByLabelText(/language/i);
    fireEvent.mouseDown(languageSelect);
    const lithuanianOption = screen.getByText('Lithuanian');
    fireEvent.click(lithuanianOption);
    
    // Check if voice options updated
    fireEvent.mouseDown(voiceSelect);
    await waitFor(() => {
      expect(screen.queryByText('Female (Neural)')).not.toBeInTheDocument();
      expect(screen.getByText('Female (Standard)')).toBeInTheDocument();
    });
  });
});
