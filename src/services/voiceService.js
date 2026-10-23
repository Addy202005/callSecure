import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

let isMuted = false;
let currentSpeakingState = false;
let onSpeakingChangeListeners = [];

function notifySpeakingChange(isSpeaking, speaker = null) {
  currentSpeakingState = isSpeaking;
  onSpeakingChangeListeners.forEach(listener => {
    try {
      listener(isSpeaking, speaker);
    } catch {}
  });
}

// Distinct acoustic & persona profiles for caller and receiver
export const VOICE_PROFILES = {
  CALLER: {
    role: 'caller',
    label: 'Caller / Suspect (Deep Authoritative Voice)',
    pitch: 0.80, // Audibly deeper, intimidating authority tone
    rate: 0.92,  // Deliberate, forceful pacing
    language: 'en-IN',
    gender: 'male',
    preferredKeywords: [
      'Ravi', 'George', 'David', 'Mark', 'Guy', 'Male', 'Google UK English Male', 'en-IN', 'India'
    ]
  },
  RECEIVER: {
    role: 'receiver',
    label: 'Receiver / Subscriber (Natural Conversational Voice)',
    pitch: 1.22, // Lighter, natural, distinct timbre
    rate: 1.05,  // Conversational tempo
    language: 'en-IN',
    gender: 'female',
    preferredKeywords: [
      'Heera', 'Zira', 'Samantha', 'Victoria', 'Female', 'Google UK English Female', 'Natural'
    ]
  }
};

let cachedWebVoices = [];
let webVoicesLoaded = false;
let cachedNativeVoices = [];
let nativeVoicesLoaded = false;

// Initialize Web Voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  cachedWebVoices = window.speechSynthesis.getVoices() || [];
  window.speechSynthesis.onvoiceschanged = () => {
    cachedWebVoices = window.speechSynthesis.getVoices() || [];
    webVoicesLoaded = true;
  };
}

// Initialize Native Voices
async function initNativeVoices() {
  if (nativeVoicesLoaded) return;
  try {
    cachedNativeVoices = await Speech.getAvailableVoicesAsync();
    nativeVoicesLoaded = true;
  } catch {}
}
initNativeVoices();

function resolveWebVoiceForRole(role) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = (cachedWebVoices && cachedWebVoices.length > 0)
    ? cachedWebVoices
    : (window.speechSynthesis.getVoices() || []);
  
  if (!voices || voices.length === 0) return null;

  const isCaller = role === 'caller' || role === 'suspect' || role === 'CALLER';
  const profile = isCaller ? VOICE_PROFILES.CALLER : VOICE_PROFILES.RECEIVER;

  // 1. Try to match preferred voice keywords
  for (const keyword of profile.preferredKeywords) {
    const match = voices.find(v =>
      v.name.toLowerCase().includes(keyword.toLowerCase()) &&
      (v.lang.startsWith('en') || v.lang.includes('IN'))
    );
    if (match) return match;
  }

  // 2. Separate male / female if keywords exist in voice description
  const genderMatch = voices.find(v =>
    v.name.toLowerCase().includes(profile.gender) && v.lang.startsWith('en')
  );
  if (genderMatch) return genderMatch;

  // 3. Fallback partition: pick first for caller, second for receiver if available
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));
  if (englishVoices.length >= 2) {
    return isCaller ? englishVoices[0] : englishVoices[1];
  }

  return voices[0] || null;
}

function resolveNativeVoiceForRole(role) {
  if (!cachedNativeVoices || cachedNativeVoices.length === 0) return null;
  const isCaller = role === 'caller' || role === 'suspect' || role === 'CALLER';
  const profile = isCaller ? VOICE_PROFILES.CALLER : VOICE_PROFILES.RECEIVER;

  for (const keyword of profile.preferredKeywords) {
    const match = cachedNativeVoices.find(v =>
      (v.name || v.identifier || '').toLowerCase().includes(keyword.toLowerCase())
    );
    if (match) return match.identifier;
  }

  const englishVoices = cachedNativeVoices.filter(v => (v.language || '').startsWith('en'));
  if (englishVoices.length >= 2) {
    const chosen = isCaller ? englishVoices[0] : englishVoices[1];
    return chosen.identifier;
  }

  return cachedNativeVoices[0]?.identifier || null;
}

