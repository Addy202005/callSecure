import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldAlert,
  Send,
  Copy,
  CheckCircle2,
  FileText,
  Phone,
  HelpCircle
} from 'lucide-react-native';

export function CyberReportingScreen({ initialRecording, onClearInitialRecording }) {
  const [suspectPhone, setSuspectPhone] = useState('');
  const [suspectName, setSuspectName] = useState('');
  const [scamCategory, setScamCategory] = useState('Digital Arrest Extortion');
  const [demandedAmount, setDemandedAmount] = useState('');
  const [incidentSummary, setIncidentSummary] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialRecording) {
      setSuspectPhone(initialRecording.phoneNumber || '');
      setSuspectName(initialRecording.contactName || '');
      if (initialRecording.fraudAnalysis?.scamType) {
        setScamCategory(initialRecording.fraudAnalysis.scamType);
      }
      const transcriptText = (initialRecording.transcript || [])
        .map(t => `${t.speaker}: "${t.text}"`)
        .join('\n');

      setIncidentSummary(
        `Received coercive fraudulent call from suspect claiming to be law enforcement/bank authorities. Attached audio transcript excerpt:\n${transcriptText}\n\nEvidence Hash: ${initialRecording.sha256Hash || 'SHA-256 Verified'}`
      );
    }
  }, [initialRecording]);

  const generateComplaintText = () => {
    return `=== NATIONAL CYBER CRIME REPORTING PORTAL (1930) INCIDENT DRAFT ===
Date: ${new Date().toLocaleString()}
Incident Category: ${scamCategory}
Suspect Phone Number: ${suspectPhone || 'Unspecified'}
Suspect Alias / Caller Identity: ${suspectName || 'Unknown Caller'}
Demanded / Extorted Amount: ${demandedAmount ? '₹' + demandedAmount : 'No financial transfer completed'}

INCIDENT NARRATIVE:
${incidentSummary || 'Victim received an unsolicited extortion call demanding money under threat of arrest / penalty.'}

LEGAL ADVISORY & EVIDENCE:
- SafeShield Consent-Managed Recording Verified
- Cues Flagged: Digital Arrest Coercion / Unauthorized Escrow Transfer Demand
- Citing: Section 41A, 70, 72 CrPC / BNSS violations & IPC 420/120B/384

Reported via SafeShield Mobile App Defense Suite`;
  };

  const handleShareReport = async () => {
    const text = generateComplaintText();
    try {
      await Share.share({
        message: text,
        title: 'Cybercrime Complaint Draft - 1930'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCallHelpline = () => {
    Alert.alert(
      'Call National Cyber Helpline',
      'Dial 1930 to connect with the Citizen Financial Cyber Fraud Reporting Management System?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 1930', onPress: () => {} }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <ShieldAlert size={22} color="#f43f5e" />
            <Text style={styles.headerTitle}>Cybercrime Reporting</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Official Format for Portal & 1930 Helpline Assistance
          </Text>
        </View>

        {/* 1930 Quick Call Helpline Banner */}
        <TouchableOpacity
          style={styles.helplineBanner}
          activeOpacity={0.8}
          onPress={handleCallHelpline}
        >
          <View style={styles.helplineIconBox}>
            <Phone size={18} color="#ffffff" />
          </View>
          <View style={styles.helplineTextCol}>
            <Text style={styles.helplineTitle}>National Cyber Helpline 1930</Text>
            <Text style={styles.helplineSubtitle}>
              Emergency 24/7 financial freeze for unauthorized transfers
            </Text>
          </View>
          <View style={styles.dialBadge}>
            <Text style={styles.dialBadgeText}>DIAL</Text>
          </View>
        </TouchableOpacity>

        {/* Complaint Details Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Incident Evidence Dossier</Text>

          <Text style={styles.label}>Suspect Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 98201 54321"
            placeholderTextColor="#64748b"
            value={suspectPhone}
            onChangeText={setSuspectPhone}
          />

          <Text style={styles.label}>Suspect Caller Name / Claimed Agency</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Inspector Chauhan (Fake Mumbai Crime Branch)"
            placeholderTextColor="#64748b"
            value={suspectName}
            onChangeText={setSuspectName}
          />

          <Text style={styles.label}>Scam Category</Text>
          <View style={styles.categoryGrid}>
            {[
              'Digital Arrest Extortion',
              'Bank KYC / OTP Theft',
              'FedEx Contraband Parcel',
              'Electricity Bill Threat',
              'Fake Stock Investment'
            ].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, scamCategory === cat && styles.categoryChipActive]}
                onPress={() => setScamCategory(cat)}
              >
                <Text style={[styles.categoryChipText, scamCategory === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Demanded Extortion Amount (₹ INR)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 500000 (leave blank if blocked before transfer)"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={demandedAmount}
            onChangeText={setDemandedAmount}
          />

          <Text style={styles.label}>Incident Timeline & Call Transcript Excerpts</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={5}
            placeholder="Describe what the scammer said and attach transcript details..."
            placeholderTextColor="#64748b"
            value={incidentSummary}
            onChangeText={setIncidentSummary}
          />

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.8}
              onPress={handleShareReport}
            >
              <Send size={16} color="#ffffff" />
              <Text style={styles.shareBtnText}>Share Complaint</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Complaint Preview */}
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <FileText size={14} color="#818cf8" />
            <Text style={styles.previewTitle}>Generated Complaint Text Preview</Text>
          </View>
          <Text style={styles.previewText}>{generateComplaintText()}</Text>
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
    paddingBottom: 10
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800'
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2
  },
  helplineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4338ca'
  },
  helplineIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  helplineTextCol: {
    flex: 1
  },
  helplineTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  helplineSubtitle: {
    color: '#c7d2fe',
    fontSize: 11
  },
  dialBadge: {
    backgroundColor: '#3730a3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  dialBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  formContainer: {
    marginHorizontal: 16,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#ffffff',
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155'
  },
  categoryChipActive: {
    backgroundColor: '#3730a3',
    borderColor: '#6366f1'
  },
  categoryChipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  actionRow: {
    marginTop: 16
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 12
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  previewContainer: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: '#0a0f1d',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  previewTitle: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700'
  },
  previewText: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'monospace'
  }
});
