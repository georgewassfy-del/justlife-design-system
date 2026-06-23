import React from 'react';
import { View } from 'react-native';
import type { LinearGradientProps } from './types';

/**
 * Web vertical linear gradient — paints a CSS gradient layer behind the
 * content. Native uses `LinearGradient.tsx` (react-native-svg). No extra
 * dependency on web.
 */
export function LinearGradient({ colors, style, children }: LinearGradientProps) {
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(180deg, ${colors.join(', ')})`,
        }}
      />
      <View style={{ zIndex: 1 }}>{children}</View>
    </View>
  );
}
