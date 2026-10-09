import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldAlert,
  ShieldCheck,
  Disc,
  MessageSquare,
  Sparkles,
  Info,
  X,
  AlertTriangle,
  Send,
  Zap,
  Lock,
  Cpu
} from 'lucide-react-native';
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  AudioRecorder,
  RecordingPresets
} from 'expo-audio';
import { ThreatBanner } from '../components/ThreatBanner';
import { AudioWaveform } from '../components/AudioWaveform';
import { PhraseDetectionService } from '../services/phraseDetectionService';
import { ApiService } from '../services/apiService';
import { StorageService } from '../services/storageService';

const TEST_INJECTION_PRESETS = [
  {
    label: 'Digital Arrest Threat',
    text: 'You are placed under 24-hour DIGITAL ARREST right now for money laundering under IPC 420. Do not disconnect this line.'
  },
  {
    label: 'Solicit Bank OTP',
    text: 'As per RBI guidelines, open your SMS and read out the 6-digit OTP verification code immediately.'
  },
  {
    label: 'RBI Secret Escrow',
    text: 'To avoid property seizure, transfer your entire bank balance to the RBI Secret Verification Escrow Account within 15 minutes.'
  },
  {
    label: 'AnyDesk / APK Trojan',
    text: 'Download QuickSupport AnyDesk app from this link and share your screen to verify your digital signature.'
  },
  {
    label: 'Power Cut Emergency',
    text: 'Dear consumer, your electricity power will be disconnected at 9:30 tonight unless you pay the overdue bill immediately.'
  }
];

const DEFAULT_PUSHBACKS = [
  'Send official notice by registered post.',
  'I will visit my nearest police station directly.',
  'I will not share any OTP or account credentials.',
  'Provide your officer badge number and FIR copy.'
];

