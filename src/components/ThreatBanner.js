import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react-native';

export function ThreatBanner({ riskLevel, riskScore, threatIndicators, counterAdvisory }) {
  if (!riskLevel || riskLevel === 'SAFE') {
    return (
      <View style={[styles.container, styles.safeContainer]}>
        <ShieldCheck size={18} color="#34d399" />
        <View style={styles.content}>
          <Text style={styles.safeTitle}>SafeShield AI: No Coercive Threat Detected</Text>
          <Text style={styles.safeSubtitle}>Verified caller pattern • Standard safety active</Text>
        </View>
      </View>
    );
  }

  const isCritical = riskLevel === 'CRITICAL' || riskScore >= 70;

  return (
    <View style={[styles.container, isCritical ? styles.criticalContainer : styles.highContainer]}>
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          {isCritical ? (
            <ShieldAlert size={20} color="#f43f5e" />
          ) : (
            <AlertTriangle size={20} color="#f59e0b" />
          )}
        </View>

        <View style={styles.titleColumn}>
          <Text style={[styles.alertTitle, isCritical ? styles.criticalText : styles.highText]}>
            {isCritical ? 'CRITICAL FRAUD THREAT' : 'SUSPICIOUS CALL DETECTED'}
          </Text>
          <Text style={styles.threatLabel}>
            {threatIndicators && threatIndicators.length > 0
              ? threatIndicators.join(' • ')
              : 'Coercive tactics or fraudulent extortion detected'}
          </Text>
        </View>

        <View style={[styles.scoreBadge, isCritical ? styles.criticalScoreBadge : styles.highScoreBadge]}>
          <Text style={styles.scoreText}>{riskScore}%</Text>
          <Text style={styles.scoreLabel}>RISK</Text>
        </View>
      </View>

      {counterAdvisory ? (
        <View style={styles.advisoryBox}>
          <Text style={styles.advisoryText}>
            🛡️ Advisory: {counterAdvisory}
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
    gap: 10
  },
  safeTitle: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '700'
  },
  safeSubtitle: {
    color: '#a7f3d0',
    fontSize: 11
  },
  criticalContainer: {
    backgroundColor: '#380a14',
    borderColor: '#e11d48'
  },
  highContainer: {
    backgroundColor: '#2e1c07',
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
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5
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
  advisoryBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)'
  },
  advisoryText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500'
  }
});
