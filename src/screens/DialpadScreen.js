import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Phone,
  PhoneCall,
  Delete,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  UserPlus,
  Clock,
  Zap,
  Info,
  Check,
  X,
  ExternalLink
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { DialpadKey } from '../components/DialpadKey';
import { SCAM_SCENARIOS } from '../data/scamScenarios';
import { StorageService } from '../services/storageService';

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

const SPEED_DIALS = [
  { label: 'Cyber Crime', number: '1930', desc: 'National Cyber Fraud Portal', badge: '1930' },
  { label: 'National SOS', number: '112', desc: 'All Emergency Services', badge: '112' },
  { label: 'Police SOS', number: '100', desc: 'Emergency Police Line', badge: '100' },
  { label: 'TRAI Spam', number: '1909', desc: 'Telecom Spam & DND', badge: '1909' }
];

// T9 digit mapping
const T9_MAP = {
  '2': 'abc',
  '3': 'def',
  '4': 'ghi',
  '5': 'jkl',
  '6': 'mno',
  '7': 'pqrs',
  '8': 'tuv',
  '9': 'wxyz'
};

export function DialpadScreen({ onStartCustomCall, onStartScenarioCall }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contacts, setContacts] = useState([]);
  const [recentDials, setRecentDials] = useState([]);
  const [activeViewMode, setActiveViewMode] = useState('keypad'); // 'keypad' | 'scenarios' | 'recents'
  
  // Quick Add Contact Modal State
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setContacts(StorageService.getContacts() || []);
    setRecentDials(StorageService.getRecentDials() || []);
  };

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(style);
      }
    } catch {
      // Safe fallback
    }
  };

  const handleKeyPress = (digit) => {
    if (phoneNumber.length < 18) {
      setPhoneNumber(prev => prev + digit);
    }
  };

  const handleLongPressKey = (digit) => {
    if (digit === '0') {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      setPhoneNumber(prev => prev + '+');
    }
  };

  const handleBackspace = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setPhoneNumber('');
  };

  // Find matching contacts dynamically as user types
  const matchedContacts = useMemo(() => {
    if (!phoneNumber || phoneNumber.length < 2) return [];
    const cleanQuery = phoneNumber.replace(/[\s\-\(\)\+]/g, '');

    return contacts.filter(c => {
      const cleanPhone = (c.phone || '').replace(/[\s\-\(\)\+]/g, '');
      if (cleanPhone.includes(cleanQuery)) return true;

      // T9 name search
      const name = (c.name || '').toLowerCase();
      let isT9Match = false;
      if (/^\d+$/.test(cleanQuery)) {
        let pattern = '^';
        for (let char of cleanQuery) {
          const letters = T9_MAP[char];
          if (letters) {
            pattern += `[${letters}]`;
          } else {
            pattern += '.';
          }
        }
        try {
          const reg = new RegExp(pattern, 'i');
          const words = name.split(/\s+/);
          isT9Match = words.some(w => reg.test(w)) || reg.test(name);
        } catch {
          isT9Match = false;
        }
      }
      return isT9Match;
    }).slice(0, 4);
  }, [phoneNumber, contacts]);

  // Exact contact match if any
  const exactContactMatch = useMemo(() => {
    if (!phoneNumber) return null;
    const clean = phoneNumber.replace(/\D/g, '');
    if (!clean) return null;
    return contacts.find(c => (c.phone || '').replace(/\D/g, '') === clean);
  }, [phoneNumber, contacts]);

  // Handle SafeShield AI Protected Call
  const handleStartProtectedCall = async (targetNumber, targetName) => {
    const dialNum = targetNumber || phoneNumber;
    if (!dialNum) return;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    const callerName = targetName || exactContactMatch?.name || 'Direct Dial Line';

    // Record in recent dials
    const updated = await StorageService.addRecentDial({
      name: callerName,
      phone: dialNum,
      type: 'outgoing'
    });
    setRecentDials(updated);

    onStartCustomCall(
      callerName,
      dialNum,
      'Hello, I am calling regarding your account verification and official communication.'
    );
  };

  // Direct Cellular Native Dial via Linking (tel:)
  const handleNativeCellularCall = (targetNumber) => {
    const dialNum = targetNumber || phoneNumber;
    if (!dialNum) return;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    const cleanNum = dialNum.replace(/\s+/g, '');
    const url = `tel:${cleanNum}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          StorageService.addRecentDial({
            name: exactContactMatch?.name || 'Direct Dial Line',
            phone: dialNum,
            type: 'cellular'
          }).then(updated => setRecentDials(updated));
          
          return Linking.openURL(url);
        } else {
          Alert.alert('Notice', `Placing direct cellular call to ${dialNum}`);
        }
      })
      .catch((err) => {
        console.warn('Linking error:', err);
        Alert.alert('Notice', `Placing call to ${dialNum}`);
      });
  };

  // Quick Speed Dial Tap
  const handleSpeedDialPress = (entry) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setPhoneNumber(entry.number);
  };

  // Save new contact from dialer
  const handleSaveContactFromDialer = async () => {
    if (!newContactName.trim() || !phoneNumber.trim()) return;

    const newContact = {
      id: 'cnt-' + Date.now(),
      name: newContactName.trim(),
      phone: phoneNumber.trim(),
      company: newContactCompany.trim() || undefined,
      category: 'personal',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      isFavorite: false,
      callCount: 1,
      notes: 'Added directly from SafeShield Dialer',
      riskRating: 'SAFE',
      reputationScore: 98,
      reportCount: 0,
      createdAt: new Date().toISOString()
    };

    const updated = await StorageService.addContact(newContact);
    setContacts([...updated]);
    setIsAddContactModalOpen(false);
    setNewContactName('');
    setNewContactCompany('');
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.shieldPulse}>
              <ShieldCheck size={18} color="#10b981" />
            </View>
            <Text style={styles.headerTitle}>callSecure Smart Dialer</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Real-Time AI Phishing Detection & Direct Line Protection
          </Text>
        </View>

        {/* View Mode Switcher Tabs */}
        <View style={styles.viewModeTabs}>
          <TouchableOpacity
            style={[styles.viewTab, activeViewMode === 'keypad' && styles.viewTabActive]}
            onPress={() => setActiveViewMode('keypad')}
          >
            <Phone size={14} color={activeViewMode === 'keypad' ? '#ffffff' : '#94a3b8'} />
            <Text style={[styles.viewTabText, activeViewMode === 'keypad' && styles.viewTabTextActive]}>
              Dialpad
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewTab, activeViewMode === 'scenarios' && styles.viewTabActive]}
            onPress={() => setActiveViewMode('scenarios')}
          >
            <Sparkles size={14} color={activeViewMode === 'scenarios' ? '#ffffff' : '#94a3b8'} />
            <Text style={[styles.viewTabText, activeViewMode === 'scenarios' && styles.viewTabTextActive]}>
              Scam Simulators ({SCAM_SCENARIOS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewTab, activeViewMode === 'recents' && styles.viewTabActive]}
            onPress={() => setActiveViewMode('recents')}
          >
            <Clock size={14} color={activeViewMode === 'recents' ? '#ffffff' : '#94a3b8'} />
            <Text style={[styles.viewTabText, activeViewMode === 'recents' && styles.viewTabTextActive]}>
              Recents ({recentDials.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeViewMode === 'keypad' && (
          <View>
            {/* Speed Dial / Emergency Hotkeys */}
            <View style={styles.speedDialContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.speedDialScroll}>
                {SPEED_DIALS.map((sd) => (
                  <TouchableOpacity
                    key={sd.number}
                    style={styles.speedDialChip}
                    activeOpacity={0.7}
                    onPress={() => handleSpeedDialPress(sd)}
                  >
                    <View style={styles.speedDialBadge}>
                      <Text style={styles.speedDialBadgeText}>{sd.badge}</Text>
                    </View>
                    <Text style={styles.speedDialLabel}>{sd.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Matched Contact Header or Add Contact Banner */}
            {exactContactMatch ? (
              <View style={styles.matchedContactBanner}>
                <View style={styles.matchedAvatar}>
                  <Text style={styles.matchedAvatarText}>
                    {exactContactMatch.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.matchedInfo}>
                  <Text style={styles.matchedName} numberOfLines={1}>{exactContactMatch.name}</Text>
                  <Text style={styles.matchedCompany}>{exactContactMatch.company || 'Saved Contact'}</Text>
                </View>
                <View style={[
                  styles.riskPill,
                  exactContactMatch.category === 'suspicious' ? styles.riskPillHigh : styles.riskPillSafe
                ]}>
                  <Text style={styles.riskPillText}>
                    {exactContactMatch.category === 'suspicious' ? 'Suspect' : 'Safe 98%'}
                  </Text>
                </View>
              </View>
            ) : phoneNumber.length >= 3 ? (
              <View style={styles.unknownNumberBanner}>
                <Text style={styles.unknownNumberText}>Unsaved Number</Text>
                <TouchableOpacity
                  style={styles.addContactQuickBtn}
                  onPress={() => setIsAddContactModalOpen(true)}
                >
                  <UserPlus size={14} color="#818cf8" />
                  <Text style={styles.addContactQuickText}>Save Contact</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Live T9 / Number Suggestions */}
            {matchedContacts.length > 0 && !exactContactMatch && (
              <View style={styles.suggestionDrawer}>
                <Text style={styles.suggestionHeader}>Suggested Contacts:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionList}>
                  {matchedContacts.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.suggestionChip}
                      onPress={() => setPhoneNumber(c.phone)}
                    >
                      <Text style={styles.suggestionChipName}>{c.name}</Text>
                      <Text style={styles.suggestionChipPhone}>{c.phone}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Main Dialed Number Display */}
            <View style={styles.displayContainer}>
              <Text
                style={[
                  styles.displayNumber,
                  phoneNumber.length > 12 && styles.displayNumberSmall
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {phoneNumber || ' '}
              </Text>

              {phoneNumber.length > 0 && (
                <TouchableOpacity
                  style={styles.backspaceButton}
                  onPress={handleBackspace}
                  onLongPress={handleClearAll}
                  activeOpacity={0.6}
                >
                  <Delete size={24} color="#cbd5e1" />
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
                  onLongPress={handleLongPressKey}
                />
              ))}
            </View>

            {/* Call Action Bar */}
            <View style={styles.callActionBar}>
              {/* Secondary Direct GSM Cellular Call */}
              <TouchableOpacity
                style={[styles.secondaryCallBtn, !phoneNumber && styles.callBtnDisabled]}
                disabled={!phoneNumber}
                onPress={() => handleNativeCellularCall(phoneNumber)}
                activeOpacity={0.7}
              >
                <ExternalLink size={20} color={phoneNumber ? "#94a3b8" : "#475569"} />
                <Text style={[styles.secondaryCallText, !phoneNumber && styles.callBtnDisabledText]}>
                  Cellular
                </Text>
              </TouchableOpacity>

              {/* Primary SafeShield AI Protected Call Button */}
              <TouchableOpacity
                style={[styles.primaryCallButton, !phoneNumber && styles.primaryCallButtonDisabled]}
                disabled={!phoneNumber}
                activeOpacity={0.8}
                onPress={() => handleStartProtectedCall(phoneNumber, exactContactMatch?.name)}
              >
                <Phone size={30} color="#ffffff" />
              </TouchableOpacity>

              {/* Quick Clear or Info Button */}
              <TouchableOpacity
                style={[styles.secondaryCallBtn, !phoneNumber && styles.callBtnDisabled]}
                disabled={!phoneNumber}
                onPress={handleClearAll}
                activeOpacity={0.7}
              >
                <X size={20} color={phoneNumber ? "#94a3b8" : "#475569"} />
                <Text style={[styles.secondaryCallText, !phoneNumber && styles.callBtnDisabledText]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>

            {/* AI Call Shield Guarantee Badge */}
            <View style={styles.aiProtectionPill}>
              <Zap size={14} color="#10b981" />
              <Text style={styles.aiProtectionText}>
                Active AI Voice Guard: Real-time extortion & phishing phrase scoring
              </Text>
            </View>
          </View>
        )}

        {/* Scam Scenarios Simulation Tab */}
        {activeViewMode === 'scenarios' && (
          <View style={styles.scenarioSection}>
            <View style={styles.scenarioHeaderRow}>
              <Sparkles size={18} color="#818cf8" />
              <Text style={styles.scenarioTitle}>Authentic Cyber Scam Simulations</Text>
            </View>
            <Text style={styles.scenarioDescription}>
              Select any real-world cyber fraud extortion scenario to test SafeShield's live speech BERT classification and phrase guard in action.
            </Text>

            <View style={styles.scenarioList}>
              {SCAM_SCENARIOS.map((scen) => {
                const isSafe = scen.riskExpectation === 'LOW';
                return (
                  <TouchableOpacity
                    key={scen.id}
                    style={styles.scenarioCard}
                    activeOpacity={0.7}
                    onPress={() => onStartScenarioCall(scen)}
                  >
                    <View style={styles.scenarioCardHeader}>
                      <View style={[styles.scenarioIconBox, isSafe && styles.scenarioIconBoxSafe]}>
                        {isSafe ? (
                          <ShieldCheck size={18} color="#34d399" />
                        ) : (
                          <ShieldAlert size={18} color="#f43f5e" />
                        )}
                      </View>
                      <View style={styles.scenarioTextCol}>
                        <Text style={styles.scenarioCardTitle}>{scen.title}</Text>
                        <Text style={styles.scenarioCaller}>
                          {scen.callerName} • {scen.callerPhone}
                        </Text>
                      </View>
                      <View style={[styles.testBadge, isSafe && styles.testBadgeSafe]}>
                        <Text style={[styles.testBadgeText, isSafe && styles.testBadgeTextSafe]}>
                          {isSafe ? 'Legit Call' : 'Scam Test'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.scenarioSnippet} numberOfLines={2}>
                      {scen.description}
                    </Text>

                    <View style={styles.scenarioLaunchRow}>
                      <Text style={styles.scenarioLaunchHint}>Tap to simulate live call</Text>
                      <PhoneCall size={14} color="#818cf8" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent Dials Tab */}
        {activeViewMode === 'recents' && (
          <View style={styles.recentsSection}>
            <View style={styles.scenarioHeaderRow}>
              <Clock size={18} color="#818cf8" />
              <Text style={styles.scenarioTitle}>Recent Dialed Calls</Text>
            </View>

            {recentDials.length === 0 ? (
              <View style={styles.emptyRecents}>
                <Phone size={32} color="#475569" />
                <Text style={styles.emptyRecentsText}>No outgoing calls yet</Text>
              </View>
            ) : (
              <View style={styles.recentsList}>
                {recentDials.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recentItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setPhoneNumber(item.phone);
                      setActiveViewMode('keypad');
                    }}
                  >
                    <View style={styles.recentAvatar}>
                      <Text style={styles.recentAvatarText}>
                        {(item.name || 'D').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName}>{item.name}</Text>
                      <Text style={styles.recentPhone}>{item.phone}</Text>
                    </View>
                    <Text style={styles.recentTime}>{item.timestamp}</Text>
                    <TouchableOpacity
                      style={styles.recentCallAction}
                      onPress={() => handleStartProtectedCall(item.phone, item.name)}
                    >
                      <Phone size={16} color="#10b981" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add New Contact Quick Modal */}
      <Modal
        visible={isAddContactModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddContactModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Contact</Text>
              <TouchableOpacity onPress={() => setIsAddContactModalOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={[styles.modalInput, styles.modalInputDisabled]}
              value={phoneNumber}
              editable={false}
            />

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor="#64748b"
              value={newContactName}
              onChangeText={setNewContactName}
              autoFocus
            />

            <Text style={styles.inputLabel}>Company / Relationship (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. HDFC Bank, Colleague"
              placeholderTextColor="#64748b"
              value={newContactCompany}
              onChangeText={setNewContactCompany}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsAddContactModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, !newContactName.trim() && styles.modalSaveBtnDisabled]}
                disabled={!newContactName.trim()}
                onPress={handleSaveContactFromDialer}
              >
                <Text style={styles.modalSaveText}>Save Contact</Text>
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
    backgroundColor: '#020617'
  },
  scrollContent: {
    paddingBottom: 40
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  shieldPulse: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center'
  },
  viewModeTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  viewTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9
  },
  viewTabActive: {
    backgroundColor: '#3b82f6'
  },
  viewTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  viewTabTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  speedDialContainer: {
    marginTop: 4,
    marginBottom: 4
  },
  speedDialScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  speedDialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  speedDialBadge: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10
  },
  speedDialBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  speedDialLabel: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600'
  },
  matchedContactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    marginHorizontal: 16,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10
  },
  matchedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  matchedAvatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14
  },
  matchedInfo: {
    flex: 1
  },
  matchedName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  matchedCompany: {
    color: '#64748b',
    fontSize: 11
  },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  riskPillSafe: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)'
  },
  riskPillHigh: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)'
  },
  riskPillText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700'
  },
  unknownNumberBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginTop: 6
  },
  unknownNumberText: {
    color: '#64748b',
    fontSize: 11
  },
  addContactQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  addContactQuickText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '600'
  },
  suggestionDrawer: {
    marginHorizontal: 16,
    marginTop: 4
  },
  suggestionHeader: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginLeft: 4
  },
  suggestionList: {
    gap: 8
  },
  suggestionChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  suggestionChipName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  suggestionChipPhone: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'monospace'
  },
  displayContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 4,
    position: 'relative'
  },
  displayNumber: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: 'monospace'
  },
  displayNumberSmall: {
    fontSize: 24,
    letterSpacing: 1
  },
  backspaceButton: {
    position: 'absolute',
    right: 24,
    padding: 10
  },
  dialpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 320,
    alignSelf: 'center',
    marginTop: 4
  },
  callActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 10,
    marginBottom: 6
  },
  secondaryCallBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 2
  },
  secondaryCallText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600'
  },
  primaryCallButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8
  },
  primaryCallButtonDisabled: {
    backgroundColor: '#1e293b',
    opacity: 0.5,
    shadowOpacity: 0
  },
  callBtnDisabled: {
    opacity: 0.3
  },
  callBtnDisabledText: {
    color: '#475569'
  },
  aiProtectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    marginHorizontal: 20
  },
  aiProtectionText: {
    color: '#94a3b8',
    fontSize: 10.5,
    textAlign: 'center'
  },
  scenarioSection: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  scenarioHeaderRow: {
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
    marginBottom: 12,
    lineHeight: 16
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
  scenarioIconBoxSafe: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)'
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
  testBadgeSafe: {
    backgroundColor: '#065f46'
  },
  testBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700'
  },
  testBadgeTextSafe: {
    color: '#a7f3d0'
  },
  scenarioSnippet: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 8,
    lineHeight: 15
  },
  scenarioLaunchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 6
  },
  scenarioLaunchHint: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '600'
  },
  recentsSection: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  recentsList: {
    marginTop: 12,
    gap: 8
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10
  },
  recentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recentAvatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13
  },
  recentInfo: {
    flex: 1
  },
  recentName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  recentPhone: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace'
  },
  recentTime: {
    color: '#64748b',
    fontSize: 10
  },
  recentCallAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyRecents: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8
  },
  emptyRecentsText: {
    color: '#64748b',
    fontSize: 13
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700'
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8
  },
  modalInput: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14
  },
  modalInputDisabled: {
    backgroundColor: '#0b1120',
    color: '#94a3b8'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10
  },
  modalCancelText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600'
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 10
  },
  modalSaveBtnDisabled: {
    opacity: 0.5
  },
  modalSaveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  }
});
