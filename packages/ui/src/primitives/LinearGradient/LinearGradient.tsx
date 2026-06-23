import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from 'react-native-svg';
import type { LinearGradientProps } from './types';

/**
 * Native vertical linear gradient (iOS/Android) using react-native-svg, which
 * is already a dependency. Web uses `LinearGradient.web.tsx`.
 */
export function LinearGradient({ colors, style, children }: LinearGradientProps) {
  const last = Math.max(1, colors.length - 1);
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <SvgGradient id="ds-linear-gradient" x1="0" y1="0" x2="0" y2="1">
            {colors.map((color, i) => (
              <Stop key={i} offset={i / last} stopColor={color} />
            ))}
          </SvgGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#ds-linear-gradient)" />
      </Svg>
      {children}
    </View>
  );
}
