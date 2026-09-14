import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export function AudioWaveform({ isActive = true, color = '#6366f1' }) {
  const bars = [
    useRef(new Animated.Value(10)).current,
    useRef(new Animated.Value(24)).current,
    useRef(new Animated.Value(16)).current,
    useRef(new Animated.Value(32)).current,
    useRef(new Animated.Value(18)).current,
    useRef(new Animated.Value(28)).current,
    useRef(new Animated.Value(12)).current,
    useRef(new Animated.Value(22)).current
  ];

  useEffect(() => {
    if (!isActive) return;

    const animations = bars.map((bar, index) => {
      const minHeight = 6;
      const maxHeight = 16 + (index % 3) * 10;
      const duration = 250 + (index % 4) * 80;

      return Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: maxHeight,
            duration: duration,
            useNativeDriver: false
          }),
          Animated.timing(bar, {
            toValue: minHeight,
            duration: duration,
            useNativeDriver: false
          })
        ])
      );
    });

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [isActive]);

  return (
    <View style={styles.container}>
      {bars.map((heightVal, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.bar,
            {
              height: heightVal,
              backgroundColor: color
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    gap: 4
  },
  bar: {
    width: 3.5,
    borderRadius: 3
  }
});