export const VoiceService = {
  VOICE_PROFILES,

  /**
   * Register a listener for when AI voice starts or stops speaking
   */
  addSpeakingListener(listener) {
    if (typeof listener === 'function') {
      onSpeakingChangeListeners.push(listener);
    }
    return () => {
      onSpeakingChangeListeners = onSpeakingChangeListeners.filter(l => l !== listener);
    };
  },

  /**
   * Set global mute state for AI voice
   */
  setMuted(muted) {
    isMuted = !!muted;
    if (isMuted) {
      this.stop();
    }
  },

  getMuted() {
    return isMuted;
  },

  isSpeaking() {
    return currentSpeakingState;
  },

  /**
   * Stops all in-flight speech synthesis immediately
   */
  stop() {
    notifySpeakingChange(false);

    // Stop Native Speech
    try {
      Speech.stop();
    } catch {}

    // Stop Web Speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  },

  /**
   * Speaks text using distinct AI voices for Caller vs Receiver
   * @param {string} text - The dialogue to speak
   * @param {object} options - Speaker role ('caller' | 'receiver'), pitch, rate, language, callbacks
   */
  async speak(text, options = {}) {
    if (isMuted || !text || !text.trim()) {
      return;
    }

    const cleanText = text.replace(/[*_#`]/g, '').trim();
    if (!cleanText) return;

    this.stop();

    // Determine role (default to caller if not specified)
    const speakerRole = (options.speaker || options.role || 'caller').toLowerCase();
    const isCaller = speakerRole.includes('caller') || speakerRole.includes('suspect');
    const profile = isCaller ? VOICE_PROFILES.CALLER : VOICE_PROFILES.RECEIVER;

    notifySpeakingChange(true, isCaller ? 'Caller' : 'Receiver');

    const rate = typeof options.rate === 'number' ? options.rate : profile.rate;
    const pitch = typeof options.pitch === 'number' ? options.pitch : profile.pitch;
    const language = options.language || profile.language;

    // 1. Web Platform SpeechSynthesis
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        const utterance = new window.SpeechSynthesisUtterance(cleanText);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = language;

        const resolvedVoice = resolveWebVoiceForRole(isCaller ? 'caller' : 'receiver');
        if (resolvedVoice) {
          utterance.voice = resolvedVoice;
        }

        utterance.onstart = () => {
          notifySpeakingChange(true, isCaller ? 'Caller' : 'Receiver');
          if (options.onStart) options.onStart();
        };

        utterance.onend = () => {
          notifySpeakingChange(false);
          if (options.onDone) options.onDone();
        };

        utterance.onerror = () => {
          notifySpeakingChange(false);
          if (options.onError) options.onError();
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('Web SpeechSynthesis error:', err);
      }
    }

    // 2. Native Platform Speech (expo-speech)
    try {
      const nativeVoice = resolveNativeVoiceForRole(isCaller ? 'caller' : 'receiver');
      const speechOptions = {
        language,
        pitch,
        rate,
        onStart: () => {
          notifySpeakingChange(true, isCaller ? 'Caller' : 'Receiver');
          if (options.onStart) options.onStart();
        },
        onDone: () => {
          notifySpeakingChange(false);
          if (options.onDone) options.onDone();
        },
        onError: () => {
          notifySpeakingChange(false);
          if (options.onError) options.onError();
        }
      };

      if (nativeVoice) {
        speechOptions.voice = nativeVoice;
      }

      Speech.speak(cleanText, speechOptions);
    } catch (err) {
      console.warn('expo-speech speak error:', err);
      notifySpeakingChange(false);
    }
  },

  /**
   * Convenience helper to speak as Caller (Deep, authoritative tone)
   */
  speakCaller(text, options = {}) {
    return this.speak(text, { ...options, speaker: 'caller' });
  },

  /**
   * Convenience helper to speak as Receiver / Subscriber (Natural, lighter tone)
   */
  speakReceiver(text, options = {}) {
    return this.speak(text, { ...options, speaker: 'receiver' });
  },

  /**
   * Web Speech Recognition helper for user voice input
   */
  createRecognition(onResult, onEnd, onError) {
    if (typeof window === 'undefined') return null;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return null;

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (onResult) onResult({ final: final.trim(), interim: interim.trim() });
      };

      recognition.onerror = (e) => {
        if (onError) onError(e);
      };

      recognition.onend = () => {
        if (onEnd) onEnd();
      };

      return recognition;
    } catch {
      return null;
    }
  }
};
