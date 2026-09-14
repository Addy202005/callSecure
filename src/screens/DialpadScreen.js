import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Phone, Delete, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react-native';
import { DialpadKey } from '../components/DialpadKey';
import { SCAM_SCENARIOS } from '../data/scamScenarios';

const KEYS = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' }
];

export function DialpadScreen({ onStartCustomCall, onStartScenarioCall }) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleKeyPress = (digit) => {
    if (phoneNumber.length < 16) {
      setPhoneNumber(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleLongPressZero = () => {
    setPhoneNumber(prev => prev + '+');
  };

  const handleCallPress = () => {
    if (!phoneNumber) return;
    onStartCustomCall('Direct Dial', phoneNumber, 'Hello, I am calling regarding your account verification.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dialer & Scam Simulator</Text>
          <Text style={styles.headerSubtitle}>
            AI Speech Shield Active • Real-time Threat Guard
          </Text>
        </View>

        {/* Dialed Number Display */}
        <View style={styles.displayContainer}>
          <Text style={styles.displayNumber} numberOfLines={1}>
            {phoneNumber || ' '}
          </Text>
          {phoneNumber.length > 0 && (
            <TouchableOpacity
              style={styles.backspaceButton}
              onPress={handleBackspace}
              onLongPress={() => setPhoneNumber('')}
            >
              <Delete size={22} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Dialpad Matrix */}
        <View style={styles.dialpadGrid}>
          {KEYS.map((k) => (
            <DialpadKey
              key={k.digit}
              digit={k.digit}
              letters={k.letters}
              onPress={handleKeyPress}
            />
          ))}
        </View>

        {/* Circular Call Action Button */}
        <View style={styles.callRow}>
          <TouchableOpacity
            style={[styles.callButton, !phoneNumber && styles.callButtonDisabled]}
            disabled={!phoneNumber}
            activeOpacity={0.8}
            onPress={handleCallPress}
          >
            <Phone size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Scam Scenario Simulation Section */}
        <View style={styles.scenarioSection}>
          <View style={styles.scenarioHeader}>
            <Sparkles size={16} color="#818cf8" />
            <Text style={styles.scenarioTitle}>Simulate Known Cyber Fraud Calls</Text>
          </View>
          <Text style={styles.scenarioDescription}>
            Test live real-time speech threat detection against authentic extortion scripts.
          </Text>

          <View style={styles.scenarioList}>
            {SCAM_SCENARIOS.slice(0, 4).map((scen) => (
              <TouchableOpacity
                key={scen.id}
                style={styles.scenarioCard}
                activeOpacity={0.7}
                onPress={() => onStartScenarioCall(scen)}
              >
                <View style={styles.scenarioCardHeader}>
                  <View style={styles.scenarioIconBox}>
                    <ShieldAlert size={16} color="#f43f5e" />
                  </View>
                  <View style={styles.scenarioTextCol}>
                    <Text style={styles.scenarioCardTitle}>{scen.title}</Text>
                    <Text style={styles.scenarioCaller}>
                      {scen.callerName} • {scen.callerPhone}
                    </Text>
                  </View>
                  <View style={styles.testBadge}>
                    <Text style={styles.testBadgeText}>Test</Text>
                  </View>
                </View>
                <Text style={styles.scenarioSnippet} numberOfLines={2}>
                  {scen.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617'
  },
  scrollContent: {
    paddingBottom: 40
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
    alignItems: 'center'
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2
  },
  displayContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 6,
    position: 'relative'
  },
  displayNumber: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: 'monospace'
  },
  backspaceButton: {
    position: 'absolute',
    right: 32,
    padding: 8
  },
  dialpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 320,
    alignSelf: 'center',
    marginTop: 8
  },
  callRow: {
    alignItems: 'center',
    marginVertical: 14
  },
  callButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6
  },
  callButtonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
    shadowOpacity: 0
  },
  scenarioSection: {
    marginTop: 10,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  scenarioTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700'
  },
  scenarioDescription: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12
  },
  scenarioList: {
    gap: 10
  },
  scenarioCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  scenarioCardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scenarioIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  scenarioTextCol: {
    flex: 1
  },
  scenarioCardTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  scenarioCaller: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 1
  },
  testBadge: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  testBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700'
  },
  scenarioSnippet: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 8,
    lineHeight: 15
  }
});
