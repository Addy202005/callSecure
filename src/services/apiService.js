import { PhraseDetectionService } from './phraseDetectionService';

// In React Native development, configure BACKEND_URL to your server (e.g. 10.0.2.2 for Android emulator or localhost for iOS)
let API_BASE_URL = 'http://localhost:3000';

export const ApiService = {
  setBaseUrl(url) {
    API_BASE_URL = url;
  },

  /**
   * Analyzes live call transcript with server-side AI, with resilient local on-device heuristic fallback
   */
  async analyzeTranscript(transcript, callerPhone, callerName, currentStep) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/call/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          callerPhone,
          callerName,
          currentStep
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('Using on-device fraud analysis engine fallback:', e.message);
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
      reasoning: phraseAnalysis.flaggedPhrases.length > 0
        ? `Detected coercive triggers: ${detectedThreats.join(', ')}.`
        : 'Conversation flow appears typical with no high-risk extortion cues.',
      recommendedAction: riskLevel === 'CRITICAL'
        ? 'IMMEDIATELY DISCONNECT. Genuine law enforcement or banks never conduct legal actions or request OTPs over video/voice calls.'
        : riskLevel === 'HIGH'
        ? 'Exercise extreme caution. Do not share OTPs, bank numbers, or agree to video call isolation.'
        : 'Standard call safety practices apply.'
    };
  },

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return await response.json();
    } catch {
      return { status: 'offline', onDeviceAI: true };
    }
  }
};
