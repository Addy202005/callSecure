import { PhraseDetectionService } from './phraseDetectionService';

// In React Native development, configure BACKEND_URL to your server (e.g. 10.0.2.2 for Android emulator or localhost for iOS)
let API_BASE_URL = 'http://localhost:3000';

export const ApiService = {
  setBaseUrl(url) {
    API_BASE_URL = url;
  },

  getBaseUrl() {
    return API_BASE_URL;
  },

  /**
   * Analyzes live call transcript with server-side AI (BERT / Heuristic Server),
   * with resilient on-device heuristic fallback.
   */
  async analyzeTranscript(transcript, callerPhone, callerName, currentStep) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${API_BASE_URL}/api/call/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          callerPhone,
          callerName,
          currentStep
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          source: 'SERVER_AI_BERT'
        };
      }
    } catch (e) {
      // Graceful on-device fallback
      // console.log('Using on-device fraud analysis engine fallback:', e.message);
    }

    // Local On-Device Fallback using PhraseDetectionService
    const fullText = (transcript || []).map(t => t.text).join(' ');
    const phraseAnalysis = PhraseDetectionService.scanText(fullText);
    const score = phraseAnalysis.stats.riskScore;

    let riskLevel = 'SAFE';
    if (score >= 70) riskLevel = 'CRITICAL';
    else if (score >= 40) riskLevel = 'HIGH';
    else if (score >= 20) riskLevel = 'MEDIUM';

    const detectedThreats = phraseAnalysis.flaggedPhrases.map(p => p.categoryLabel);

    return {
      riskScore: score,
      riskLevel,
      scamType: detectedThreats[0] || (riskLevel === 'SAFE' ? 'Normal / Non-Threatening' : 'Suspicious Telephony Activity'),
      threatIndicators: detectedThreats,
      flaggedTokens: phraseAnalysis.flaggedPhrases,
      tokenizedSegments: phraseAnalysis.tokenizedSegments,
      reasoning: phraseAnalysis.flaggedPhrases.length > 0
        ? `Detected coercive triggers: ${detectedThreats.join(', ')}.`
        : 'Conversation flow appears typical with no high-risk extortion cues.',
      recommendedAction: riskLevel === 'CRITICAL'
        ? 'IMMEDIATELY DISCONNECT. Genuine law enforcement or banks never conduct legal actions or request OTPs over video/voice calls.'
        : riskLevel === 'HIGH'
        ? 'Exercise extreme caution. Do not share OTPs, bank numbers, or agree to video call isolation.'
        : 'Standard call safety practices apply.',
      source: 'ON_DEVICE_FALLBACK'
    };
  },

  /**
   * Real-time stream chunk / token analysis
   */
  async streamChunk(text) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch(`${API_BASE_URL}/api/call/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback to local on-device
    }

    const localScan = PhraseDetectionService.scanText(text);
    return {
      riskScore: localScan.stats.riskScore,
      riskLevel: localScan.stats.highestSeverity,
      flaggedTokens: localScan.flaggedPhrases,
      threatIndicators: localScan.flaggedPhrases.map(p => p.categoryLabel)
    };
  },

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${API_BASE_URL}/api/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          connected: true
        };
      }
    } catch {
      // Server not running or offline
    }
    return { status: 'offline', connected: false, onDeviceAI: true };
  }
};
