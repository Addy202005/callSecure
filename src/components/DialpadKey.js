import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function DialpadKey({ digit, letters, onPress, onLongPress }) {
  const handlePress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // safe fallback
    }
    onPress(digit);
  };

  const handleLongPress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // safe fallback
    }
    if (onLongPress) {
      onLongPress(digit);
    }
  };

  return (
    <TouchableOpacity
      style={styles.keyButton}
      activeOpacity={0.4}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={450}
    >
      <Text style={styles.digitText}>{digit}</Text>
      {letters ? <Text style={styles.lettersText}>{letters}</Text> : <View style={styles.emptySpacer} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  },
  digitText: {
    color: '#f8fafc',
    fontSize: 27,
    fontWeight: '600'
  },
  lettersText: {
    color: '#94a3b8',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: -2
  },
  emptySpacer: {
    height: 10
  }
});

