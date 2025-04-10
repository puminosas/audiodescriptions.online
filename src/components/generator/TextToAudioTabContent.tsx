import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mic, Play, Upload } from 'lucide-react';
import AudioPlayer from '@/components/audio/AudioPlayer';
import { audioProxyService } from '@/services/audioProxyService';

interface TextToAudioTabContentProps {
  // Add props as needed
}

const TextToAudioTabContent: React.FC<TextToAudioTabContentProps> = () => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [voice, setVoice] = useState('en-US-Neural2-F');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proxiedAudioUrl, setProxiedAudioUrl] = useState<string | null>(null);

  // Available languages and voices
  const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'lt-LT', label: 'Lithuanian' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'es-ES', label: 'Spanish' },
  ];

  const voices = {
    'en-US': [
      { value: 'en-US-Neural2-F', label: 'Female (Neural)' },
      { value: 'en-US-Neural2-M', label: 'Male (Neural)' },
      { value: 'en-US-Standard-F', label: 'Female (Standard)' },
      { value: 'en-US-Standard-M', label: 'Male (Standard)' },
    ],
    'en-GB': [
      { value: 'en-GB-Neural2-F', label: 'Female (Neural)' },
      { value: 'en-GB-Neural2-M', label: 'Male (Neural)' },
    ],
    'lt-LT': [
      { value: 'lt-LT-Standard-A', label: 'Female (Standard)' },
    ],
    'fr-FR': [
      { value: 'fr-FR-Neural2-A', label: 'Female (Neural)' },
      { value: 'fr-FR-Neural2-B', label: 'Male (Neural)' },
    ],
    'de-DE': [
      { value: 'de-DE-Neural2-A', label: 'Female (Neural)' },
      { value: 'de-DE-Neural2-B', label: 'Male (Neural)' },
    ],
    'es-ES': [
      { value: 'es-ES-Neural2-A', label: 'Female (Neural)' },
      { value: 'es-ES-Neural2-B', label: 'Male (Neural)' },
    ],
  };

  // Reset voice when language changes
  useEffect(() => {
    if (voices[language as keyof typeof voices]?.length > 0) {
      setVoice(voices[language as keyof typeof voices][0].value);
    }
  }, [language]);

  // Proxy the audio URL when it changes
  useEffect(() => {
    const proxyAudio = async () => {
      if (audioUrl) {
        try {
          const proxiedUrl = await audioProxyService.getProxiedAudioUrl(audioUrl);
          setProxiedAudioUrl(proxiedUrl);
        } catch (err) {
          console.error('Error proxying audio:', err);
          setError('Failed to load audio file. Please try again.');
        }
      } else {
        setProxiedAudioUrl(null);
      }
    };

    proxyAudio();
  }, [audioUrl]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate audio.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    setProxiedAudioUrl(null);

    try {
      // Call the API to generate audio
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          language,
          voice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
    } catch (err) {
      console.error('Error generating audio:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // For testing purposes, use a sample audio URL
      if (process.env.NODE_ENV === 'development') {
        setAudioUrl('https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Text to Audio</h2>
          <p className="text-muted-foreground">
            Convert your text into natural-sounding audio in multiple languages.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="text">Text</Label>
            <Textarea
              id="text"
              placeholder="Enter the text you want to convert to audio..."
              value={text}
              onChange={handleTextChange}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {text.length} characters (maximum 5000)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="voice">Voice</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger id="voice">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices[language as keyof typeof voices]?.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Generate Audio
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          {proxiedAudioUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Generated Audio</h3>
              <AudioPlayer
                src={proxiedAudioUrl}
                title="Generated Audio"
                onError={(err) => setError(err.message)}
              />
              
              <div className="mt-4">
                <Label htmlFor="embed-code">Embed Code</Label>
                <Input
                  id="embed-code"
                  value={`<audio controls src="${audioUrl}"></audio>`}
                  readOnly
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Copy this code to embed the audio in your website.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TextToAudioTabContent;
