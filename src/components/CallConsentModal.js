import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  Disc,
  Lock,
  Phone,
  PhoneOff,
  AlertTriangle,
  Zap,
  Info,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react-native';

export function CallConsentModal({
  visible,
  callerName,
  phoneNumber,
  callType = 'Outgoing Call',
  onConsentGranted,
  onConsentDeclined,
  onCancel
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.shieldBadge}>
              <ShieldCheck size={24} color="#34d399" />
              <View style={styles.recDot} />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>Statutory Consent Required</Text>
              <Text style={styles.headerSubtitle}>
                Indian Evidence Act • Sec 63 BNSS Compliance
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Recipient Details Card */}
            <View style={styles.callTargetCard}>
              <View style={styles.targetIconCircle}>
                <Phone size={18} color="#818cf8" />
              </View>
              <View style={styles.targetInfo}>
                <Text style={styles.targetName} numberOfLines={1}>
                  {callerName || 'Unknown Contact'}
                </Text>
                <Text style={styles.targetPhone}>{phoneNumber || 'Private Line'}</Text>
              </View>
              <View style={styles.targetTypeBadge}>
                <Text style={styles.targetTypeText}>{callType}</Text>
              </View>
            </View>

            {/* Mandatory Legal Disclosure Notice */}
            <View style={styles.legalNoticeBox}>
              <View style={styles.legalNoticeTitleRow}>
                <AlertTriangle size={15} color="#f59e0b" />
                <Text style={styles.legalNoticeTitle}>Voice AI & Call Recording Notice</Text>
              </View>
              <Text style={styles.legalNoticeDesc}>
                To detect cyber extortion, digital arrest threats, and OTP theft,
                SafeShield requires explicit consent before activating real-time voice recording
                and live speech transcription for this call.
              </Text>
            </View>

            {/* Feature Highlights Grid */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
                  <Disc size={16} color="#f43f5e" />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Encrypted Voice Recording</Text>
                  <Text style={styles.featureDesc}>
                    Forensic in-memory audio capture for 1930 Cyber Cell evidentiary filing.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Zap size={16} color="#818cf8" />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Real-Time Speech-to-Text</Text>
                  <Text style={styles.featureDesc}>
                    Live incremental transcription streaming every spoken utterance as text.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
                  <ShieldCheck size={16} color="#34d399" />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Neural BERT Threat Shield</Text>
                  <Text style={styles.featureDesc}>
                    Continuous NLP classification for fake arrest warrants, police impersonation & bank scams.
                  </Text>
                </View>
              </View>
            </View>

            {/* Statutory Choice Explanation */}
            <View style={styles.choiceNoteBox}>
              <Info size={13} color="#94a3b8" />
              <Text style={styles.choiceNoteText}>
                Consent must be granted every time a call is initiated. If declined, the call will proceed
                in Privacy Mode with recording and live AI transcription disabled.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* 1. Grant Consent (Primary Action) */}
            <TouchableOpacity
              style={styles.grantConsentBtn}
              activeOpacity={0.85}
              onPress={onConsentGranted}
            >
              <View style={styles.grantConsentIcon}>
                <ShieldCheck size={20} color="#ffffff" />
              </View>
              <View style={styles.grantConsentTextCol}>
                <Text style={styles.grantConsentBtnText}>Consent & Start AI Shield</Text>
                <Text style={styles.grantConsentSubtext}>
                  Record audio • Live transcript • AI Threat Guard
                </Text>
              </View>
            </TouchableOpacity>

            {/* 2. Decline Recording (Privacy Mode) */}
            <TouchableOpacity
              style={styles.declineConsentBtn}
              activeOpacity={0.8}
              onPress={onConsentDeclined}
            >
              <Lock size={16} color="#94a3b8" />
              <View style={styles.declineConsentTextCol}>
                <Text style={styles.declineConsentBtnText}>Decline (Privacy Mode Only)</Text>
                <Text style={styles.declineConsentSubtext}>
                  No audio recording • No AI transcription
                </Text>
              </View>
            </TouchableOpacity>

            {/* 3. Cancel Call */}
            <TouchableOpacity
              style={styles.cancelCallBtn}
              activeOpacity={0.7}
              onPress={onCancel}
            >
              <PhoneOff size={15} color="#ef4444" />
              <Text style={styles.cancelCallBtnText}>Cancel Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalBox: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#334155',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 24
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  shieldBadge: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)'
  },
  recDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f43f5e'
  },
  headerTextCol: {
    flex: 1,
    marginLeft: 12
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2
  },
  headerSubtitle: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  closeBtn: {
    padding: 6
  },
  scrollArea: {
    marginTop: 14,
    marginBottom: 14
  },
  callTargetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12
  },
  targetIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  targetInfo: {
    flex: 1,
    marginLeft: 10
  },
  targetName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  targetPhone: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 1
  },
  targetTypeBadge: {
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)'
  },
  targetTypeText: {
    color: '#c7d2fe',
    fontSize: 10,
    fontWeight: '700'
  },
  legalNoticeBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: 14
  },
  legalNoticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  legalNoticeTitle: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700'
  },
  legalNoticeDesc: {
    color: '#cbd5e1',
    fontSize: 11.5,
    lineHeight: 16
  },
  featuresList: {
    gap: 10,
    marginBottom: 12
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#131e36',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  featureIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1
  },
  featureTextCol: {
    flex: 1,
    marginLeft: 10
  },
  featureTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700'
  },
  featureDesc: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2
  },
  choiceNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 8,
    borderRadius: 8
  },
  choiceNoteText: {
    flex: 1,
    color: '#64748b',
    fontSize: 10.5,
    lineHeight: 14
  },
  actionsContainer: {
    gap: 10,
    paddingTop: 8
  },
  grantConsentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6
  },
  grantConsentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  grantConsentTextCol: {
    flex: 1,
    marginLeft: 12
  },
  grantConsentBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  grantConsentSubtext: {
    color: '#d1fae5',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2
  },
  declineConsentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  declineConsentTextCol: {
    flex: 1,
    marginLeft: 10
  },
  declineConsentBtnText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700'
  },
  declineConsentSubtext: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 1
  },
  cancelCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6
  },
  cancelCallBtnText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700'
  }
});
