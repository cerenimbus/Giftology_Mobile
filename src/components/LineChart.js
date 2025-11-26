/* RHCM 10/22/25
 * src/components/LineChart.js
 * Small, dependency-free line chart used for simple visualizations in the app.
 * Implemented with absolute-positioned Views to avoid adding an SVG dependency
 * which would require native linking and prebuild steps.
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { verticalScale, moderateScale } from '../utils/responsive';

// RHCM 10/22/25 - Lightweight line chart using native Views (no SVG/native deps).
// Props:
// - data: number[]
// - height: number
// - color: string
// - strokeWidth: number
// - pointRadius: number
export default function LineChart({ data = [], height = verticalScale(60), color = '#e84b4b', strokeWidth = moderateScale(2), pointRadius = moderateScale(3) }) {
  const [layout, setLayout] = useState({ width: 0, height });

  if (!data || data.length === 0) return <View style={{ height }} />;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const computePoints = () => {
    const w = layout.width || 0;
    const h = layout.height || height;
    const count = data.length;
    return data.map((v, i) => {
      const x = count === 1 ? w / 2 : (i / (count - 1)) * w;
      const y = (1 - (v - min) / range) * h;
      return { x, y };
    });
  };

  const points = computePoints();

  return (
    <View
      style={[styles.root, { height }]}
      onLayout={e => setLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {/* segments */}
      {layout.width > 0 && points.map((p, i) => {
        if (i === points.length - 1) return null;
        const p2 = points[i + 1];
        const dx = p2.x - p.x;
        const dy = p2.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return (
          <View
            key={'seg-' + i}
            style={[
              styles.segment,
              {
                width: len,
                height: strokeWidth,
                left: p.x,
                top: p.y - strokeWidth / 2,
                backgroundColor: color,
                transform: [{ rotate: `${angle}rad` }]
              }
            ]}
          />
        );
      })}

      {/* dots */}
      {layout.width > 0 && points.map((p, i) => (
        <View
          key={'dot-' + i}
          style={[
            styles.dot,
            {
              left: p.x - pointRadius,
              top: p.y - pointRadius,
              width: pointRadius * 2,
              height: pointRadius * 2,
              borderRadius: pointRadius,
              backgroundColor: color
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', position: 'relative' },
  segment: { position: 'absolute', transformOrigin: 'left top' },
  dot: { position: 'absolute' }
});
