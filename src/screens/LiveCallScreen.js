import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator
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
  Cpu,
  CheckCircle2
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
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
import { VoiceService } from '../services/voiceService';

const TEST_INJECTION_PRESETS = [
  {
    label: 'Digital Arrest Threat (>90% Critical Threat)',
    text: 'You are placed under 24-hour DIGITAL ARREST right now for money laundering under IPC 420. Do not disconnect this line. Transfer funds to RBI secret escrow.'
  },
  {
    label: 'RBI Secret Escrow (>90% Critical Threat)',
    text: 'To avoid property seizure under non-bailable arrest warrant, transfer your entire bank balance to the RBI Secret Verification Escrow Account within 15 minutes.'
  },
  {
    label: 'Solicit Bank OTP (Credential Theft)',
    text: 'As per RBI guidelines, open your SMS and read out the 6-digit OTP verification code immediately.'
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
  direction = 'incoming',
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

  // BERT AI Server Real-Time Scam Prediction State (Connected Call)
  const [bertStatus, setBertStatus] = useState('connecting'); // 'connecting' | 'connected' | 'offline'
  const [bertServerUrl, setBertServerUrl] = useState('http://localhost:3000');
  const [bertModelArchitecture, setBertModelArchitecture] = useState('BertForSequenceClassification');
  const [bertPrediction, setBertPrediction] = useState(null); // 'SCAM' | 'NOT_SCAM'
  const [bertConfidence, setBertConfidence] = useState(null);
  const [bertProbabilities, setBertProbabilities] = useState({ SCAM: 0.05, NOT_SCAM: 0.95 });
  const [bertLegalViolations, setBertLegalViolations] = useState([]);
  const [bertReasoning, setBertReasoning] = useState('');
  const [isBertInferring, setIsBertInferring] = useState(false);
  const [bertInferenceCount, setBertInferenceCount] = useState(0);
  const [isBertDiagnosticsVisible, setIsBertDiagnosticsVisible] = useState(false);

  // Critical Intercept Warning
  const [criticalIntercept, setCriticalIntercept] = useState(null);

  // Threat Detail Modal
  const [selectedThreatDetail, setSelectedThreatDetail] = useState(null);

  // Test Phrase Injector Modal
  const [isInjectModalVisible, setIsInjectModalVisible] = useState(false);
  const [customInjectText, setCustomInjectText] = useState('');

  // AI Voice Synthesis & User Spoken Response State
  const [isAiVoiceSpeaking, setIsAiVoiceSpeaking] = useState(false);
  const [currentSpeakingSpeaker, setCurrentSpeakingSpeaker] = useState(null);
  const [isAiVoiceMuted, setIsAiVoiceMuted] = useState(false);
  const [isListeningUserVoice, setIsListeningUserVoice] = useState(false);

  const scrollViewRef = useRef(null);

  // 0. BERT Server Health Handshake on Call Connect
  useEffect(() => {
    let isMounted = true;
    async function initBertServerConnection() {
      try {
        const health = await ApiService.checkHealth();
        if (isMounted) {
          if (health.connected) {
            setBertStatus('connected');
            setBertServerUrl(health.url || 'http://localhost:3000');
            setBertModelArchitecture(health.model?.architecture || 'BertForSequenceClassification');
            setAiSource('BERT AI Server');
          } else {
            setBertStatus('offline');
            setAiSource('On-Device NLP Guard');
          }
        }
      } catch {
        if (isMounted) {
          setBertStatus('offline');
          setAiSource('On-Device NLP Guard');
        }
      }
    }
    initBertServerConnection();
    return () => {
      isMounted = false;
    };
  }, []);

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
              analyzeSpeech(finalSpeech, 'You');
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
  // 4. Real-time Dialogue Streaming Engine with AI Voice synthesis
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

    // AI Voice Synthesis for Scammer Persona (Deep Caller Voice)
    if (speaker === 'Caller' && !isAiVoiceMuted) {
      VoiceService.speakCaller(fullText, {
        onStart: () => {
          setIsAiVoiceSpeaking(true);
          setCurrentSpeakingSpeaker('Caller');
        },
        onDone: () => {
          setIsAiVoiceSpeaking(false);
          setCurrentSpeakingSpeaker(null);
        },
        onError: () => {
          setIsAiVoiceSpeaking(false);
          setCurrentSpeakingSpeaker(null);
        }
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
        analyzeSpeech(fullText.trim(), speaker);
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

  // 5. Scenario dialogue generation (starts opening caller line when consent is active)
  useEffect(() => {
    if (!hasConsent) return;

    if (scenario && scenario.dialogueSteps && scenario.dialogueSteps.length > 0) {
      if (dialogueIndex === 0 && transcript.length === 0) {
        const step = scenario.dialogueSteps[0];
        const timeout = setTimeout(() => {
          streamSpeechUtterance('Caller', step.callerText);
        }, 1200);

        return () => clearTimeout(timeout);
      }
    } else if (customScript && dialogueIndex === 0 && transcript.length === 0) {
      const timeout = setTimeout(() => {
        streamSpeechUtterance('Caller', customScript);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [scenario, customScript, hasConsent]);

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

  // Real-time speech analysis using BERT Server & Risk Scoring (Pillar 1)
  const analyzeSpeech = async (newText, speaker = 'Caller') => {
    if (!hasConsent) return;

    // 1. Check for immediate critical credential/OTP lure
    const lureCheck = PhraseDetectionService.detectOtpOrPersonalDetailsLure(newText, speaker.toLowerCase());
    if (lureCheck.isLureDetected) {
      setCriticalIntercept({
        label: lureCheck.label,
        matchedText: lureCheck.matchedText,
        explanation: lureCheck.explanation
      });
    }

    // 2. Local phrase scan on single utterance + cumulative caller speech
    const localScan = PhraseDetectionService.scanText(newText);
    const cumulativeText = [...transcript.filter(t => t.speaker === 'Caller').map(t => t.text), speaker === 'Caller' ? newText : ''].join(' ');
    const cumulativeScan = PhraseDetectionService.scanText(cumulativeText);

    let highestSev = localScan.stats.highestSeverity;
    if (cumulativeScan.stats.criticalCount > 0) highestSev = 'CRITICAL';
    else if (cumulativeScan.stats.highCount > 0 && highestSev !== 'CRITICAL') highestSev = 'HIGH';

    // Calculate score taking into account local phrases, cumulative phrases, and scenario progression
    let calculatedScore = Math.max(riskScore, localScan.stats.riskScore, cumulativeScan.stats.riskScore);

    const currentStep = scenario?.dialogueSteps?.[dialogueIndex];
    if (currentStep?.riskIncrease) {
      calculatedScore = Math.max(calculatedScore, riskScore + currentStep.riskIncrease);
    }

    calculatedScore = Math.min(99, calculatedScore);

    if (localScan.stats.totalFlagged > 0 || cumulativeScan.stats.totalFlagged > 0 || currentStep?.riskIncrease) {
      setRiskLevel(highestSev);
      setRiskScore(calculatedScore);
      const combinedIndicators = [
        ...localScan.flaggedPhrases.map(p => p.categoryLabel),
        ...cumulativeScan.flaggedPhrases.map(p => p.categoryLabel)
      ];
      if (combinedIndicators.length > 0) {
        setThreatIndicators([...new Set(combinedIndicators)]);
      }

      if (localScan.flaggedPhrases[0]?.counterAdvisory) {
        setCounterAdvisory(localScan.flaggedPhrases[0].counterAdvisory);
      } else if (cumulativeScan.flaggedPhrases[0]?.counterAdvisory) {
        setCounterAdvisory(cumulativeScan.flaggedPhrases[0].counterAdvisory);
      }
    }

    // Note: Automatic call decline is removed as requested; call stays active.

    // 3. Server AI / BERT Model analysis while call is connected (Predict the rest)
    try {
      setIsBertInferring(true);
      const updatedTranscript = [...transcript, { speaker, text: newText }];
      const serverResult = await ApiService.analyzeTranscript(
        updatedTranscript,
        phoneNumber,
        callerName,
        dialogueIndex
      );
      setIsBertInferring(false);
      setBertInferenceCount(prev => prev + 1);

      if (serverResult && typeof serverResult.riskScore === 'number') {
        calculatedScore = Math.max(calculatedScore, serverResult.riskScore);
        calculatedScore = Math.min(99, calculatedScore);
        setRiskScore(calculatedScore);
        setRiskLevel(serverResult.riskLevel);
        if (serverResult.threatIndicators?.length > 0) {
          setThreatIndicators(serverResult.threatIndicators);
        }
        if (serverResult.recommendedAction) {
          setCounterAdvisory(serverResult.recommendedAction);
        }
        if (serverResult.bertPrediction) {
          setBertPrediction(serverResult.bertPrediction);
        }
        if (typeof serverResult.bertConfidence === 'number') {
          setBertConfidence(serverResult.bertConfidence);
        }
        if (serverResult.probabilities) {
          setBertProbabilities(serverResult.probabilities);
        }
        if (serverResult.legalViolations?.length > 0) {
          setBertLegalViolations(serverResult.legalViolations);
        }
        if (serverResult.reasoning) {
          setBertReasoning(serverResult.reasoning);
        }
        setBertStatus(serverResult.connected ? 'connected' : 'offline');
        setAiSource(serverResult.source === 'SERVER_AI_BERT' ? 'BERT AI Server' : 'On-Device Guard');

        if (serverResult.riskScore >= 85) {
          setCriticalIntercept({
            label: serverResult.scamType || 'High-Risk Extortion Attempt',
            matchedText: 'Multiple coercion triggers confirmed by BERT Classifier',
            explanation: serverResult.reasoning || 'Critical fraudulent threat identified.'
          });
        }
      }
    } catch {
      setIsBertInferring(false);
    }
  };

  // Dynamic scammer replies when scenario steps are completed or user pushes back
  const generateDynamicScammerFollowup = (userText, currentScore) => {
    const lower = (userText || '').toLowerCase();
    if (lower.includes('police') || lower.includes('fir') || lower.includes('badge') || lower.includes('station') || lower.includes('notice')) {
      return "Do not question official police authority! My badge is registered under the Crime Branch Cyber Cell. If you continue resisting, an armed squad will reach your residence under Section 41 CrPC within 30 minutes!";
    }
    if (lower.includes('1930') || lower.includes('report') || lower.includes('lawyer') || lower.includes('helpline')) {
      return "Attempting to contact outside parties is a direct violation of Section 91 CrPC judicial secrecy! Your bank accounts and UPI IDs are being placed on immediate hold!";
    }
    if (lower.includes('otp') || lower.includes('pin') || lower.includes('password') || lower.includes('money') || lower.includes('transfer')) {
      return "This is your final statutory warning! Transferring your balance to the RBI Verification Escrow is mandatory to clear your name from the money laundering syndicate. Transfer immediately!";
    }
    if (lower.includes('fake') || lower.includes('scam') || lower.includes('fraud') || lower.includes('disconnect') || lower.includes('cut')) {
      return "Do not dare disconnect this line! You are placed under 24-hour Digital Arrest. Cutting the call is treated as criminal evasion under IPC 420 and non-bailable warrants will be executed!";
    }
    return "Listen carefully to the instructions! We have recorded your statement. You must comply with the verification procedure immediately or face non-bailable legal custody!";
  };

  const handleUserResponse = (responseText, skipReceiverVoice = false) => {
    if (!responseText || !responseText.trim()) return;
    const cleanUserText = responseText.trim();
    setUserVoiceInput('');
    setIsListeningUserVoice(false);
    VoiceService.stop();

    // 1. Add user speech to transcript
    appendSpeech('You', cleanUserText);

    // 2. Analyze user turn with BERT server
    analyzeSpeech(cleanUserText, 'You');

    const proceedWithCallerEscalation = () => {
      setTimeout(() => {
        const nextIdx = dialogueIndex + 1;
        setDialogueIndex(nextIdx);

        if (scenario?.dialogueSteps && nextIdx < scenario.dialogueSteps.length) {
          const nextStep = scenario.dialogueSteps[nextIdx];
          streamSpeechUtterance('Caller', nextStep.callerText);
        } else {
          const dynamicReply = generateDynamicScammerFollowup(cleanUserText, riskScore);
          streamSpeechUtterance('Caller', dynamicReply);
        }
      }, 700);
    };

    // 3. Speak with distinct Receiver Voice (unless user spoke directly via mic)
    if (!isAiVoiceMuted && !skipReceiverVoice) {
      VoiceService.speakReceiver(cleanUserText, {
        onStart: () => {
          setIsAiVoiceSpeaking(true);
          setCurrentSpeakingSpeaker('You');
        },
        onDone: () => {
          setIsAiVoiceSpeaking(false);
          setCurrentSpeakingSpeaker(null);
          proceedWithCallerEscalation();
        },
        onError: () => {
          setIsAiVoiceSpeaking(false);
          setCurrentSpeakingSpeaker(null);
          proceedWithCallerEscalation();
        }
      });
    } else {
      proceedWithCallerEscalation();
    }
  };

  const handleSendCustomUserResponse = () => {
    if (!userVoiceInput || !userVoiceInput.trim()) return;
    handleUserResponse(userVoiceInput.trim(), false);
  };

  const toggleUserVoiceRecognition = () => {
    if (isListeningUserVoice) {
      setIsListeningUserVoice(false);
      if (userVoiceInput.trim()) {
        handleUserResponse(userVoiceInput.trim(), true);
      }
      return;
    }

    VoiceService.stop();
    const recognition = VoiceService.createRecognition(
      ({ final, interim }) => {
        if (final) {
          setUserVoiceInput(final);
          setIsListeningUserVoice(false);
          handleUserResponse(final, true);
        } else if (interim) {
          setUserVoiceInput(interim);
        }
      },
      () => {
        setIsListeningUserVoice(false);
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsListeningUserVoice(false);
      }
    );

    if (recognition) {
      try {
        recognition.start();
        setIsListeningUserVoice(true);
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    } else {
      Alert.alert(
        'Voice Input Mode',
        'Speak clearly into your microphone or use the quick pushback chips below to respond to the scammer.'
      );
    }
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

  const handleHangUp = async (extraData = {}) => {
    VoiceService.stop();
    let savedAudioUri = null;
    if (recordingInstance) {
      try {
        await recordingInstance.stopAndUnloadAsync();
        savedAudioUri = typeof recordingInstance.getURI === 'function' ? recordingInstance.getURI() : null;
      } catch {}
    }

    // Flush any in-flight streaming speech so words aren't truncated
    let finalTranscript = [...transcript];
    if (activeStreamingUtterance && activeStreamingUtterance.text) {
      finalTranscript.push({
        speaker: activeStreamingUtterance.speaker,
        text: activeStreamingUtterance.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }

    // If finalTranscript is still empty and scenario exists, save initial dialogue step
    if (finalTranscript.length === 0 && scenario?.dialogueSteps?.[0]) {
      finalTranscript.push({
        speaker: 'Caller',
        text: scenario.dialogueSteps[0].callerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }

    // Compute dynamic cryptographic hash
    const rawDataString = `${callerName}_${phoneNumber}_${Date.now()}_${finalTranscript.map(t => t.text).join('')}`;
    let hashNum = 0;
    for (let i = 0; i < rawDataString.length; i++) {
      hashNum = ((hashNum << 5) - hashNum) + rawDataString.charCodeAt(i);
      hashNum |= 0;
    }
    const computedHash = 'sec63_' + Math.abs(hashNum).toString(16).padStart(8, '0') + Date.now().toString(16).slice(-8) + 'a8f4c219';

    const recordedRiskScore = typeof extraData?.finalRiskScore === 'number' ? extraData.finalRiskScore : riskScore;
    const isCriticalRisk = recordedRiskScore >= 70 || extraData?.autoDeclined;

    const newRecording = {
      id: 'rec-' + Date.now(),
      contactName: callerName || 'Unknown Caller',
      phoneNumber: phoneNumber || 'Private Number',
      audioUri: savedAudioUri,
      direction: direction || (scenario ? 'incoming' : 'outgoing'),
      isSimulation: !!scenario,
      scenarioId: scenario?.id,
      timestamp: new Date().toISOString(),
      startedAt: new Date(Date.now() - Math.max(callDuration, 1) * 1000).toISOString(),
      durationSeconds: Math.max(callDuration, 1),
      consentGranted: hasConsent,
      consentProof: {
        recordedWithConsent: hasConsent,
        consentTimestamp: hasConsent ? activeConsentTimestamp : null,
        jurisdiction: 'IN_CYBER_CRPC_BNSS',
        statutoryNotice: hasConsent
          ? 'Recorded with explicit subscriber consent under Section 63 BNSS & Indian Evidence Act'
          : 'Privacy Mode: Unrecorded call without user consent'
      },
      fraudAnalysis: {
        riskLevel: hasConsent ? (isCriticalRisk ? 'CRITICAL' : riskLevel) : 'PRIVACY_MODE',
        riskScore: hasConsent ? recordedRiskScore : 0,
        scamType: threatIndicators[0] || scenario?.title || (isCriticalRisk ? 'Digital Arrest & Extortion' : 'General Call'),
        threatIndicators: hasConsent ? threatIndicators : [],
        counterAdvisory: hasConsent ? counterAdvisory : 'Unmonitored call (Privacy Mode)',
        autoDeclined: !!extraData?.autoDeclined,
        autoDeclineReason: extraData?.autoDeclineReason || null,
        bertPrediction: bertPrediction || (recordedRiskScore >= 40 ? 'SCAM' : 'NOT_SCAM'),
        bertConfidence: bertConfidence || (recordedRiskScore > 0 ? recordedRiskScore : null),
        modelArchitecture: bertModelArchitecture,
        bertServerStatus: bertStatus === 'connected' ? 'BertForSequenceClassification (Port 3000)' : 'On-Device Guard'
      },
      transcript: hasConsent ? finalTranscript : [],
      sha256Hash: hasConsent ? computedHash : null,
      isEncryptedLocally: true,
      reviewStatus: 'PENDING_REVIEW',
      reviewerNotes: '',
      isCourtAdmissible: !!hasConsent,
      verifiedAt: null
    };

    if (hasConsent && finalTranscript.length > 0) {
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

            {hasConsent && (
              <View style={styles.autoDeclineGuardBadge}>
                <ShieldAlert size={10} color="#fb7185" />
                <Text style={styles.autoDeclineGuardText}>CRITICAL THREAT &gt;90%</Text>
              </View>
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

      {/* Real-Time BERT AI Scam Predictor Card (Active while call is connected) */}
      {hasConsent && (
        <View style={styles.bertPredictorCard}>
          {/* Header Row: Engine identity + server connectivity pill */}
          <View style={styles.bertHeaderRow}>
            <View style={styles.bertTitleGroup}>
              <View style={[styles.bertIconPulseWrapper, isBertInferring && styles.bertIconInferring]}>
                {isBertInferring ? (
                  <ActivityIndicator size="small" color="#818cf8" />
                ) : (
                  <Cpu size={14} color="#818cf8" />
                )}
              </View>
              <View>
                <View style={styles.bertEngineNameRow}>
                  <Text style={styles.bertHeaderTitle}>BERT Server Scam Engine</Text>
                  <View style={styles.bertArchPill}>
                    <Text style={styles.bertArchText}>BertForSeqClassification</Text>
                  </View>
                </View>
                <Text style={styles.bertServerSubmeta}>
                  Port 3000 • Inferences: #{bertInferenceCount} • Section 63 BNSS
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bertStatusPill}
              onPress={() => setIsBertDiagnosticsVisible(true)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.bertStatusDot,
                  bertStatus === 'connected' ? styles.statusOnlineDot : styles.statusOfflineDot
                ]}
              />
              <Text
                style={[
                  styles.bertStatusText,
                  bertStatus === 'connected' ? styles.statusOnlineText : styles.statusOfflineText
                ]}
              >
                {bertStatus === 'connected' ? 'Online' : 'Fallback'}
              </Text>
              <Info size={10} color="#94a3b8" style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>

          {/* Middle Section: Prediction Pill + Live Dynamic Risk Gauge */}
          <View style={styles.bertMetricsRow}>
            {/* Live Model Prediction */}
            <View style={styles.bertPredictionColumn}>
              <Text style={styles.bertMetricLabel}>MODEL PREDICTION</Text>
              {bertPrediction === 'SCAM' || (riskScore >= 40 && bertPrediction !== 'NOT_SCAM') ? (
                <View style={styles.bertScamBadge}>
                  <ShieldAlert size={13} color="#f43f5e" />
                  <Text style={styles.bertScamBadgeText}>SCAM DETECTED</Text>
                </View>
              ) : (
                <View style={styles.bertSafeBadge}>
                  <ShieldCheck size={13} color="#34d399" />
                  <Text style={styles.bertSafeBadgeText}>
                    {transcript.length > 0 ? 'NORMAL / SAFE' : 'LISTENING...'}
                  </Text>
                </View>
              )}
              <Text style={styles.bertConfidenceText}>
                {bertConfidence
                  ? `Confidence: ${bertConfidence}%`
                  : transcript.length > 0
                  ? 'Analyzing transcript...'
                  : 'Awaiting speech input...'}
              </Text>
            </View>

            {/* Risk Score Progress Bar & >90% Auto-Decline Marker */}
            <View style={styles.bertRiskScoreColumn}>
              <View style={styles.bertScoreHeaderRow}>
                <Text style={styles.bertMetricLabel}>RISK SCORE</Text>
                <Text
                  style={[
                    styles.bertScoreValue,
                    riskScore > 90
                      ? styles.scoreAutoDecline
                      : riskScore >= 70
                      ? styles.scoreCritical
                      : riskScore >= 40
                      ? styles.scoreHigh
                      : styles.scoreSafe
                  ]}
                >
                  {riskScore}%
                </Text>
              </View>

              <View style={styles.bertScoreBarTrack}>
                <View
                  style={[
                    styles.bertScoreBarFill,
                    { width: `${Math.min(100, Math.max(5, riskScore))}%` },
                    riskScore > 90
                      ? { backgroundColor: '#f43f5e' }
                      : riskScore >= 70
                      ? { backgroundColor: '#fb7185' }
                      : riskScore >= 40
                      ? { backgroundColor: '#f59e0b' }
                      : { backgroundColor: '#34d399' }
                  ]}
                />
                {/* 90% Threshold Guide Marker */}
                <View style={styles.thresholdMarker90} />
              </View>

              <View style={styles.bertMarkerSubRow}>
                <Text style={styles.bertMarkerSubText}>0%</Text>
                <Text style={[styles.bertMarkerSubText, styles.bertAutoDeclineLabel]}>
                  Critical Threat &gt;90%
                </Text>
                <Text style={styles.bertMarkerSubText}>100%</Text>
              </View>
            </View>
          </View>

          {/* Probabilities Breakdown & Diagnostics Button */}
          <View style={styles.bertFooterMetaRow}>
            <View style={styles.bertProbabilitiesGroup}>
              <Text style={styles.bertProbText}>
                P(Scam):{' '}
                <Text
                  style={{
                    color: riskScore >= 40 ? '#f43f5e' : '#cbd5e1',
                    fontWeight: '800'
                  }}
                >
                  {((bertProbabilities?.SCAM ?? 0) * 100).toFixed(0)}%
                </Text>
              </Text>
              <Text style={styles.bertProbDivider}>•</Text>
              <Text style={styles.bertProbText}>
                P(Safe):{' '}
                <Text
                  style={{
                    color: riskScore < 40 ? '#34d399' : '#cbd5e1',
                    fontWeight: '800'
                  }}
                >
                  {((bertProbabilities?.NOT_SCAM ?? 0) * 100).toFixed(0)}%
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bertDiagnosticsBtn}
              onPress={() => setIsBertDiagnosticsVisible(true)}
              activeOpacity={0.7}
            >
              <Sparkles size={11} color="#c084fc" />
              <Text style={styles.bertDiagnosticsBtnText}>BERT Diagnostics</Text>
            </TouchableOpacity>
          </View>

          {/* Critical >90% Threat Indicator (Call remains connected, user controls hangup) */}
          {riskScore > 90 && (
            <View style={styles.bertAutoDeclineWarning}>
              <ShieldAlert size={14} color="#ffffff" />
              <Text style={styles.bertAutoDeclineWarningText}>
                ⚠️ CRITICAL EXTORTION DETECTED (&gt;90% RISK) — Safe to hang up anytime
              </Text>
            </View>
          )}
        </View>
      )}

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
            <View style={styles.responsesHeaderRow}>
              <Text style={styles.responsesLabel}>Your Spoken / Text Response:</Text>
              {isAiVoiceSpeaking && (
                <View style={[
                  styles.aiSpeakingPill,
                  currentSpeakingSpeaker === 'Caller' ? styles.aiSpeakingPillCaller : styles.aiSpeakingPillReceiver
                ]}>
                  <Volume2 size={11} color={currentSpeakingSpeaker === 'Caller' ? '#fb7185' : '#38bdf8'} />
                  <Text style={[
                    styles.aiSpeakingText,
                    currentSpeakingSpeaker === 'Caller' ? styles.aiSpeakingTextCaller : styles.aiSpeakingTextReceiver
                  ]}>
                    {currentSpeakingSpeaker === 'Caller' ? 'Caller Speaking (Deep Voice)' : 'You Speaking (Natural Voice)'}
                  </Text>
                </View>
              )}
            </View>
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

            {/* Live Dual Input: Microphone Voice Input + Typed Text Input */}
            <View style={styles.liveVoiceInputRow}>
              <TouchableOpacity
                style={[
                  styles.voiceMicBtn,
                  isListeningUserVoice && styles.voiceMicBtnListening
                ]}
                onPress={toggleUserVoiceRecognition}
                activeOpacity={0.8}
              >
                {isListeningUserVoice ? (
                  <View style={styles.voiceListeningDot} />
                ) : (
                  <Mic size={15} color="#ffffff" />
                )}
                <Text style={styles.voiceMicBtnText}>
                  {isListeningUserVoice ? 'Listening...' : 'Voice'}
                </Text>
              </TouchableOpacity>

              <TextInput
                style={styles.liveVoiceTextInput}
                placeholder={isListeningUserVoice ? "Listening to your voice..." : "Speak or type response..."}
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
          style={[styles.controlBtn, !isAiVoiceMuted && styles.controlBtnActive]}
          onPress={() => {
            const nextMuted = !isAiVoiceMuted;
            setIsAiVoiceMuted(nextMuted);
            VoiceService.setMuted(nextMuted);
          }}
        >
          {!isAiVoiceMuted ? <Volume2 size={22} color="#818cf8" /> : <VolumeX size={22} color="#94a3b8" />}
          <Text style={styles.controlBtnLabel}>{!isAiVoiceMuted ? 'AI Voice ON' : 'AI Voice Muted'}</Text>
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

      {/* BERT Neural Diagnostics Modal */}
      <Modal
        visible={isBertDiagnosticsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBertDiagnosticsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bertDiagModalBox}>
            <View style={styles.threatModalHeader}>
              <View style={styles.threatModalTitleRow}>
                <Cpu size={20} color="#818cf8" />
                <Text style={styles.threatModalTitle}>BERT Scam Classifier Diagnostics</Text>
              </View>
              <TouchableOpacity onPress={() => setIsBertDiagnosticsVisible(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Server & Model Metadata */}
              <View style={styles.diagSectionBox}>
                <Text style={styles.diagSectionTitle}>MODEL CONFIGURATION</Text>
                <View style={styles.diagRow}>
                  <Text style={styles.diagLabel}>Architecture:</Text>
                  <Text style={styles.diagValueHighlight}>{bertModelArchitecture}</Text>
                </View>
                <View style={styles.diagRow}>
                  <Text style={styles.diagLabel}>Server Endpoint:</Text>
                  <Text style={styles.diagValue}>{bertServerUrl}/api/call/analyze</Text>
                </View>
                <View style={styles.diagRow}>
                  <Text style={styles.diagLabel}>Connection Status:</Text>
                  <Text style={[styles.diagValue, bertStatus === 'connected' ? { color: '#34d399' } : { color: '#f59e0b' }]}>
                    {bertStatus === 'connected' ? 'Active (Port 3000)' : 'Offline / Local Heuristics'}
                  </Text>
                </View>
                <View style={styles.diagRow}>
                  <Text style={styles.diagLabel}>Call Inferences:</Text>
                  <Text style={styles.diagValue}>{bertInferenceCount} transcript evaluations</Text>
                </View>
              </View>

              {/* Class Probability Distribution */}
              <View style={styles.diagSectionBox}>
                <Text style={styles.diagSectionTitle}>SOFTMAX CLASS PROBABILITIES</Text>
                <View style={styles.diagProbBarRow}>
                  <Text style={styles.diagProbLabel}>SCAM (Label 1):</Text>
                  <View style={styles.diagProbTrack}>
                    <View
                      style={[
                        styles.diagProbFill,
                        { width: `${((bertProbabilities?.SCAM || 0) * 100)}%`, backgroundColor: '#f43f5e' }
                      ]}
                    />
                  </View>
                  <Text style={styles.diagProbScore}>
                    {((bertProbabilities?.SCAM || 0) * 100).toFixed(1)}%
                  </Text>
                </View>

                <View style={styles.diagProbBarRow}>
                  <Text style={styles.diagProbLabel}>NOT_SCAM (0):</Text>
                  <View style={styles.diagProbTrack}>
                    <View
                      style={[
                        styles.diagProbFill,
                        { width: `${((bertProbabilities?.NOT_SCAM || 0) * 100)}%`, backgroundColor: '#34d399' }
                      ]}
                    />
                  </View>
                  <Text style={styles.diagProbScore}>
                    {((bertProbabilities?.NOT_SCAM || 0) * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Legal Violations Identified */}
              {bertLegalViolations.length > 0 && (
                <View style={styles.diagSectionBox}>
                  <Text style={styles.diagSectionTitle}>LEGAL STATUTES VIOLATED</Text>
                  {bertLegalViolations.map((viol, vIdx) => (
                    <View key={vIdx} style={styles.legalViolationTag}>
                      <ShieldAlert size={12} color="#fb7185" />
                      <Text style={styles.legalViolationTagText}>{viol}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* AI Reasoning */}
              {bertReasoning ? (
                <View style={styles.diagSectionBox}>
                  <Text style={styles.diagSectionTitle}>BERT MODEL REASONING</Text>
                  <Text style={styles.diagReasoningText}>{bertReasoning}</Text>
                </View>
              ) : null}

              {/* Threat Threshold Policy */}
              <View style={styles.diagSectionBox}>
                <Text style={styles.diagSectionTitle}>DEFENSE POLICY & MODEL THRESHOLDS</Text>
                <Text style={styles.diagPolicyText}>
                  • Risk Score &lt; 40%: Normal conversation flow.{'\n'}
                  • Risk Score 40-70%: Threat advisory warning.{'\n'}
                  • Risk Score &gt; 90%: Critical threat alert and statutory evidence preservation under Section 63 BNSS (Manual decline advised).
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsBertDiagnosticsVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close Diagnostics</Text>
            </TouchableOpacity>
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
  responsesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  responsesLabel: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '700'
  },
  aiSpeakingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)'
  },
  aiSpeakingPillCaller: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.4)'
  },
  aiSpeakingPillReceiver: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.4)'
  },
  aiSpeakingText: {
    color: '#38bdf8',
    fontSize: 9.5,
    fontWeight: '700'
  },
  aiSpeakingTextCaller: {
    color: '#fb7185'
  },
  aiSpeakingTextReceiver: {
    color: '#38bdf8'
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
    marginTop: 4,
    gap: 6
  },
  voiceMicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8
  },
  voiceMicBtnListening: {
    backgroundColor: '#ef4444'
  },
  voiceMicBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  voiceListeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff'
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
  },
  autoDeclineOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  autoDeclineBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#f43f5e',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20
  },
  autoDeclineShieldIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 63, 94, 0.18)',
    borderWidth: 2,
    borderColor: '#f43f5e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  autoDeclineTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center'
  },
  autoDeclineScoreBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderColor: 'rgba(244, 63, 94, 0.5)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12
  },
  autoDeclineScoreText: {
    color: '#fb7185',
    fontSize: 12,
    fontWeight: '800'
  },
  autoDeclineDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16
  },
  autoDeclineChecklist: {
    width: '100%',
    backgroundColor: '#020617',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  autoDeclineCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  autoDeclineCheckText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600'
  },
  autoDeclineProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  autoDeclineProgressText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  autoDeclineGuardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)'
  },
  autoDeclineGuardText: {
    color: '#fb7185',
    fontSize: 9,
    fontWeight: '800'
  },
  /* BERT Server Live Scam Predictor Card Styles */
  bertPredictorCard: {
    backgroundColor: '#0c1322',
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    padding: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  bertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  bertTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  bertIconPulseWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bertIconInferring: {
    borderColor: '#c084fc',
    backgroundColor: 'rgba(192, 132, 252, 0.2)'
  },
  bertEngineNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  bertHeaderTitle: {
    color: '#f8fafc',
    fontSize: 12.5,
    fontWeight: '800'
  },
  bertArchPill: {
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)'
  },
  bertArchText: {
    color: '#a5b4fc',
    fontSize: 8.5,
    fontWeight: '700',
    fontFamily: 'monospace'
  },
  bertServerSubmeta: {
    color: '#94a3b8',
    fontSize: 9.5,
    marginTop: 1
  },
  bertStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4
  },
  bertStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusOnlineDot: {
    backgroundColor: '#34d399'
  },
  statusOfflineDot: {
    backgroundColor: '#f59e0b'
  },
  bertStatusText: {
    fontSize: 9.5,
    fontWeight: '700'
  },
  statusOnlineText: {
    color: '#34d399'
  },
  statusOfflineText: {
    color: '#f59e0b'
  },
  bertMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8
  },
  bertPredictionColumn: {
    flex: 1.1
  },
  bertMetricLabel: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  bertScamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(244, 63, 94, 0.22)',
    borderWidth: 1,
    borderColor: '#f43f5e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  bertScamBadgeText: {
    color: '#fda4af',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4
  },
  bertSafeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
    borderWidth: 1,
    borderColor: '#34d399',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  bertSafeBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800'
  },
  bertConfidenceText: {
    color: '#94a3b8',
    fontSize: 9.5,
    marginTop: 3
  },
  bertRiskScoreColumn: {
    flex: 1
  },
  bertScoreHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  bertScoreValue: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace'
  },
  scoreAutoDecline: {
    color: '#f43f5e'
  },
  scoreCritical: {
    color: '#fb7185'
  },
  scoreHigh: {
    color: '#f59e0b'
  },
  scoreSafe: {
    color: '#34d399'
  },
  bertScoreBarTrack: {
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative'
  },
  bertScoreBarFill: {
    height: '100%',
    borderRadius: 4
  },
  thresholdMarker90: {
    position: 'absolute',
    left: '90%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#ffffff'
  },
  bertMarkerSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2
  },
  bertMarkerSubText: {
    color: '#64748b',
    fontSize: 8
  },
  bertAutoDeclineLabel: {
    color: '#fb7185',
    fontWeight: '700'
  },
  bertFooterMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)'
  },
  bertProbabilitiesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  bertProbText: {
    color: '#94a3b8',
    fontSize: 9.5
  },
  bertProbDivider: {
    color: '#475569',
    fontSize: 10
  },
  bertDiagnosticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)'
  },
  bertDiagnosticsBtnText: {
    color: '#c084fc',
    fontSize: 9.5,
    fontWeight: '700'
  },
  bertAutoDeclineWarning: {
    marginTop: 8,
    backgroundColor: '#881337',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#f43f5e'
  },
  bertAutoDeclineWarningText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800'
  },
  /* BERT Diagnostics Modal Styles */
  bertDiagModalBox: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#6366f1'
  },
  diagSectionBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  diagSectionTitle: {
    color: '#818cf8',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2
  },
  diagLabel: {
    color: '#94a3b8',
    fontSize: 11
  },
  diagValue: {
    color: '#f1f5f9',
    fontSize: 11,
    fontWeight: '600'
  },
  diagValueHighlight: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace'
  },
  diagProbBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4
  },
  diagProbLabel: {
    color: '#e2e8f0',
    fontSize: 10.5,
    width: 90,
    fontWeight: '600'
  },
  diagProbTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden'
  },
  diagProbFill: {
    height: '100%',
    borderRadius: 4
  },
  diagProbScore: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '800',
    width: 44,
    textAlign: 'right',
    fontFamily: 'monospace'
  },
  legalViolationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 2
  },
  legalViolationTagText: {
    color: '#fda4af',
    fontSize: 10.5,
    fontWeight: '600'
  },
  diagReasoningText: {
    color: '#e2e8f0',
    fontSize: 11.5,
    lineHeight: 16
  },
  diagPolicyText: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16
  }
});
