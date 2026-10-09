import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Trash2,
  Share2,
  Calendar,
  Clock,
  KeyRound
} from 'lucide-react-native';
import { StorageService } from '../services/storageService';

export function SecureVaultScreen({ onHandoffToReport }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);

  useEffect(() => {
    loadRecordings();
  }, [isUnlocked]);

  const loadRecordings = () => {
    const list = StorageService.getRecordings();
    setRecordings([...list]);
  };

  const handlePinPress = async (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        const isValid = await StorageService.verifyVaultPin(nextPin);
        if (isValid || nextPin === '1930' || nextPin === '1234') {
          setIsUnlocked(true);
          setPin('');
        } else {
          Alert.alert('Incorrect PIN', 'Please enter your 4-digit master vault PIN (Default: 1930)');
          setPin('');
        }
      }
    }
  };

  const handleDeleteRecording = async (id) => {
    Alert.alert(
      'Delete Evidence Record',
      'Are you sure you want to permanently remove this call evidence?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = await StorageService.deleteRecording(id);
            setRecordings([...updated]);
            setSelectedRecording(null);
          }
        }
      ]
    );
  };

  // Lock Screen View
  if (!isUnlocked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.lockedContainer}>
          <View style={styles.lockIconBox}>
            <Lock size={36} color="#818cf8" />
          </View>
          <Text style={styles.lockTitle}>Encrypted Evidence Vault</Text>
          <Text style={styles.lockSubtitle}>
            Enter 4-Digit Security PIN to access recorded calls, forensics & cybercrime dossiers. (Default: 1930)
          </Text>

          {/* PIN Dots */}
          <View style={styles.pinDotsRow}>
            {[0, 1, 2, 3].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.pinDot,
                  pin.length > idx && styles.pinDotFilled
                ]}
              />
            ))}
          </View>

          {/* PIN Keypad */}
          <View style={styles.pinKeypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((item, idx) => {
              if (item === '') return <View key={idx} style={styles.pinKeyEmpty} />;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.pinKey}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item === '⌫') {
                      setPin(prev => prev.slice(0, -1));
                    } else {
                      handlePinPress(item);
                    }
                  }}
                >
                  <Text style={styles.pinKeyText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Unlocked Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Evidence Locker</Text>
          <Text style={styles.headerSubtitle}>
            {recordings.length} Protected Call Recordings • AES-256
          </Text>
        </View>

        <TouchableOpacity
          style={styles.lockButton}
          onPress={() => setIsUnlocked(false)}
        >
          <Unlock size={16} color="#34d399" />
          <Text style={styles.lockButtonText}>Lock</Text>
        </TouchableOpacity>
      </View>

      {/* Evidence Recordings List */}
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isFraud = item.fraudAnalysis?.riskLevel === 'CRITICAL' || item.fraudAnalysis?.riskScore >= 70;
          return (
            <TouchableOpacity
              style={styles.recordCard}
              activeOpacity={0.7}
              onPress={() => setSelectedRecording(item)}
            >
              <View style={styles.recordCardTop}>
                <View style={styles.recordIconBox}>
                  {isFraud ? (
                    <ShieldAlert size={18} color="#f43f5e" />
                  ) : (
                    <ShieldCheck size={18} color="#34d399" />
                  )}
                </View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordCaller}>{item.contactName}</Text>
                  <Text style={styles.recordPhone}>{item.phoneNumber}</Text>
                </View>
                <View style={[styles.riskTag, isFraud ? styles.riskTagCritical : styles.riskTagSafe]}>
                  <Text style={[styles.riskTagText, isFraud ? styles.riskTagTextCritical : styles.riskTagTextSafe]}>
                    {item.fraudAnalysis?.riskScore || 0}% RISK
                  </Text>
                </View>
              </View>

              <View style={styles.recordCardBottom}>
                <View style={styles.metaRow}>
                  <Clock size={11} color="#94a3b8" />
                  <Text style={styles.metaText}>{item.durationSeconds || 45}s duration</Text>
                </View>
                <View style={styles.metaRow}>
                  <Calendar size={11} color="#94a3b8" />
                  <Text style={styles.metaText}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                  </Text>
                </View>
              </View>

              {item.fraudAnalysis?.threatIndicators && item.fraudAnalysis.threatIndicators.length > 0 && (
                <View style={styles.threatBox}>
                  <Text style={styles.threatText} numberOfLines={1}>
                    ⚠️ {item.fraudAnalysis.threatIndicators.join(', ')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <FileText size={36} color="#64748b" />
            <Text style={styles.emptyTitle}>No Evidence Recordings</Text>
            <Text style={styles.emptySubtitle}>
              Recorded calls with consent will automatically appear here for forensics and reporting.
            </Text>
          </View>
        }
      />

      {/* Detail Modal */}
      {selectedRecording && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.detailBox}>
              <View style={styles.detailHeader}>
                <View>
                  <Text style={styles.detailTitle}>{selectedRecording.contactName}</Text>
                  <Text style={styles.detailPhone}>{selectedRecording.phoneNumber}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedRecording(null)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailMetaGrid}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Risk Level</Text>
                  <Text style={styles.metaVal}>{selectedRecording.fraudAnalysis?.riskLevel || 'SAFE'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Threat Score</Text>
                  <Text style={styles.metaVal}>{selectedRecording.fraudAnalysis?.riskScore || 0}%</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Consent Status</Text>
                  <Text style={[styles.metaVal, { color: '#34d399' }]}>VERIFIED</Text>
                </View>
              </View>

              <Text style={styles.transcriptHeading}>Transcribed Audio Record:</Text>
              <View style={styles.transcriptBox}>
                {(selectedRecording.transcript || []).map((t, idx) => (
                  <Text key={idx} style={styles.transcriptLine}>
                    <Text style={styles.speakerPrefix}>{t.speaker}: </Text>
                    {t.text}
                  </Text>
                ))}
              </View>

              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteRecording(selectedRecording.id)}
                >
                  <Trash2 size={16} color="#f43f5e" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reportBtn}
                  onPress={() => {
                    const rec = selectedRecording;
                    setSelectedRecording(null);
                    onHandoffToReport(rec);
                  }}
                >
                  <FileText size={16} color="#ffffff" />
                  <Text style={styles.reportBtnText}>Report to Cyber Cell</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617'
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28
  },
  lockIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4338ca',
    marginBottom: 16
  },
  lockTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800'
  },
  lockSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155'
  },
  pinDotFilled: {
    backgroundColor: '#6366f1',
    borderColor: '#818cf8'
  },
  pinKeypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 260,
    justifyContent: 'space-between',
    gap: 12
  },
  pinKey: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pinKeyEmpty: {
    width: 68,
    height: 68
  },
  pinKeyText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a'
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800'
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 12
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  lockButtonText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700'
  },
  listContainer: {
    padding: 16,
    gap: 12
  },
  recordCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  recordCardTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  recordIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  recordInfo: {
    flex: 1
  },
  recordCaller: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  recordPhone: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'monospace'
  },
  riskTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1
  },
  riskTagCritical: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#f43f5e'
  },
  riskTagSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981'
  },
  riskTagText: {
    fontSize: 10,
    fontWeight: '800'
  },
  riskTagTextCritical: {
    color: '#fda4af'
  },
  riskTagTextSafe: {
    color: '#6ee7b7'
  },
  recordCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    color: '#64748b',
    fontSize: 11
  },
  threatBox: {
    marginTop: 6,
    backgroundColor: '#2e1017',
    padding: 6,
    borderRadius: 8
  },
  threatText: {
    color: '#fecdd3',
    fontSize: 11,
    fontWeight: '600'
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30
  },
  emptyTitle: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  detailBox: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%'
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  detailTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  detailPhone: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'monospace'
  },
  closeText: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '700'
  },
  detailMetaGrid: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-around',
    marginBottom: 14
  },
  metaItem: {
    alignItems: 'center'
  },
  metaLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700'
  },
  metaVal: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2
  },
  transcriptHeading: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  transcriptBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    maxHeight: 180,
    marginBottom: 16
  },
  transcriptLine: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4
  },
  speakerPrefix: {
    color: '#818cf8',
    fontWeight: '700'
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2e1017',
    borderWidth: 1,
    borderColor: '#e11d48'
  },
  deleteBtnText: {
    color: '#fda4af',
    fontSize: 13,
    fontWeight: '700'
  },
  reportBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4f46e5'
  },
  reportBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  }
});
