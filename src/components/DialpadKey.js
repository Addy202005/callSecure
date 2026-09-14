import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

export function DialpadKey({ digit, letters, onPress }) {
  return (
    <TouchableOpacity
      style={styles.keyButton}
      activeOpacity={0.6}
      onPress={() => onPress(digit)}
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
    margin: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  digitText: {
    color: '#f8fafc',
    fontSize: 26,
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
