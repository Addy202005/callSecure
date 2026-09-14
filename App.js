import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { Users, Phone, ShieldCheck, ShieldAlert, FileText, Lock } from 'lucide-react-native';

import { ContactsScreen } from './src/screens/ContactsScreen';
import { DialpadScreen } from './src/screens/DialpadScreen';
import { LiveCallScreen } from './src/screens/LiveCallScreen';
import { SecureVaultScreen } from './src/screens/SecureVaultScreen';
import { CyberReportingScreen } from './src/screens/CyberReportingScreen';
import { StorageService } from './src/services/storageService';

export default function App() {
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'dialpad' | 'vault' | 'reporting'
  const [isReady, setIsReady] = useState(false);

  // Active Call State
  const [activeCall, setActiveCall] = useState(null);

  // Handoff to Cyber Reporting
  const [reportingRecording, setReportingRecording] = useState(null);

  useEffect(() => {
    async function prepare() {
      await StorageService.init();
      setIsReady(true);
    }
    prepare();
  }, []);

  // Call Handlers
  const handleStartCallFromContact = (contact) => {
    setActiveCall({
      callerName: contact.name,
      phoneNumber: contact.phone,
      scenario: undefined,
      customScript: contact.category === 'suspicious'
        ? 'This is Inspector Chauhan from Cyber Police. You are under Digital Arrest for money laundering.'
        : 'Hello! I am calling to follow up on our previous conversation.'
    });
  };

  const handleStartCustomCall = (callerName, phoneNumber, script) => {
    setActiveCall({
      callerName,
      phoneNumber,
      scenario: undefined,
      customScript: script
    });
  };

  const handleStartScenarioCall = (scenario) => {
    setActiveCall({
      callerName: scenario.callerName,
      phoneNumber: scenario.callerPhone,
      scenario: scenario,
      customScript: undefined
    });
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
  }
});
