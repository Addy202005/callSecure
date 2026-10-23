import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  PhoneIncoming,
  Radio,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lock,
  Zap,
  Info,
  CheckCircle2,
  FileText,
  Search
} from 'lucide-react-native';
import { SCAM_SCENARIOS } from '../data/scamScenarios';
import { PhraseDetectionService } from '../services/phraseDetectionService';

export function ScamSimulatorScreen({
  onStartScenarioCall,
  onSimulateIncomingCall,
  onStartCustomCall,
  onNavigateToVault
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedScenarioId, setExpandedScenarioId] = useState(null);

  // Custom Scam Sandbox State
  const [customText, setCustomText] = useState('');
  const [sandboxResult, setSandboxResult] = useState(null);

  const categories = [
    { id: 'ALL', label: 'All Scenarios' },
    { id: 'digital_arrest', label: 'Digital Arrest' },
    { id: 'rbi_kyc', label: 'Bank KYC & OTP' },
    { id: 'customs_parcel', label: 'Customs Hub' },
    { id: 'task_investment', label: 'Job & Tasks' },
    { id: 'lottery_fraud', label: 'Lottery & UPI' },
    { id: 'safe_personal', label: 'Safe Control' }
  ];

  const filteredScenarios = SCAM_SCENARIOS.filter(scen => {
    const matchesCategory = selectedCategory === 'ALL' || scen.category === selectedCategory;
    const matchesSearch =
      scen.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scen.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scen.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id) => {
    setExpandedScenarioId(prev => (prev === id ? null : id));
  };

  const handleTestSandbox = () => {
    if (!customText.trim()) return;
    const analysis = PhraseDetectionService.scanText(customText);
    const lureCheck = PhraseDetectionService.detectOtpOrPersonalDetailsLure(customText, 'caller');
    setSandboxResult({
      analysis,
      lureCheck
    });
  };

  const handleLaunchCustomSimulation = () => {
    if (!customText.trim()) {
      Alert.alert('Script Required', 'Please enter a test scam phrase or select a preset.');
      return;
    }
    onStartCustomCall(
      'Custom Suspect Simulator',
      '+91 99999 00000',
      customText.trim()
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroShieldBox}>
              <ShieldAlert size={24} color="#f43f5e" />
            </View>
            <View style={styles.heroTitleCol}>
              <Text style={styles.heroTitle}>Cyber Extortion Simulator</Text>
              <Text style={styles.heroSubtitle}>
                Train against real-world scams • Section 63 BNSS Vault Evidence
              </Text>
            </View>
          </View>

          {/* Quick Metrics */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{SCAM_SCENARIOS.length}</Text>
              <Text style={styles.statLabel}>Scenarios</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#34d399' }]}>BNSS 63</Text>
              <Text style={styles.statLabel}>Consent Proof</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#818cf8' }]}>BERT AI</Text>
              <Text style={styles.statLabel}>Threat Guard</Text>
            </View>
          </View>
        </View>

        {/* Consent & Vault Educational Notice */}
        <View style={styles.consentNoticeCard}>
          <View style={styles.consentNoticeTitleRow}>
            <Lock size={15} color="#34d399" />
            <Text style={styles.consentNoticeTitle}>
              Automatic Consent & Vault Storage Flow
            </Text>
          </View>
          <Text style={styles.consentNoticeDesc}>
            When starting any simulation, SafeShield will request statutory consent to record audio
            and transcribe live speech. Upon conclusion, your call recording and full forensic analysis
            are automatically encrypted and kept in your master <Text style={styles.highlightText}>Secure Vault</Text>.
          </Text>
          <TouchableOpacity
            style={styles.openVaultLink}
            onPress={onNavigateToVault}
          >
            <Text style={styles.openVaultLinkText}>Open Evidence Vault (PIN: 1930) →</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={16} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scam scenarios, tactics or callers..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                selectedCategory === cat.id && styles.categoryPillActive
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === cat.id && styles.categoryPillTextActive
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Scenario Cards */}
        <View style={styles.scenarioSection}>
          <Text style={styles.sectionHeading}>
            Interactive Simulation Library ({filteredScenarios.length})
          </Text>

          {filteredScenarios.map(scen => {
            const isSafe = scen.riskExpectation === 'LOW';
            const isExpanded = expandedScenarioId === scen.id;

            return (
              <View key={scen.id} style={styles.card}>
                {/* Card Top Info */}
                <View style={styles.cardHeader}>
                  {scen.avatar ? (
                    <Image source={{ uri: scen.avatar }} style={styles.callerAvatar} />
                  ) : (
                    <View style={[styles.avatarBox, isSafe ? styles.bgSafe : styles.bgDanger]}>
                      {isSafe ? <ShieldCheck size={20} color="#34d399" /> : <ShieldAlert size={20} color="#f43f5e" />}
                    </View>
                  )}

                  <View style={styles.headerInfo}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.scenarioTitle} numberOfLines={1}>
                        {scen.title}
                      </Text>
                    </View>
                    <Text style={styles.callerSub}>
                      {scen.callerName} • {scen.callerPhone}
                    </Text>
                    <Text style={styles.roleSub}>{scen.callerRole}</Text>
                  </View>

                  <View style={[styles.riskBadge, isSafe ? styles.riskBadgeSafe : styles.riskBadgeDanger]}>
                    <Text style={[styles.riskBadgeText, isSafe ? styles.colorSafe : styles.colorDanger]}>
                      {isSafe ? 'AUTHENTIC' : 'HIGH THREAT'}
                    </Text>
                  </View>
                </View>

                {/* Scenario Description */}
                <Text style={styles.descriptionText}>{scen.description}</Text>

                {/* Coercive Tactics Pills */}
                {scen.tactics && (
                  <View style={styles.tacticsRow}>
                    {scen.tactics.map((tac, idx) => (
                      <View key={idx} style={styles.tacticPill}>
                        <Text style={styles.tacticPillText}>⚠️ {tac}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Collapsible Script & Pushback Preview */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    <View style={styles.expandedHeader}>
                      <Zap size={14} color="#818cf8" />
                      <Text style={styles.expandedTitle}>Simulated Dialogue Stages & Defense Answers:</Text>
                    </View>

                    {scen.dialogueSteps.map((step, sIdx) => (
                      <View key={sIdx} style={styles.stepBox}>
                        <Text style={styles.stepNum}>Stage {step.step}:</Text>
                        <Text style={styles.stepCallerText}>"{step.callerText}"</Text>

                        <Text style={styles.pushbackHeading}>Recommended Pushback Responses:</Text>
                        {step.suggestedUserResponses.map((resp, rIdx) => (
                          <Text key={rIdx} style={styles.pushbackItem}>
                            • {resp}
                          </Text>
                        ))}
                      </View>
                    ))}

                    <View style={styles.advisoryBox}>
                      <Info size={13} color="#f59e0b" />
                      <Text style={styles.advisoryText}>{scen.counterAdvisory}</Text>
                    </View>
                  </View>
                )}

                {/* Toggle Script Preview Button */}
                <TouchableOpacity
                  style={styles.expandToggle}
                  onPress={() => toggleExpand(scen.id)}
                >
                  <Text style={styles.expandToggleText}>
                    {isExpanded ? 'Hide Dialogue Steps' : 'View Dialogue Stages & Pushbacks'}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={16} color="#818cf8" />
                  ) : (
                    <ChevronDown size={16} color="#818cf8" />
                  )}
                </TouchableOpacity>

                {/* Action Buttons: Incoming Simulation & Direct Call */}
                <View style={styles.actionButtonsRow}>
                  {/* Incoming Call Simulation Button (User's phone rings!) */}
                  <TouchableOpacity
                    style={styles.incomingBtn}
                    activeOpacity={0.8}
                    onPress={() => onSimulateIncomingCall(scen)}
                  >
                    <PhoneIncoming size={16} color="#ffffff" />
                    <Text style={styles.incomingBtnText}>Simulate Incoming</Text>
                  </TouchableOpacity>

                  {/* Direct Outgoing Simulation Call */}
                  <TouchableOpacity
                    style={styles.directBtn}
                    activeOpacity={0.8}
                    onPress={() => onStartScenarioCall(scen)}
                  >
                    <PhoneCall size={16} color="#818cf8" />
                    <Text style={styles.directBtnText}>Start Call</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Custom Scam Script Sandbox Tester */}
        <View style={styles.sandboxSection}>
          <View style={styles.sandboxHeader}>
            <Sparkles size={18} color="#c084fc" />
            <Text style={styles.sandboxTitle}>Custom Script Testing Sandbox</Text>
          </View>
          <Text style={styles.sandboxSubtitle}>
            Type or paste any suspect pitch to inspect on-device NLP threat score, or test it live.
          </Text>

          <TextInput
            style={styles.sandboxInput}
            multiline
            numberOfLines={3}
            placeholder="E.g., You are placed under 24-hour DIGITAL ARREST for money laundering. Transfer funds to secret court escrow..."
            placeholderTextColor="#64748b"
            value={customText}
            onChangeText={setCustomText}
          />

          {/* Quick Presets */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
            {[
              {
                label: 'Digital Arrest',
                text: 'You are under 24-hour DIGITAL ARREST for money laundering under IPC 420. Do not disconnect.'
              },
              {
                label: 'OTP Phishing',
                text: 'Your SBI debit card KYC expired today. Tell me the 6-digit OTP code to prevent account block.'
              },
              {
                label: 'Narcotics Parcel',
                text: 'Your FedEx package to Taiwan contains 140g MDMA narcotics. Pay ₹45,000 bail bond via UPI.'
              },
              {
                label: 'Power Cut APK',
                text: 'Electricity will be disconnected at 9:30 PM. Download the APK file on WhatsApp to update meter.'
              }
            ].map((preset, pIdx) => (
              <TouchableOpacity
                key={pIdx}
                style={styles.presetChip}
                onPress={() => setCustomText(preset.text)}
              >
                <Text style={styles.presetChipText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sandboxActionRow}>
            <TouchableOpacity
              style={styles.testBtn}
              activeOpacity={0.8}
              onPress={handleTestSandbox}
            >
              <Zap size={15} color="#ffffff" />
              <Text style={styles.testBtnText}>Analyze Threat NLP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simulateCustomBtn}
              activeOpacity={0.8}
              onPress={handleLaunchCustomSimulation}
            >
              <PhoneCall size={15} color="#ffffff" />
              <Text style={styles.simulateCustomBtnText}>Simulate Custom Call</Text>
            </TouchableOpacity>
          </View>

          {/* Sandbox NLP Result */}
          {sandboxResult && (
            <View style={styles.resultBox}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Risk Score:</Text>
                <Text
                  style={[
                    styles.resultScore,
                    sandboxResult.analysis.stats.riskScore >= 70
                      ? styles.colorDanger
                      : sandboxResult.analysis.stats.riskScore >= 40
                      ? { color: '#f59e0b' }
                      : styles.colorSafe
                  ]}
                >
                  {sandboxResult.analysis.stats.riskScore}% ({sandboxResult.analysis.stats.highestSeverity})
                </Text>
              </View>

              {sandboxResult.lureCheck.isLureDetected && (
                <View style={styles.lureWarning}>
                  <AlertTriangle size={14} color="#f43f5e" />
                  <Text style={styles.lureWarningText}>
                    Credential / OTP Lure: {sandboxResult.lureCheck.label}
                  </Text>
                </View>
              )}

              {sandboxResult.analysis.flaggedPhrases.length > 0 && (
                <View style={styles.flaggedList}>
                  <Text style={styles.flaggedTitle}>Detected Coercion Triggers:</Text>
                  {sandboxResult.analysis.flaggedPhrases.map((phrase, fIdx) => (
                    <Text key={fIdx} style={styles.flaggedItem}>
                      • "{phrase.matchedText}" → {phrase.categoryLabel} ({phrase.severity})
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
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
    padding: 16,
    paddingBottom: 40
  },
  heroBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  heroShieldBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)'
  },
  heroTitleCol: {
    flex: 1
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  heroSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800'
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  consentNoticeCard: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    marginBottom: 16
  },
  consentNoticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  consentNoticeTitle: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '800'
  },
  consentNoticeDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17
  },
  highlightText: {
    color: '#34d399',
    fontWeight: '700'
  },
  openVaultLink: {
    marginTop: 8
  },
  openVaultLinkText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
    gap: 8
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 16
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  categoryPillActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1'
  },
  categoryPillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  categoryPillTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  scenarioSection: {
    marginBottom: 24
  },
  sectionHeading: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10
  },
  callerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#334155'
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bgDanger: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)'
  },
  bgSafe: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)'
  },
  headerInfo: {
    flex: 1
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  scenarioTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    flex: 1
  },
  callerSub: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  roleSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1
  },
  riskBadgeDanger: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.3)'
  },
  riskBadgeSafe: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.3)'
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  colorDanger: {
    color: '#f43f5e'
  },
  colorSafe: {
    color: '#34d399'
  },
  descriptionText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10
  },
  tacticsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  tacticPill: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  tacticPillText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600'
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 6,
    marginBottom: 12
  },
  expandToggleText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700'
  },
  expandedSection: {
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  expandedTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  stepBox: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  stepNum: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700'
  },
  stepCallerText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontStyle: 'italic',
    marginVertical: 4
  },
  pushbackHeading: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4
  },
  pushbackItem: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16
  },
  advisoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 8,
    borderRadius: 8
  },
  advisoryText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '600',
    flex: 1
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10
  },
  incomingBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f43f5e',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  incomingBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  directBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#818cf8',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6
  },
  directBtnText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '700'
  },
  sandboxSection: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  sandboxTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  sandboxSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12
  },
  sandboxInput: {
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
    textAlignVertical: 'top',
    marginBottom: 10
  },
  presetsRow: {
    marginBottom: 12
  },
  presetChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8
  },
  presetChipText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700'
  },
  sandboxActionRow: {
    flexDirection: 'row',
    gap: 10
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6
  },
  testBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  simulateCustomBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6
  },
  simulateCustomBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  resultBox: {
    marginTop: 14,
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  resultLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  resultScore: {
    fontSize: 13,
    fontWeight: '800'
  },
  lureWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    padding: 8,
    borderRadius: 8,
    marginVertical: 6
  },
  lureWarningText: {
    color: '#f43f5e',
    fontSize: 11,
    fontWeight: '700'
  },
  flaggedList: {
    marginTop: 4
  },
  flaggedTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4
  },
  flaggedItem: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16
  }
});
