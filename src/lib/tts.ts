import { Language } from './database';
import { I18nService } from './i18n';

export class TTSService {
  private static instance: TTSService;
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean;
  private femaleVoices: Map<Language, SpeechSynthesisVoice | null> = new Map();

  private constructor() {
    this.synth = window.speechSynthesis;
    this.isSupported = 'speechSynthesis' in window;
    this.initializeVoices();
  }

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  private initializeVoices(): void {
    if (!this.isSupported) return;

    const loadVoices = () => {
      const voices = this.synth.getVoices();
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

      // Find female voices for each language
      this.findFemaleVoice('en', voices);
      this.findFemaleVoice('sw', voices);
      this.findFemaleVoice('ki', voices);
    };

    if (this.synth.getVoices().length > 0) {
      loadVoices();
    } else {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  private findFemaleVoice(language: Language, voices: SpeechSynthesisVoice[]): void {
    const languageCode = I18nService.getLanguageCode(language);
    
    // Priority list of female voice names/patterns
    const femalePatterns = [
      'female', 'woman', 'girl', 'samantha', 'alex', 'moira', 'tessa', 'karen', 'victoria',
      'google uk english female', 'google us english female', 'microsoft zira',
      'microsoft hazel', 'google swahili female', 'wavenet'
    ];

    // Find voices that match the language
    const languageVoices = voices.filter(voice => 
      voice.lang.toLowerCase().startsWith(languageCode.toLowerCase().split('-')[0])
    );

    console.log(`Found ${languageVoices.length} voices for ${language}:`, 
      languageVoices.map(v => v.name));

    // Try to find a female voice
    let selectedVoice = null;
    
    for (const pattern of femalePatterns) {
      selectedVoice = languageVoices.find(voice => 
        voice.name.toLowerCase().includes(pattern)
      );
      if (selectedVoice) break;
    }

    // Fallback to first available voice for the language
    if (!selectedVoice && languageVoices.length > 0) {
      selectedVoice = languageVoices[0];
    }

    this.femaleVoices.set(language, selectedVoice);
    console.log(`Selected voice for ${language}:`, selectedVoice?.name || 'None');
  }

  async speak(text: string, language: Language): Promise<void> {
    if (!this.isSupported) {
      console.warn('TTS not supported, falling back to audio files');
      await this.playAudioFallback(text, language);
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Stop any current speech
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set female voice for the language
        const voice = this.femaleVoices.get(language);
        if (voice) {
          utterance.voice = voice;
        }
        
        // Voice settings optimized for female speech
        utterance.lang = I18nService.getLanguageCode(language);
        utterance.pitch = 1.1; // Slightly higher pitch for feminine voice
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.volume = 0.8;

        utterance.onend = () => {
          this.currentUtterance = null;
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('TTS Error:', event.error);
          this.currentUtterance = null;
          // Fallback to audio file
          this.playAudioFallback(text, language).then(resolve).catch(reject);
        };

        utterance.onstart = () => {
          console.log('TTS Started for:', text.substring(0, 50));
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);

      } catch (error) {
        console.error('TTS Error:', error);
        // Fallback to audio file
        this.playAudioFallback(text, language).then(resolve).catch(reject);
      }
    });
  }

  private async playAudioFallback(text: string, language: Language): Promise<void> {
    try {
      // Generate audio using backend service or play pre-recorded fallback
      console.log(`Playing audio fallback for: ${text} (${language})`);
      
      // For now, just log - in production this would call an audio generation service
      // or play pre-recorded female voice audio files
      
      return Promise.resolve();
    } catch (error) {
      console.error('Audio fallback failed:', error);
    }
  }

  stop(): void {
    if (this.isSupported && this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.isSupported ? this.synth.speaking : false;
  }

  async testVoice(language: Language): Promise<void> {
    const testTexts = {
      en: 'Hello! This is Verdan speaking. Welcome to your agricultural protection assistant.',
      sw: 'Hujambo! Hii ni Verdan inayoongea. Karibu kwenye msaidizi wako wa ulinzi wa kilimo.',
      ki: 'Wĩ mwega! Ũyũ nĩ Verdan ũrakwaria. Wamũkĩra kũrĩ mũteithĩrĩri waku wa kũgitĩra ũrĩmi.'
    };

    await this.speak(testTexts[language], language);
  }

  getAvailableVoices(language: Language): SpeechSynthesisVoice[] {
    if (!this.isSupported) return [];
    
    const languageCode = I18nService.getLanguageCode(language);
    return this.synth.getVoices().filter(voice => 
      voice.lang.toLowerCase().startsWith(languageCode.toLowerCase().split('-')[0])
    );
  }

  getCurrentVoice(language: Language): SpeechSynthesisVoice | null {
    return this.femaleVoices.get(language) || null;
  }
}

// Voice button component helper
export class VoiceButtonManager {
  private tts: TTSService;
  private activeButtons: Set<HTMLElement> = new Set();

  constructor() {
    this.tts = TTSService.getInstance();
  }

  addVoiceButton(element: HTMLElement, text: string, language: Language): void {
    const button = this.createVoiceButton();
    element.appendChild(button);

    button.addEventListener('click', async () => {
      // Stop other voices
      this.stopAll();
      
      // Update UI
      this.setButtonState(button, 'speaking');
      
      try {
        await this.tts.speak(text, language);
        this.setButtonState(button, 'idle');
      } catch (error) {
        this.setButtonState(button, 'error');
        setTimeout(() => this.setButtonState(button, 'idle'), 2000);
      }
    });

    this.activeButtons.add(button);
  }

  private createVoiceButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'voice-button ml-2 p-1 rounded-full hover:bg-accent transition-colors';
    button.innerHTML = `
      <svg class="w-4 h-4 text-voice-inactive" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM11.5 3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-13z"/>
      </svg>
    `;
    button.setAttribute('aria-label', 'Listen to text');
    button.setAttribute('title', 'Click to hear this text spoken');
    return button;
  }

  private setButtonState(button: HTMLElement, state: 'idle' | 'speaking' | 'error'): void {
    const svg = button.querySelector('svg');
    if (!svg) return;

    button.classList.remove('voice-active');
    svg.classList.remove('text-voice-active', 'text-voice-inactive', 'text-destructive');

    switch (state) {
      case 'speaking':
        button.classList.add('voice-active');
        svg.classList.add('text-voice-active');
        break;
      case 'error':
        svg.classList.add('text-destructive');
        break;
      default:
        svg.classList.add('text-voice-inactive');
    }
  }

  stopAll(): void {
    this.tts.stop();
    this.activeButtons.forEach(button => {
      this.setButtonState(button, 'idle');
    });
  }

  cleanup(): void {
    this.stopAll();
    this.activeButtons.clear();
  }
}

export const ttsService = TTSService.getInstance();