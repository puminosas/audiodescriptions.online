
import React from 'react';
import DescriptionInput from './DescriptionInput';
import LanguageVoiceSelector from './LanguageVoiceSelector';
import { LanguageOption, VoiceOption } from '@/utils/audio';
import { useAudioInput } from './audio-input/useAudioInput';
import GenerateButton from './audio-input/GenerateButton';

interface TextToAudioTabProps {
  onGenerate: (formData: {
    text: string;
    language: LanguageOption;
    voice: VoiceOption;
  }) => Promise<void>;
  loading: boolean;
  user: any;
}

const TextToAudioTab = ({ onGenerate, loading, user }: TextToAudioTabProps) => {
  const {
    text,
    setText,
    selectedLanguage,
    selectedVoice,
    handleTextChange,
    handleSelectLanguage,
    handleSelectVoice,
    handleSubmit,
    isDisabled
  } = useAudioInput({ onGenerate, loading, user });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">AI Audio Description Generator</h2>
        <p className="text-muted-foreground mb-4">Enter a product name or brief description to generate an AI-powered audio description</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DescriptionInput 
          value={text} 
          onChange={handleTextChange}
          placeholder="Enter a product name or brief description (e.g., 'Wireless Noise-Cancelling Headphones')"
        />
        
        <LanguageVoiceSelector 
          selectedLanguage={selectedLanguage}
          selectedVoice={selectedVoice}
          onSelectLanguage={handleSelectLanguage}
          onSelectVoice={handleSelectVoice}
        />
      </div>

      <div className="flex justify-end">
        <GenerateButton 
          onClick={handleSubmit}
          isDisabled={isDisabled}
          isLoading={loading}
          hasUser={!!user}
          hasText={!!text.trim()}
          buttonText="Generate Audio Description"
        />
      </div>
    </div>
  );
};

export default TextToAudioTab;
