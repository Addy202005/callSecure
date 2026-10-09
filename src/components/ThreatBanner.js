import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldAlert, AlertTriangle, ShieldCheck, Cpu, Lock } from 'lucide-react-native';

export function ThreatBanner({
  riskLevel,
  riskScore,
  threatIndicators = [],
  counterAdvisory,
  source = 'Local Guard'
}) {
  const score = typeof riskScore === 'number' ? Math.min(99, Math.max(0, riskScore)) : 0;

  if (riskLevel === 'PRIVACY_MODE' || riskLevel === 'CONSENT_DECLINED') {
    return (
      <View style={[styles.container, styles.privacyContainer]}>
        <View style={styles.privacyIconBadge}>
          <Lock size={18} color="#94a3b8" />
        </View>
        <View style={styles.content}>
          <View style={styles.safeTopRow}>
            <Text style={styles.privacyTitle}>AI Threat Shield: Inactive (Privacy Mode)</Text>
            <View style={styles.privacyBadge}>
              <Text style={styles.privacyBadgeText}>NO CONSENT</Text>
            </View>
          </View>
          <Text style={styles.privacySubtitle}>
            Voice recording and live speech transcription disabled by user preference.
          </Text>
        </View>
      </View>
    );
  }

  if (!riskLevel || riskLevel === 'SAFE') {
    return (
      <View style={[styles.container, styles.safeContainer]}>
        <ShieldCheck size={20} color="#34d399" />
        <View style={styles.content}>
          <View style={styles.safeTopRow}>
            <Text style={styles.safeTitle}>SafeShield AI: Safe & Verified Pattern</Text>
            <View style={styles.engineBadge}>
              <Cpu size={10} color="#34d399" />
              <Text style={styles.engineBadgeText}>AI Active</Text>
            </View>
          </View>
          <Text style={styles.safeSubtitle}>Zero coercive threat cues detected in audio stream</Text>
        </View>
      </View>
    );
  }

  const isCritical = riskLevel === 'CRITICAL' || score >= 70;
  const isHigh = riskLevel === 'HIGH' || (score >= 40 && score < 70);

  return (
    <View style={[styles.container, isCritical ? styles.criticalContainer : styles.highContainer]}>
      {/* Top Threat Row */}
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          {isCritical ? (
            <ShieldAlert size={22} color="#f43f5e" />
          ) : (
            <AlertTriangle size={22} color="#f59e0b" />
          )}
        </View>

        <View style={styles.titleColumn}>
          <View style={styles.alertTitleRow}>
            <Text style={[styles.alertTitle, isCritical ? styles.criticalText : styles.highText]}>
              {isCritical ? 'CRITICAL FRAUD THREAT' : 'SUSPICIOUS CALL DETECTED'}
            </Text>
            <View style={[styles.sourcePill, isCritical ? styles.criticalSourcePill : styles.highSourcePill]}>
              <Cpu size={9} color={isCritical ? '#fda4af' : '#fde68a'} />
              <Text style={[styles.sourcePillText, isCritical ? styles.criticalText : styles.highText]}>
                {source}
              </Text>
            </View>
          </View>

          <Text style={styles.threatLabel} numberOfLines={1}>
            {threatIndicators.length > 0
              ? threatIndicators.slice(0, 2).join(' • ')
              : 'Manipulative speech patterns detected'}
          </Text>
        </View>

        {/* Score Badge */}
        <View style={[styles.scoreBadge, isCritical ? styles.criticalScoreBadge : styles.highScoreBadge]}>
          <Text style={styles.scoreText}>{score}%</Text>
          <Text style={styles.scoreLabel}>RISK</Text>
        </View>
      </View>

      {/* Visual Risk Gauge Meter Bar */}
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeTrack}>
          <View
            style={[
              styles.gaugeFill,
              { width: `${score}%` },
              isCritical ? styles.gaugeFillCritical : styles.gaugeFillHigh
            ]}
          />
        </View>
      </View>

      {/* Advisory Box */}
      {counterAdvisory ? (
        <View style={styles.advisoryBox}>
          <Text style={styles.advisoryText}>
            🛡️ {counterAdvisory}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1
  },
  safeContainer: {
    backgroundColor: 'rgba(6, 78, 59, 0.25)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  privacyContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: '#475569',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  privacyIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  privacyTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700'
  },
  privacySubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  privacyBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  privacyBadgeText: {
    color: '#94a3b8',
    fontSize: 8.5,
    fontWeight: '700'
  },
  content: {
    flex: 1
  },
  safeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  safeTitle: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '700'
  },
  safeSubtitle: {
    color: '#a7f3d0',
    fontSize: 11,
    marginTop: 2
  },
  engineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3
  },
  engineBadgeText: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: '700'
  },
  criticalContainer: {
    backgroundColor: '#2b070f',
    borderColor: '#e11d48'
  },
  highContainer: {
    backgroundColor: '#261403',
    borderColor: '#d97706'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconBadge: {
    marginRight: 10
  },
  titleColumn: {
    flex: 1
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 3,
    borderWidth: 1
  },
  criticalSourcePill: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderColor: 'rgba(244, 63, 94, 0.4)'
  },
  highSourcePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.4)'
  },
  sourcePillText: {
    fontSize: 8,
    fontWeight: '700'
  },
  criticalText: {
    color: '#fda4af'
  },
  highText: {
    color: '#fde68a'
  },
  threatLabel: {
    color: '#e2e8f0',
    fontSize: 11,
    marginTop: 2
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1
  },
  criticalScoreBadge: {
    backgroundColor: '#881337',
    borderColor: '#f43f5e'
  },
  highScoreBadge: {
    backgroundColor: '#78350f',
    borderColor: '#f59e0b'
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace'
  },
  scoreLabel: {
    color: '#e2e8f0',
    fontSize: 8,
    fontWeight: '700'
  },
  gaugeContainer: {
    marginTop: 8,
    marginBottom: 4
  },
  gaugeTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 2
  },
  gaugeFillCritical: {
    backgroundColor: '#f43f5e'
  },
  gaugeFillHigh: {
    backgroundColor: '#f59e0b'
  },
  advisoryBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)'
  },
  advisoryText: {
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500'
  }
});
