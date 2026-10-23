import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Platform
} from 'react-native';
import {
  Phone,
  PhoneOff,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  MapPin,
  Volume2
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export function IncomingCallModal({
  visible,
  scenario,
  onAnswer,
  onDecline
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!visible) return;

    // Trigger phone vibration / haptics pattern for incoming ring
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        const interval = setInterval(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 1500);
        return () => clearInterval(interval);
      }
    } catch {}

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true
        })
      ])
    );

    const ripple = Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1.4,
          duration: 1200,
          useNativeDriver: true
        }),
        Animated.timing(rippleAnim, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true
        })
      ])
    );

    pulse.start();
    ripple.start();

    return () => {
      pulse.stop();
      ripple.stop();
    };
  }, [visible]);

  if (!visible || !scenario) return null;

  const isSafe = scenario.riskExpectation === 'LOW';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={styles.overlay}>
        {/* Top Simulation Banner */}
        <View style={styles.topBadgeContainer}>
          <View style={[styles.simBadge, isSafe ? styles.simBadgeSafe : styles.simBadgeDanger]}>
            <Radio size={14} color={isSafe ? '#34d399' : '#f43f5e'} />
            <Text style={[styles.simBadgeText, isSafe ? styles.simBadgeTextSafe : styles.simBadgeTextDanger]}>
              INCOMING CALL SIMULATOR • TEST MODE
            </Text>
          </View>
        </View>

        {/* Central Caller Information */}
        <View style={styles.callerContainer}>
          {/* Animated Avatar / Ringing Pulse */}
          <View style={styles.avatarWrapper}>
            <Animated.View
              style={[
                styles.rippleRing,
                {
                  transform: [{ scale: rippleAnim }],
                  borderColor: isSafe ? 'rgba(52, 211, 153, 0.3)' : 'rgba(244, 63, 94, 0.4)'
                }
              ]}
            />
            <Animated.View
              style={[
                styles.avatarPulse,
                {
                  transform: [{ scale: pulseAnim }],
                  borderColor: isSafe ? '#34d399' : '#f43f5e'
                }
              ]}
            >
              {scenario.avatar ? (
                <Image source={{ uri: scenario.avatar }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarPlaceholder, isSafe ? styles.bgSafe : styles.bgDanger]}>
                  {isSafe ? (
                    <ShieldCheck size={48} color="#34d399" />
                  ) : (
                    <ShieldAlert size={48} color="#f43f5e" />
                  )}
                </View>
              )}
            </Animated.View>
          </View>

          {/* Caller Name & Details */}
          <Text style={styles.callerName} numberOfLines={2}>
            {scenario.callerName}
          </Text>
          <Text style={styles.callerPhone}>{scenario.callerPhone}</Text>

          {scenario.location && (
            <View style={styles.locationRow}>
              <MapPin size={12} color="#94a3b8" />
              <Text style={styles.locationText}>{scenario.location}</Text>
            </View>
          )}

          {/* Real-time Threat Intelligence Pre-Answer Warning */}
          <View style={[styles.threatAlertBox, isSafe ? styles.threatAlertSafe : styles.threatAlertDanger]}>
            <View style={styles.threatAlertHeader}>
              {isSafe ? (
                <ShieldCheck size={16} color="#34d399" />
              ) : (
                <AlertTriangle size={16} color="#f43f5e" />
              )}
              <Text style={[styles.threatAlertTitle, isSafe ? styles.colorSafe : styles.colorDanger]}>
                {isSafe ? 'VERIFIED LEGITIMATE CALLER' : 'POTENTIAL EXTORTION CALL DETECTED'}
              </Text>
            </View>
            <Text style={styles.threatAlertBody}>
              {isSafe
                ? 'Known personal medical contact. Low threat probability.'
                : `SafeShield Threat Radar: Suspected ${scenario.title}. Voice recording consent requested immediately upon answer.`}
            </Text>
          </View>

          {/* Ringing Sound Indicator */}
          <View style={styles.ringingIndicator}>
            <Volume2 size={16} color="#818cf8" />
            <Text style={styles.ringingText}>Phone Ringing...</Text>
          </View>
        </View>

        {/* Bottom Call Controls (Decline / Answer) */}
        <View style={styles.bottomControls}>
          {/* Decline Button */}
          <View style={styles.controlItem}>
            <TouchableOpacity
              style={styles.declineButton}
              activeOpacity={0.8}
              onPress={onDecline}
            >
              <PhoneOff size={28} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Decline</Text>
          </View>

          {/* Answer Button */}
          <View style={styles.controlItem}>
            <TouchableOpacity
              style={styles.answerButton}
              activeOpacity={0.8}
              onPress={() => onAnswer(scenario)}
            >
              <Phone size={28} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Answer & Protect</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.96)',
    justifyContent: 'space-between',
    paddingVertical: 48,
    paddingHorizontal: 24
  },
  topBadgeContainer: {
    alignItems: 'center',
    marginTop: 12
  },
  simBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  simBadgeDanger: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.4)'
  },
  simBadgeSafe: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.4)'
  },
  simBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  simBadgeTextDanger: {
    color: '#fb7185'
  },
  simBadgeTextSafe: {
    color: '#34d399'
  },
  callerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  rippleRing: {
    position: 'absolute',
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 2
  },
  avatarPulse: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImg: {
    width: '100%',
    height: '100%'
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bgDanger: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)'
  },
  bgSafe: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)'
  },
  callerName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6
  },
  callerPhone: {
    color: '#818cf8',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 12
  },
  threatAlertBox: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginTop: 8
  },
  threatAlertDanger: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.3)'
  },
  threatAlertSafe: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.3)'
  },
  threatAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  threatAlertTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  threatAlertBody: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 16
  },
  colorDanger: {
    color: '#f43f5e'
  },
  colorSafe: {
    color: '#34d399'
  },
  ringingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18
  },
  ringingText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '600'
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16
  },
  controlItem: {
    alignItems: 'center',
    gap: 10
  },
  declineButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8
  },
  answerButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8
  },
  controlLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  }
});
