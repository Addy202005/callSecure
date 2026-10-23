import { PhraseDetectionService } from './phraseDetectionService';

// Multi-host candidate list for Expo Web, Android Emulator, and iOS
const CANDIDATE_URLS = [
  'http://localhost:3000',
  'http://10.0.2.2:3000',
  'http://127.0.0.1:3000'
];

let API_BASE_URL = 'http://localhost:3000';
let isUrlDiscovered = false;

export const ApiService = {
  setBaseUrl(url) {
    API_BASE_URL = url;
    isUrlDiscovered = true;
  },

  getBaseUrl() {
    return API_BASE_URL;
  },

  /**
   * Automatically probe candidate URLs to find reachable BERT backend server
   */
  async discoverActiveServer() {
    if (isUrlDiscovered) return API_BASE_URL;

    for (const candidate of CANDIDATE_URLS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const res = await fetch(`${candidate}/api/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          API_BASE_URL = candidate;
          isUrlDiscovered = true;
          return candidate;
        }
      } catch {
        // Continue probing candidates
      }
    }
    return API_BASE_URL;
  },

  /**
   * Analyzes live call transcript with server-side AI (BERT Classifier),
   * with resilient on-device heuristic fallback.
   */
  async analyzeTranscript(transcript, callerPhone, callerName, currentStep) {
    await this.discoverActiveServer();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

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
          source: 'SERVER_AI_BERT',
          connected: true
        };
      }
    } catch {
      // Graceful on-device fallback
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
    const isScam = score >= 40 || phraseAnalysis.stats.criticalCount > 0;
    const confidence = isScam ? Math.min(99.0, Math.max(75.0, score * 1.05)) : 95.0;

    return {
      riskScore: score,
      riskLevel,
      scamType: detectedThreats[0] || (riskLevel === 'SAFE' ? 'Normal / Non-Threatening Telephony' : 'Suspicious Telephony Activity'),
      threatIndicators: detectedThreats,
      flaggedTokens: phraseAnalysis.flaggedPhrases,
      tokenizedSegments: phraseAnalysis.tokenizedSegments,
      legalViolations: phraseAnalysis.flaggedPhrases.map(p => p.legalSection).filter(Boolean),
      intent: {
        primary: phraseAnalysis.stats.criticalCount > 0 ? 'coercion_extortion' : 'general_conversation',
        score
      },
      reasoning: phraseAnalysis.flaggedPhrases.length > 0
        ? `Detected coercive triggers: ${detectedThreats.join(', ')}.`
        : 'Conversation flow appears typical with no high-risk extortion cues.',
      recommendedAction: riskLevel === 'CRITICAL'
        ? 'IMMEDIATELY DISCONNECT. Genuine law enforcement or banks never conduct legal actions or request OTPs over video/voice calls.'
        : riskLevel === 'HIGH'
        ? 'Exercise extreme caution. Do not share OTPs, bank numbers, or agree to video call isolation.'
        : 'Standard call safety practices apply.',
      bertPrediction: isScam ? 'SCAM' : 'NOT_SCAM',
      bertConfidence: parseFloat(confidence.toFixed(1)),
      probabilities: {
        SCAM: parseFloat((score / 100).toFixed(2)),
        NOT_SCAM: parseFloat((1 - (score / 100)).toFixed(2))
      },
      bertModelStatus: 'On-Device NLP Guard (BERT Offline)',
      modelArchitecture: 'LocalHeuristicTransformer',
      source: 'ON_DEVICE_FALLBACK',
      connected: false
    };
  },

  /**
   * Real-time stream chunk / token analysis
   */
  async streamChunk(text) {
    await this.discoverActiveServer();

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
    await this.discoverActiveServer();

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
          url: API_BASE_URL,
          connected: true
        };
      }
    } catch {
      // Server not running or offline
    }
    return {
      status: 'offline',
      connected: false,
      onDeviceAI: true,
      url: API_BASE_URL,
      model: {
        architecture: 'LocalHeuristicTransformer',
        type: 'rule-nlp',
        active: false
      }
    };
  }
};
