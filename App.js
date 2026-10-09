import React, { useState, useEffect, Component } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Users, Phone, ShieldCheck, ShieldAlert, FileText, Lock, AlertTriangle, RefreshCw } from 'lucide-react-native';

import { ContactsScreen } from './src/screens/ContactsScreen';
import { DialpadScreen } from './src/screens/DialpadScreen';
import { LiveCallScreen } from './src/screens/LiveCallScreen';
import { SecureVaultScreen } from './src/screens/SecureVaultScreen';
import { CyberReportingScreen } from './src/screens/CyberReportingScreen';
import { CallConsentModal } from './src/components/CallConsentModal';
import { StorageService } from './src/services/storageService';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('App error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#020617" />
          <AlertTriangle size={48} color="#f43f5e" />
          <Text style={styles.errorTitle}>SafeShield encountered an issue</Text>
          <Text style={styles.errorSubtitle}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <RefreshCw size={18} color="#ffffff" />
            <Text style={styles.retryButtonText}>Restart SafeShield</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'dialpad' | 'vault' | 'reporting'
  const [isReady, setIsReady] = useState(false);

  // Active Call State
  const [activeCall, setActiveCall] = useState(null);

  // Pre-Call Consent State (Every call requires explicit user consent)
  const [pendingCall, setPendingCall] = useState(null);

  // Handoff to Cyber Reporting
  const [reportingRecording, setReportingRecording] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        await StorageService.init();
      } catch (err) {
        console.warn('StorageService init failed, continuing:', err);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  // Call Handlers - Open Consent Verification Prompt Every Time
  const handleStartCallFromContact = (contact) => {
    setPendingCall({
      callerName: contact.name,
      phoneNumber: contact.phone,
      callType: contact.category === 'suspicious' ? 'Suspect Flagged Contact' : 'Direct Contact Call',
      scenario: undefined,
      customScript: contact.category === 'suspicious'
        ? 'This is Inspector Chauhan from Cyber Police. You are under Digital Arrest for money laundering.'
        : 'Hello! I am calling to follow up on our previous conversation.'
    });
  };

  const handleStartCustomCall = (callerName, phoneNumber, script) => {
    setPendingCall({
      callerName,
      phoneNumber,
      callType: 'Direct Dial Line',
      scenario: undefined,
      customScript: script
    });
  };

  const handleStartScenarioCall = (scenario) => {
    setPendingCall({
      callerName: scenario.callerName,
      phoneNumber: scenario.callerPhone,
      callType: `Simulation: ${scenario.title}`,
      scenario: scenario,
      customScript: undefined
    });
  };

  // Statutory Consent Callbacks
  const handleConsentGranted = () => {
    if (!pendingCall) return;
    setActiveCall({
      ...pendingCall,
      consentGranted: true,
      consentTimestamp: new Date().toISOString()
    });
    setPendingCall(null);
  };

  const handleConsentDeclined = () => {
    if (!pendingCall) return;
    setActiveCall({
      ...pendingCall,
      consentGranted: false,
      consentTimestamp: null
    });
    setPendingCall(null);
  };

  const handleCancelPendingCall = () => {
    setPendingCall(null);
  };

  const handleEndCall = (recording) => {
    setActiveCall(null);
    setActiveTab('vault');
  };

  const handleHandoffToReport = (recording) => {
    setReportingRecording(recording);
    setActiveTab('reporting');
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        <ShieldCheck size={48} color="#6366f1" />
        <Text style={styles.loadingText}>Initializing SafeShield Mobile...</Text>
      </View>
    );
  }

  // Active Call takes over entire screen
  if (activeCall) {
    return (
      <LiveCallScreen
        callerName={activeCall.callerName}
        phoneNumber={activeCall.phoneNumber}
        scenario={activeCall.scenario}
        customScript={activeCall.customScript}
        consentGranted={activeCall.consentGranted}
        consentTimestamp={activeCall.consentTimestamp}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Screen Content */}
      <View style={styles.screenContent}>
        {activeTab === 'contacts' && (
          <ContactsScreen onStartCall={handleStartCallFromContact} />
        )}

        {activeTab === 'dialpad' && (
          <DialpadScreen
            onStartCustomCall={handleStartCustomCall}
            onStartScenarioCall={handleStartScenarioCall}
          />
        )}

        {activeTab === 'vault' && (
          <SecureVaultScreen onHandoffToReport={handleHandoffToReport} />
        )}

        {activeTab === 'reporting' && (
          <CyberReportingScreen
            initialRecording={reportingRecording}
            onClearInitialRecording={() => setReportingRecording(null)}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'contacts' && styles.tabItemActive]}
          onPress={() => setActiveTab('contacts')}
        >
          <Users size={20} color={activeTab === 'contacts' ? '#818cf8' : '#64748b'} />
          <Text style={[styles.tabLabel, activeTab === 'contacts' && styles.tabLabelActive]}>
            Contacts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'dialpad' && styles.tabItemActive]}
          onPress={() => setActiveTab('dialpad')}
        >
          <Phone size={20} color={activeTab === 'dialpad' ? '#818cf8' : '#64748b'} />
          <Text style={[styles.tabLabel, activeTab === 'dialpad' && styles.tabLabelActive]}>
            Dialer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'vault' && styles.tabItemActive]}
          onPress={() => setActiveTab('vault')}
        >
          <Lock size={20} color={activeTab === 'vault' ? '#818cf8' : '#64748b'} />
          <Text style={[styles.tabLabel, activeTab === 'vault' && styles.tabLabelActive]}>
            Vault
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'reporting' && styles.tabItemActive]}
          onPress={() => setActiveTab('reporting')}
        >
          <ShieldAlert size={20} color={activeTab === 'reporting' ? '#f43f5e' : '#64748b'} />
          <Text style={[styles.tabLabel, activeTab === 'reporting' && styles.tabLabelActive]}>
            1930 Report
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statutory Call Recording & Real-Time AI Consent Prompt (Every Call Made) */}
      <CallConsentModal
        visible={!!pendingCall}
        callerName={pendingCall?.callerName}
        phoneNumber={pendingCall?.phoneNumber}
        callType={pendingCall?.callType}
        onConsentGranted={handleConsentGranted}
        onConsentDeclined={handleConsentDeclined}
        onCancel={handleCancelPendingCall}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600'
  },
  screenContent: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingBottom: 8,
    paddingTop: 6,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 3
  },
  tabItemActive: {
    transform: [{ scale: 1.05 }]
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600'
  },
  tabLabelActive: {
    color: '#818cf8',
    fontWeight: '700'
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8
  },
  errorSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

