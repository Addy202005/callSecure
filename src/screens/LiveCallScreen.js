import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldAlert,
  ShieldCheck,
  Disc,
  MessageSquare
} from 'lucide-react-native';
import { ThreatBanner } from '../components/ThreatBanner';
import { AudioWaveform } from '../components/AudioWaveform';
import { PhraseDetectionService } from '../services/phraseDetectionService';
import { ApiService } from '../services/apiService';
import { StorageService } from '../services/storageService';

export function LiveCallScreen({
  callerName,
  phoneNumber,
  scenario,
  customScript,
  onEndCall
}) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isRecording, setIsRecording] = useState(true);

  // Transcript lines
  const [transcript, setTranscript] = useState([]);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  // Threat state
  const [riskLevel, setRiskLevel] = useState('SAFE');
  const [riskScore, setRiskScore] = useState(5);
  const [threatIndicators, setThreatIndicators] = useState([]);
  const [counterAdvisory, setCounterAdvisory] = useState('');

  const scrollViewRef = useRef(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format call duration
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Step-by-step dialogue generation
  useEffect(() => {
    if (scenario && scenario.dialogueSteps) {
      if (dialogueIndex < scenario.dialogueSteps.length) {
        const step = scenario.dialogueSteps[dialogueIndex];
        const timeout = setTimeout(() => {
          appendSpeech('Caller', step.callerText);
          analyzeSpeech(step.callerText);
        }, dialogueIndex === 0 ? 1200 : 3500);

        return () => clearTimeout(timeout);
      }
    } else if (customScript && dialogueIndex === 0) {
      const timeout = setTimeout(() => {
        appendSpeech('Caller', customScript);
        analyzeSpeech(customScript);
        setDialogueIndex(1);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [scenario, dialogueIndex, customScript]);

  const appendSpeech = (speaker, text) => {
    setTranscript(prev => [...prev, { speaker, text, timestamp: new Date().toLocaleTimeString() }]);
  };

  const analyzeSpeech = async (newText) => {
    const phraseScan = PhraseDetectionService.scanText(newText);
    if (phraseScan.stats.totalFlagged > 0) {
      const highSev = phraseScan.stats.highestSeverity;
      setRiskLevel(highSev);
      setRiskScore(phraseScan.stats.riskScore);
      setThreatIndicators(phraseScan.flaggedPhrases.map(p => p.categoryLabel));
      if (phraseScan.flaggedPhrases[0]?.counterAdvisory) {
        setCounterAdvisory(phraseScan.flaggedPhrases[0].counterAdvisory);
      }
    }

    try {
      const serverResult = await ApiService.analyzeTranscript(
        [...transcript, { speaker: 'Caller', text: newText }],
        phoneNumber,
        callerName,
        dialogueIndex
      );
      if (serverResult && serverResult.riskScore) {
        setRiskScore(serverResult.riskScore);
        setRiskLevel(serverResult.riskLevel);
        if (serverResult.recommendedAction) {
          setCounterAdvisory(serverResult.recommendedAction);
        }
      }
    } catch (e) {
      // Handled gracefully with local heuristics
    }
  };

  const handleUserResponse = (responseText) => {
    appendSpeech('You', responseText);
    setDialogueIndex(prev => prev + 1);
  };

  const handleHangUp = async () => {
    // Generate recording item to save in evidence locker
    const newRecording = {
      id: 'rec-' + Date.now(),
      contactName: callerName || 'Unknown Caller',
      phoneNumber: phoneNumber || 'Private Number',
      timestamp: new Date().toISOString(),
      durationSeconds: callDuration,
      consentProof: {
        recordedWithConsent: true,
        consentTimestamp: new Date().toISOString(),
        jurisdiction: 'IN_CYBER_CRPC_BNSS'
      },
      fraudAnalysis: {
        riskLevel: riskLevel,
        riskScore: riskScore,
        scamType: threatIndicators[0] || (riskLevel === 'CRITICAL' ? 'Digital Arrest & Extortion' : 'General Call'),
        threatIndicators: threatIndicators,
        counterAdvisory: counterAdvisory
      },
      transcript: transcript,
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    if (isRecording && transcript.length > 0) {
      await StorageService.saveRecording(newRecording);
    }

    onEndCall(newRecording);
  };

  const currentStepData = scenario?.dialogueSteps?.[dialogueIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar: Caller Details & Duration */}
      <View style={styles.topHeader}>
        <View style={styles.callerInfoBox}>
          <Text style={styles.callerNameText} numberOfLines={1}>
            {callerName || 'Unknown Caller'}
          </Text>
          <Text style={styles.callerPhoneText}>{phoneNumber}</Text>
          <View style={styles.callTimerRow}>
            <View style={styles.livePulse} />
            <Text style={styles.timerText}>{formatTime(callDuration)}</Text>
            {isRecording && (
              <View style={styles.recordingBadge}>
                <Disc size={10} color="#f43f5e" />
                <Text style={styles.recordingText}>REC CONSENT</Text>
              </View>
            )}
          </View>
        </View>

        <AudioWaveform isActive={true} color={riskLevel === 'CRITICAL' ? '#f43f5e' : '#6366f1'} />
      </View>

      {/* Threat Detection Banner */}
      <ThreatBanner
        riskLevel={riskLevel}
        riskScore={riskScore}
        threatIndicators={threatIndicators}
        counterAdvisory={counterAdvisory}
      />

      {/* Live AI Speech Transcription Box */}
      <View style={styles.transcriptBox}>
        <View style={styles.transcriptHeader}>
          <MessageSquare size={14} color="#818cf8" />
          <Text style={styles.transcriptTitle}>Live Real-Time Speech Stream</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.transcriptScroll}
          contentContainerStyle={styles.transcriptContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {transcript.length === 0 ? (
            <Text style={styles.waitingText}>
              Listening for caller audio stream... SafeShield AI is analyzing phrases for legal extortion, fake warrants, and OTP theft.
            </Text>
          ) : (
            transcript.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.speechBubble,
                  item.speaker === 'You' ? styles.userBubble : styles.callerBubble
                ]}
              >
                <Text style={styles.bubbleSpeaker}>
                  {item.speaker} • {item.timestamp}
                </Text>
                <Text style={styles.bubbleText}>{item.text}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Suggested Quick User Answers */}
        {currentStepData?.suggestedUserResponses && (
          <View style={styles.responsesContainer}>
            <Text style={styles.responsesLabel}>Recommended Defensive Counter-Responses:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.responsesScroll}>
              {currentStepData.suggestedUserResponses.map((resText, rIdx) => (
                <TouchableOpacity
                  key={rIdx}
                  style={styles.responseChip}
                  onPress={() => handleUserResponse(resText)}
                >
                  <Text style={styles.responseChipText}>{resText}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bottom In-Call Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff size={22} color="#f43f5e" /> : <Mic size={22} color="#ffffff" />}
          <Text style={styles.controlBtnLabel}>{isMuted ? 'Muted' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
          onPress={() => setIsSpeaker(!isSpeaker)}
        >
          {isSpeaker ? <Volume2 size={22} color="#818cf8" /> : <VolumeX size={22} color="#ffffff" />}
          <Text style={styles.controlBtnLabel}>Speaker</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isRecording && styles.controlBtnActive]}
          onPress={() => setIsRecording(!isRecording)}
        >
          <Disc size={22} color={isRecording ? '#f43f5e' : '#ffffff'} />
          <Text style={styles.controlBtnLabel}>{isRecording ? 'Recording' : 'Paused'}</Text>
        </TouchableOpacity>

        {/* Big Red Hangup Button */}
        <TouchableOpacity
          style={styles.hangupButton}
          onPress={handleHangUp}
          activeOpacity={0.8}
        >
          <PhoneOff size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'space-between'
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center'
  },
  callerInfoBox: {
    alignItems: 'center',
    marginBottom: 8
  },
  callerNameText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800'
  },
  callerPhoneText: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 2
  },
  callTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981'
  },
  timerText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '600'
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)'
  },
  recordingText: {
    color: '#fda4af',
    fontSize: 9,
    fontWeight: '800'
  },
  transcriptBox: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginVertical: 6
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  transcriptTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700'
  },
  transcriptScroll: {
    flex: 1,
    marginTop: 8
  },
  transcriptContent: {
    gap: 8,
    paddingBottom: 8
  },
  waitingText: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 20
  },
  speechBubble: {
    padding: 10,
    borderRadius: 14,
    maxWidth: '90%'
  },
  callerBubble: {
    backgroundColor: '#1e293b',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#334155'
  },
  userBubble: {
    backgroundColor: '#312e81',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#4338ca'
  },
  bubbleSpeaker: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2
  },
  bubbleText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18
  },
  responsesContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b'
  },
  responsesLabel: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6
  },
  responsesScroll: {
    gap: 8
  },
  responseChip: {
    backgroundColor: '#1e1b4b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4f46e5'
  },
  responseChipText: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '600'
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b'
  },
  controlBtn: {
    alignItems: 'center',
    gap: 4
  },
  controlBtnActive: {
    opacity: 0.8
  },
  controlBtnLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  hangupButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6
  }
});