export function LiveCallScreen({
  callerName,
  phoneNumber,
  scenario,
  customScript,
  consentGranted = true,
  consentTimestamp,
  onEndCall
}) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  // Consent & Recording State
  const [hasConsent, setHasConsent] = useState(!!consentGranted);
  const [isRecording, setIsRecording] = useState(!!consentGranted);
  const [activeConsentTimestamp, setActiveConsentTimestamp] = useState(
    consentTimestamp || (consentGranted ? new Date().toISOString() : null)
  );

  // Audio Recording State (expo-audio)
  const [recordingInstance, setRecordingInstance] = useState(null);
  const [audioMeter, setAudioMeter] = useState(-40);

  // Real-Time Transcript State
  const [transcript, setTranscript] = useState([]);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  // Real-Time Streaming Utterance (Interim live Speech-to-Text streaming)
  const [activeStreamingUtterance, setActiveStreamingUtterance] = useState(null);

  // Live user speech text input
  const [userVoiceInput, setUserVoiceInput] = useState('');

  // Threat state
  const [riskLevel, setRiskLevel] = useState(consentGranted ? 'SAFE' : 'PRIVACY_MODE');
  const [riskScore, setRiskScore] = useState(consentGranted ? 5 : 0);
  const [threatIndicators, setThreatIndicators] = useState([]);
  const [counterAdvisory, setCounterAdvisory] = useState('');
  const [aiSource, setAiSource] = useState('Local Guard');

  // Critical Intercept Warning
  const [criticalIntercept, setCriticalIntercept] = useState(null);

  // Threat Detail Modal
  const [selectedThreatDetail, setSelectedThreatDetail] = useState(null);

  // Test Phrase Injector Modal
  const [isInjectModalVisible, setIsInjectModalVisible] = useState(false);
  const [customInjectText, setCustomInjectText] = useState('');

  const scrollViewRef = useRef(null);

  // 1. Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Audio recording initialization (expo-audio) - ONLY when consent is granted
  useEffect(() => {
    let rec = null;
    let isCancelled = false;
    let meterInterval = null;

    async function startAudioCapture() {
      if (!hasConsent || !isRecording) {
        return;
      }
      try {
        const { status } = await requestRecordingPermissionsAsync();
        if (status === 'granted' && !isCancelled) {
          await setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true
          });
          rec = new AudioRecorder(RecordingPresets.HIGH_QUALITY);
          await rec.prepareToRecordAsync();
          rec.record();
          setRecordingInstance(rec);

          meterInterval = setInterval(() => {
            if (rec && !isCancelled) {
              try {
                const state = rec.getStatus();
                if (state && typeof state.metering === 'number') {
                  setAudioMeter(state.metering);
                }
              } catch {
                // Ignore status polling errors
              }
            }
          }, 200);
        }
      } catch (err) {
        // Fallback gracefully on devices without microphone permissions
      }
    }

    startAudioCapture();

    return () => {
      isCancelled = true;
      if (meterInterval) {
        clearInterval(meterInterval);
      }
      if (rec) {
        rec.stop().catch(() => {});
      }
    };
  }, [hasConsent, isRecording]);

  // 3. Web Speech API for genuine real-time microphone transcription on Web
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec || !hasConsent || !isRecording || isMuted) return;

    let recognition = null;
    let isMounted = true;

    try {
      recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            const finalSpeech = item[0].transcript.trim();
            if (finalSpeech) {
              appendSpeech('You', finalSpeech);
              analyzeSpeech(finalSpeech);
              setActiveStreamingUtterance(null);
            }
          } else {
            interimText += item[0].transcript;
          }
        }
        if (interimText.trim() && isMounted) {
          setActiveStreamingUtterance({
            speaker: 'You',
            text: interimText.trim(),
            isStreaming: true
          });
        }
      };

      recognition.onerror = () => {
        // Handled silently
      };

      recognition.start();
    } catch {
      // Ignored
    }

    return () => {
      isMounted = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch {}
      }
    };
  }, [hasConsent, isRecording, isMuted]);

  // 4. Real-time Dialogue Streaming Engine
  const streamSpeechUtterance = (speaker, fullText, onFinished) => {
    if (!fullText || !fullText.trim()) return;

    // Check immediate lure triggers
    const lureCheck = PhraseDetectionService.detectOtpOrPersonalDetailsLure(fullText, speaker.toLowerCase());
    if (lureCheck.isLureDetected) {
      setCriticalIntercept({
        label: lureCheck.label,
        matchedText: lureCheck.matchedText,
        explanation: lureCheck.explanation
      });
    }

    const words = fullText.trim().split(' ');
    let currentIdx = 0;

    setActiveStreamingUtterance({
      speaker,
      text: words[0] || '',
      isStreaming: true
    });

    const streamInterval = setInterval(() => {
      currentIdx += 2; // Stream 2 words per tick for natural live speech pacing
      if (currentIdx >= words.length) {
        clearInterval(streamInterval);
        setActiveStreamingUtterance(null);
        appendSpeech(speaker, fullText.trim());
        analyzeSpeech(fullText.trim());
        if (onFinished) onFinished();
      } else {
        setActiveStreamingUtterance({
          speaker,
          text: words.slice(0, currentIdx + 1).join(' '),
          isStreaming: true
        });
      }
    }, 85);
  };

  // 5. Scenario dialogue generation (active when consent is granted)
  useEffect(() => {
    if (!hasConsent) return; // Do not transcribe or simulate speech if consent is not granted

    if (scenario && scenario.dialogueSteps) {
      if (dialogueIndex < scenario.dialogueSteps.length) {
        const step = scenario.dialogueSteps[dialogueIndex];
        const timeout = setTimeout(() => {
          streamSpeechUtterance('Caller', step.callerText);
        }, dialogueIndex === 0 ? 1200 : 3200);

        return () => clearTimeout(timeout);
      }
    } else if (customScript && dialogueIndex === 0) {
      const timeout = setTimeout(() => {
        streamSpeechUtterance('Caller', customScript, () => setDialogueIndex(1));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [scenario, dialogueIndex, customScript, hasConsent]);

  // Appends speech and computes token segments for highlight rendering
  const appendSpeech = (speaker, text) => {
    const phraseScan = PhraseDetectionService.analyzeStreamText(text);
    const newEntry = {
      speaker,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      tokenizedSegments: phraseScan.tokenizedSegments,
      flaggedCount: phraseScan.stats.totalFlagged
    };
    setTranscript(prev => [...prev, newEntry]);
  };

  // Real-time speech analysis (Pillar 1)
  const analyzeSpeech = async (newText) => {
    if (!hasConsent) return;

    // 1. Check for immediate critical credential/OTP lure
    const lureCheck = PhraseDetectionService.detectOtpOrPersonalDetailsLure(newText, 'caller');
    if (lureCheck.isLureDetected) {
      setCriticalIntercept({
        label: lureCheck.label,
        matchedText: lureCheck.matchedText,
        explanation: lureCheck.explanation
      });
    }

    // 2. Local phrase scan
    const localScan = PhraseDetectionService.scanText(newText);
    if (localScan.stats.totalFlagged > 0) {
      const highSev = localScan.stats.highestSeverity;
      setRiskLevel(highSev);
      setRiskScore(Math.max(riskScore, localScan.stats.riskScore));
      setThreatIndicators(localScan.flaggedPhrases.map(p => p.categoryLabel));
      if (localScan.flaggedPhrases[0]?.counterAdvisory) {
        setCounterAdvisory(localScan.flaggedPhrases[0].counterAdvisory);
      }
      setAiSource('On-Device Guard');
    }

    // 3. Server AI / BERT Model analysis
    try {
      const serverResult = await ApiService.analyzeTranscript(
        [...transcript, { speaker: 'Caller', text: newText }],
        phoneNumber,
        callerName,
        dialogueIndex
      );

      if (serverResult && typeof serverResult.riskScore === 'number') {
        setRiskScore(serverResult.riskScore);
        setRiskLevel(serverResult.riskLevel);
        if (serverResult.threatIndicators?.length > 0) {
          setThreatIndicators(serverResult.threatIndicators);
        }
        if (serverResult.recommendedAction) {
          setCounterAdvisory(serverResult.recommendedAction);
        }
        setAiSource(serverResult.source === 'SERVER_AI_BERT' ? 'BERT AI Server' : 'On-Device Guard');

        if (serverResult.riskScore >= 85) {
          setCriticalIntercept({
            label: serverResult.scamType || 'High-Risk Extortion Attempt',
            matchedText: 'Multiple coercion triggers confirmed by AI',
            explanation: serverResult.reasoning || 'Critical fraudulent threat identified.'
          });
        }
      }
    } catch {
      // Gracefully handled via local heuristics
    }
  };

  const handleUserResponse = (responseText) => {
    streamSpeechUtterance('You', responseText, () => {
      setDialogueIndex(prev => prev + 1);
    });
  };

  const handleSendCustomUserResponse = () => {
    if (!userVoiceInput || !userVoiceInput.trim()) return;
    const textToSend = userVoiceInput.trim();
    setUserVoiceInput('');
    streamSpeechUtterance('You', textToSend, () => {
      setDialogueIndex(prev => prev + 1);
    });
  };

  const handleInjectCustomPhrase = (phraseText) => {
    if (!phraseText || !phraseText.trim()) return;
    setIsInjectModalVisible(false);
    setCustomInjectText('');
    streamSpeechUtterance('Caller', phraseText.trim());
  };

  const handleTokenPress = (matchDetails) => {
    if (matchDetails) {
      setSelectedThreatDetail(matchDetails);
    }
  };

  // In-Call Grant Consent Handler (if user entered in Privacy Mode and now wants protection)
  const handleGrantConsentInCall = () => {
    Alert.alert(
      'Grant Call Recording Consent',
      'Do you consent to enable encrypted call recording and real-time AI speech transcription for this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Grant Consent',
          style: 'default',
          onPress: () => {
            setHasConsent(true);
            setIsRecording(true);
            setActiveConsentTimestamp(new Date().toISOString());
            setRiskLevel('SAFE');
            setRiskScore(5);
          }
        }
      ]
    );
  };

  const handleToggleRecording = () => {
    if (!hasConsent) {
      handleGrantConsentInCall();
      return;
    }
    setIsRecording(!isRecording);
  };

  const handleEmergencyAutoHangupAndBlock = async () => {
    await StorageService.toggleBlockNumber(phoneNumber);
    Alert.alert(
      'Threat Defused & Number Blocked',
      `SafeShield terminated the call to prevent fraudulent loss. The suspect number (${phoneNumber}) has been added to your local blacklist.`
    );
    handleHangUp();
  };

  const handleHangUp = async () => {
    if (recordingInstance) {
      try {
        await recordingInstance.stopAndUnloadAsync();
      } catch {}
    }

    const newRecording = {
      id: 'rec-' + Date.now(),
      contactName: callerName || 'Unknown Caller',
      phoneNumber: phoneNumber || 'Private Number',
      timestamp: new Date().toISOString(),
      durationSeconds: callDuration,
      consentProof: {
        recordedWithConsent: hasConsent,
        consentTimestamp: hasConsent ? activeConsentTimestamp : null,
        jurisdiction: 'IN_CYBER_CRPC_BNSS',
        statutoryNotice: hasConsent
          ? 'Recorded with explicit subscriber consent under Section 63 BNSS & Indian Evidence Act'
          : 'Privacy Mode: Unrecorded call without user consent'
      },
      fraudAnalysis: {
        riskLevel: hasConsent ? riskLevel : 'PRIVACY_MODE',
        riskScore: hasConsent ? riskScore : 0,
        scamType: threatIndicators[0] || (riskLevel === 'CRITICAL' ? 'Digital Arrest & Extortion' : 'General Call'),
        threatIndicators: hasConsent ? threatIndicators : [],
        counterAdvisory: hasConsent ? counterAdvisory : 'Unmonitored call (Privacy Mode)'
      },
      transcript: hasConsent ? transcript : [],
      sha256Hash: hasConsent
        ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        : null
    };

    if (hasConsent && isRecording && transcript.length > 0) {
      await StorageService.saveRecording(newRecording);
    }

    onEndCall(newRecording);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentStepData = scenario?.dialogueSteps?.[dialogueIndex];
  const activePushbacks = currentStepData?.suggestedUserResponses || DEFAULT_PUSHBACKS;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header: Caller Meta & Audio Waveform */}
      <View style={styles.topHeader}>
        <View style={styles.callerInfoBox}>
          <Text style={styles.callerNameText} numberOfLines={1}>
            {callerName || 'Unknown Caller'}
          </Text>
          <Text style={styles.callerPhoneText}>{phoneNumber}</Text>
          <View style={styles.callTimerRow}>
            <View style={[styles.livePulse, !hasConsent && { backgroundColor: '#94a3b8' }]} />
            <Text style={styles.timerText}>{formatTime(callDuration)}</Text>
            {hasConsent && isRecording ? (
              <View style={styles.recordingBadge}>
                <Disc size={10} color="#f43f5e" />
                <Text style={styles.recordingText}>REC STATUTORY (CONSENTED)</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.privacyBadgeHeader}
                onPress={handleGrantConsentInCall}
              >
                <Lock size={10} color="#94a3b8" />
                <Text style={styles.privacyBadgeHeaderText}>PRIVACY MODE (NO REC)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <AudioWaveform
          isActive={hasConsent && isRecording}
          color={
            !hasConsent
              ? '#64748b'
              : riskLevel === 'CRITICAL'
              ? '#f43f5e'
              : riskLevel === 'HIGH'
              ? '#f59e0b'
              : '#34d399'
          }
        />
      </View>

      {/* Threat Detection Banner with Risk Gauge */}
      <ThreatBanner
        riskLevel={hasConsent ? riskLevel : 'PRIVACY_MODE'}
        riskScore={hasConsent ? riskScore : 0}
        threatIndicators={hasConsent ? threatIndicators : []}
        counterAdvisory={counterAdvisory}
        source={aiSource}
      />

      {/* Emergency Intercept Warning if OTP/Credential Lure detected */}
      {criticalIntercept && hasConsent && (
        <View style={styles.interceptBar}>
          <View style={styles.interceptTopRow}>
            <AlertTriangle size={18} color="#ffffff" />
            <Text style={styles.interceptTitle}>EMERGENCY INTERCEPT: {criticalIntercept.label}</Text>
          </View>
          <Text style={styles.interceptDesc}>{criticalIntercept.explanation}</Text>
          <TouchableOpacity
            style={styles.interceptActionBtn}
            activeOpacity={0.8}
            onPress={handleEmergencyAutoHangupAndBlock}
          >
            <ShieldAlert size={16} color="#ffffff" />
            <Text style={styles.interceptActionText}>KILL CALL & BLOCK SUSPECT</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Live Speech Stream Box with Interactive Token Highlighting */}
      <View style={styles.transcriptBox}>
        <View style={styles.transcriptHeader}>
          <View style={styles.transcriptHeaderTitle}>
            <MessageSquare size={14} color="#818cf8" />
            <Text style={styles.transcriptTitle}>
              Real-Time Speech Stream (Pillar 1)
            </Text>
            {hasConsent && (
              <View style={styles.sttLiveIndicator}>
                <View style={styles.sttGreenDot} />
                <Text style={styles.sttLiveText}>Live STT</Text>
              </View>
            )}
          </View>

          {/* Quick Trigger Button for Testing AI */}
          <TouchableOpacity
            style={styles.injectTestBtn}
            onPress={() => setIsInjectModalVisible(true)}
          >
            <Sparkles size={12} color="#c084fc" />
            <Text style={styles.injectTestText}>Test Injector</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.transcriptScroll}
          contentContainerStyle={styles.transcriptContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {!hasConsent ? (
            /* Privacy Mode Notice Card */
            <View style={styles.privacyNoticeCard}>
              <View style={styles.privacyShieldIconCircle}>
                <Lock size={26} color="#94a3b8" />
              </View>
              <Text style={styles.privacyNoticeHeading}>Privacy Mode: AI Shield Inactive</Text>
              <Text style={styles.privacyNoticeBody}>
                Voice recording and real-time speech transcription are disabled for this call.
                Under Section 63 BNSS & privacy compliance, no audio or speech is captured without user consent.
              </Text>
              <View style={styles.privacyStatuteRow}>
                <ShieldCheck size={14} color="#34d399" />
                <Text style={styles.privacyStatuteText}>
                  Statutory Consent Required Every Call
                </Text>
              </View>
              <TouchableOpacity
                style={styles.enableShieldInCallBtn}
                onPress={handleGrantConsentInCall}
                activeOpacity={0.8}
              >
                <ShieldCheck size={18} color="#ffffff" />
                <Text style={styles.enableShieldInCallText}>Grant Consent & Start AI Shield</Text>
              </TouchableOpacity>
            </View>
          ) : transcript.length === 0 && !activeStreamingUtterance ? (
            <View style={styles.waitingContainer}>
              <View style={styles.waitingSpinnerRow}>
                <View style={styles.pulsingAudioDot} />
                <Text style={styles.waitingText}>
                  Listening to caller stream... SafeShield AI is tokenizing utterances for legal extortion, fake warrants, and OTP theft.
                </Text>
              </View>
              <Text style={styles.waitingSubtext}>
                Real-time transcript creation active under subscriber consent.
              </Text>
            </View>
          ) : (
            <>
              {transcript.map((item, idx) => (
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

                  {/* Render tokenized segments for caller or plain text for user */}
                  {item.speaker === 'You' || !item.tokenizedSegments ? (
                    <Text style={styles.bubbleText}>{item.text}</Text>
                  ) : (
                    <Text style={styles.bubbleText}>
                      {item.tokenizedSegments.map((seg, sIdx) => {
                        if (!seg.isFlagged) {
                          return <Text key={sIdx}>{seg.text}</Text>;
                        }
                        const sev = seg.matchDetails?.severity || 'HIGH';
                        const sevStyle = PhraseDetectionService.getSeverityStyle(sev);

                        return (
                          <Text
                            key={sIdx}
                            style={[
                              styles.flaggedChipInline,
                              {
                                backgroundColor: sevStyle.highlightBg,
                                color: sevStyle.highlightText
                              }
                            ]}
                            onPress={() => handleTokenPress(seg.matchDetails)}
                          >
                            ⚠️ {seg.text}{' '}
                          </Text>
                        );
                      })}
                    </Text>
                  )}
                </View>
              ))}

              {/* Active Streaming Utterance Bubble (Interim Speech-to-Text streaming) */}
              {activeStreamingUtterance && (
                <View
                  style={[
                    styles.speechBubble,
                    activeStreamingUtterance.speaker === 'You' ? styles.userBubble : styles.callerBubble,
                    styles.streamingBubble
                  ]}
                >
                  <View style={styles.streamingMetaRow}>
                    <Text style={styles.bubbleSpeaker}>
                      {activeStreamingUtterance.speaker} • Transcribing Live
                    </Text>
                    <View style={styles.streamingLiveBadge}>
                      <View style={styles.streamingPulseDot} />
                      <Text style={styles.streamingLiveText}>STREAMING</Text>
                    </View>
                  </View>
                  <Text style={styles.bubbleText}>
                    {activeStreamingUtterance.text}
                    <Text style={styles.streamingCursor}> ▌</Text>
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Live Utterance Input & Defensive Counter-Responses */}
        {hasConsent && (
          <View style={styles.responsesContainer}>
            <Text style={styles.responsesLabel}>Defensive Pushbacks & Spoken Response:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.responsesScroll}
            >
              {activePushbacks.map((resText, rIdx) => (
                <TouchableOpacity
                  key={rIdx}
                  style={styles.responseChip}
                  onPress={() => handleUserResponse(resText)}
                >
                  <Text style={styles.responseChipText}>{resText}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Live Text / Speech Input */}
            <View style={styles.liveVoiceInputRow}>
              <TextInput
                style={styles.liveVoiceTextInput}
                placeholder="Type spoken response live..."
                placeholderTextColor="#64748b"
                value={userVoiceInput}
                onChangeText={setUserVoiceInput}
                onSubmitEditing={handleSendCustomUserResponse}
              />
              <TouchableOpacity
                style={[
                  styles.liveVoiceSendBtn,
                  !userVoiceInput.trim() && styles.liveVoiceSendBtnDisabled
                ]}
                disabled={!userVoiceInput.trim()}
                onPress={handleSendCustomUserResponse}
              >
                <Send size={15} color="#ffffff" />
              </TouchableOpacity>
            </View>
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
          style={[styles.controlBtn, (!hasConsent || !isRecording) && styles.controlBtnInactive]}
          onPress={handleToggleRecording}
        >
          <Disc size={22} color={hasConsent && isRecording ? '#f43f5e' : '#64748b'} />
          <Text style={styles.controlBtnLabel}>
            {!hasConsent ? 'No Consent' : isRecording ? 'Recording' : 'Paused'}
          </Text>
        </TouchableOpacity>

        {/* Hangup Button */}
        <TouchableOpacity
          style={styles.hangupButton}
          onPress={handleHangUp}
          activeOpacity={0.8}
        >
          <PhoneOff size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Threat Detail Modal (When user taps a flagged token) */}
      <Modal
        visible={!!selectedThreatDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedThreatDetail(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.threatModalBox}>
            <View style={styles.threatModalHeader}>
              <View style={styles.threatModalTitleRow}>
                <ShieldAlert size={20} color="#f43f5e" />
                <Text style={styles.threatModalTitle}>
                  {selectedThreatDetail?.categoryLabel || 'Fraud Threat Identified'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedThreatDetail(null)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.threatModalContent}>
              <View style={styles.matchedPhraseRow}>
                <Text style={styles.matchedPhraseLabel}>Flagged Text:</Text>
                <Text style={styles.matchedPhraseVal}>
                  "{selectedThreatDetail?.matchedText}"
                </Text>
              </View>

              <Text style={styles.threatExplanationText}>
                {selectedThreatDetail?.explanation}
              </Text>

              {selectedThreatDetail?.counterAdvisory && (
                <View style={styles.threatAdvisoryBox}>
                  <Text style={styles.threatAdvisoryTitle}>Statutory Advisory:</Text>
                  <Text style={styles.threatAdvisoryContent}>
                    {selectedThreatDetail?.counterAdvisory}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedThreatDetail(null)}
            >
              <Text style={styles.modalCloseBtnText}>Acknowledge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Testing Injector Modal */}
      <Modal
        visible={isInjectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsInjectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.injectModalBox}>
            <View style={styles.injectModalHeader}>
              <View style={styles.threatModalTitleRow}>
                <Sparkles size={18} color="#c084fc" />
                <Text style={styles.injectModalTitle}>Pillar 1 AI Test Injector</Text>
              </View>
              <TouchableOpacity onPress={() => setIsInjectModalVisible(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.injectModalSubtitle}>
              Inject simulated caller utterances to test real-time NLP classification & live transcript streaming:
            </Text>

            <ScrollView style={styles.presetScroll} showsVerticalScrollIndicator={false}>
              {TEST_INJECTION_PRESETS.map((preset, pIdx) => (
                <TouchableOpacity
                  key={pIdx}
                  style={styles.presetCard}
                  onPress={() => handleInjectCustomPhrase(preset.text)}
                >
                  <View style={styles.presetHeader}>
                    <Zap size={14} color="#f59e0b" />
                    <Text style={styles.presetTitle}>{preset.label}</Text>
                  </View>
                  <Text style={styles.presetSnippet} numberOfLines={2}>
                    "{preset.text}"
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Custom Input */}
            <View style={styles.customInjectRow}>
              <TextInput
                style={styles.customInjectInput}
                placeholder="Type custom caller phrase..."
                placeholderTextColor="#64748b"
                value={customInjectText}
                onChangeText={setCustomInjectText}
              />
              <TouchableOpacity
                style={styles.sendInjectBtn}
                onPress={() => handleInjectCustomPhrase(customInjectText)}
              >
                <Send size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 6,
    alignItems: 'center'
  },
  callerInfoBox: {
    alignItems: 'center',
    marginBottom: 6
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
    fontSize: 13,
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
    fontSize: 8.5,
    fontWeight: '800'
  },
  privacyBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)'
  },
  privacyBadgeHeaderText: {
    color: '#94a3b8',
    fontSize: 8.5,
    fontWeight: '800'
  },
  interceptBar: {
    backgroundColor: '#881337',
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f43f5e',
    marginBottom: 4
  },
  interceptTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  interceptTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  interceptDesc: {
    color: '#ffe4e6',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15
  },
  interceptActionBtn: {
    marginTop: 8,
    backgroundColor: '#e11d48',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6
  },
  interceptActionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800'
  },
  transcriptBox: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginVertical: 4
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  transcriptHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  transcriptTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700'
  },
  sttLiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)'
  },
  sttGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399'
  },
  sttLiveText: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: '800'
  },
  injectTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)'
  },
  injectTestText: {
    color: '#c084fc',
    fontSize: 10,
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
  waitingContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  waitingSpinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  pulsingAudioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#818cf8'
  },
  waitingText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    flex: 1
  },
  waitingSubtext: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center'
  },
  privacyNoticeCard: {
    backgroundColor: '#131e36',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 12
  },
  privacyShieldIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  privacyNoticeHeading: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6
  },
  privacyNoticeBody: {
    color: '#94a3b8',
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 12
  },
  privacyStatuteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14
  },
  privacyStatuteText: {
    color: '#34d399',
    fontSize: 10.5,
    fontWeight: '600'
  },
  enableShieldInCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8
  },
  enableShieldInCallText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  speechBubble: {
    padding: 10,
    borderRadius: 14,
    maxWidth: '92%'
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
  streamingBubble: {
    borderStyle: 'dashed',
    borderColor: '#6366f1',
    backgroundColor: '#172033'
  },
  streamingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  streamingLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 3
  },
  streamingPulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#818cf8'
  },
  streamingLiveText: {
    color: '#a5b4fc',
    fontSize: 8,
    fontWeight: '800'
  },
  streamingCursor: {
    color: '#818cf8',
    fontWeight: '900'
  },
  bubbleSpeaker: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4
  },
  bubbleText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 19
  },
  flaggedChipInline: {
    fontWeight: '700',
    borderRadius: 4,
    paddingHorizontal: 3
  },
  responsesContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b'
  },
  responsesLabel: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6
  },
  responsesScroll: {
    gap: 8,
    paddingBottom: 6
  },
  responseChip: {
    backgroundColor: '#1e1b4b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4f46e5'
  },
  responseChipText: {
    color: '#c7d2fe',
    fontSize: 11,
    fontWeight: '600'
  },
  liveVoiceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131e36',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4
  },
  liveVoiceTextInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
    paddingVertical: 4
  },
  liveVoiceSendBtn: {
    backgroundColor: '#6366f1',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6
  },
  liveVoiceSendBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b'
  },
  controlBtn: {
    alignItems: 'center',
    gap: 3
  },
  controlBtnActive: {
    opacity: 0.8
  },
  controlBtnInactive: {
    opacity: 0.5
  },
  controlBtnLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600'
  },
  hangupButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  threatModalBox: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 18,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#e11d48'
  },
  threatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  threatModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  threatModalTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  threatModalContent: {
    gap: 10
  },
  matchedPhraseRow: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)'
  },
  matchedPhraseLabel: {
    color: '#fda4af',
    fontSize: 10,
    fontWeight: '700'
  },
  matchedPhraseVal: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2
  },
  threatExplanationText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17
  },
  threatAdvisoryBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)'
  },
  threatAdvisoryTitle: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700'
  },
  threatAdvisoryContent: {
    color: '#e0e7ff',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15
  },
  modalCloseBtn: {
    marginTop: 14,
    backgroundColor: '#334155',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  injectModalBox: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#7c3aed'
  },
  injectModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  injectModalTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  injectModalSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 12
  },
  presetScroll: {
    maxHeight: 280,
    marginBottom: 12
  },
  presetCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  presetTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700'
  },
  presetSnippet: {
    color: '#94a3b8',
    fontSize: 11,
    fontStyle: 'italic'
  },
  customInjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  customInjectInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
    paddingVertical: 8
  },
  sendInjectBtn: {
    backgroundColor: '#7c3aed',
    padding: 6,
    borderRadius: 8,
    marginLeft: 6
  }
});
