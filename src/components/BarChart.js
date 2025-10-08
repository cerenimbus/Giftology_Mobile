import React from 'react';
import { View, StyleSheet } from 'react-native';

// A tiny, dependency-free bar-chart that uses plain Views.
// Props:
// - data: number[] (values)
// - height: number (px)
// - color: string
// - gap: number (px gap between bars)
export default function BarChart({ data = [], height = 44, color = '#e84b4b', gap = 6 }) {
  const max = Math.max(...data, 1);
  return (
    <View style={[styles.root, { height }]}> 
      {data.map((v, i) => {
        const barHeight = (v / max) * (height - 6); // leave small top padding
        return (
          <View key={i} style={[styles.barWrapper, { marginLeft: i === 0 ? 0 : gap }]}> 
            <View style={[styles.bar, { height: barHeight, backgroundColor: color }]} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 10,
    borderRadius: 6,
  },
});
