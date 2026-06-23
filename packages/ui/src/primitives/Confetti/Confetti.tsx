import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, Platform, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface ConfettiProps {
  /** Number of confetti pieces. Default 28. */
  count?: number;
  /** `'bottom'` = pieces rise up the full screen (celebration); `'center'` = a small contained burst. Default `'bottom'`. */
  origin?: 'bottom' | 'center';
  /** Flight duration (ms). Defaults to a relaxed fall (`motion.duration.slow × 7`). */
  duration?: number;
  /** Bump this to (re)fire the burst — e.g. the applied voucher code, or a mount counter. */
  runKey?: string | number;
  /** Fired once the burst finishes. */
  onDone?: () => void;
  /** Override the piece colours (pass DS tokens). Defaults to a bright brand mix. */
  colors?: string[];
  style?: ViewStyle;
}

interface Piece {
  key: number;
  leftPct: number;
  w: number;
  h: number;
  color: string;
  delay: number;
  driftFrac: number;
  spins: number;
  rounded: boolean;
}

/**
 * Lightweight, token-driven **confetti** burst. Renders an absolute-fill overlay of small coloured pieces
 * that fly with `Animated` (transforms + opacity → native-driver on device, JS on web) — no native module,
 * so it works identically in Storybook (RNW) and Expo. Distances come from `Dimensions` (no layout
 * measurement needed, so it fires immediately). `origin="bottom"` showers pieces up the screen;
 * `origin="center"` is a small contained pop (e.g. inside a card). Decorative + `pointerEvents="none"`.
 */
export function Confetti({ count = 28, origin = 'bottom', duration, runKey = 0, onDone, colors, style }: ConfettiProps) {
  const t = useTheme();
  const dur = duration ?? t.motion.duration.slow * 7;
  const palette = colors ?? [
    t.background.brandDefault,
    t.btn.secondary.bg,
    t.background.success,
    t.text.promoAccent,
    t.text.error,
    t.background.brandSubtle,
  ];
  const { width: winW, height: winH } = Dimensions.get('window');
  const rise = origin === 'center' ? winH * 0.22 : winH;
  const driftBasis = origin === 'center' ? winW * 0.22 : winW * 0.32;
  const anim = useRef(new Animated.Value(0)).current;

  // Pseudo-random pieces, regenerated whenever the burst (re)fires.
  const pieces = useMemo<Piece[]>(() => {
    const spread = origin === 'center' ? 24 : 50; // half-width % the pieces fan across
    return Array.from({ length: count }).map((_, i) => ({
      key: i,
      leftPct: 50 + (Math.random() * 2 - 1) * spread,
      w: t.size['8'] - 2 + Math.random() * t.size['8'],
      h: t.size['8'] + Math.random() * t.size['8'],
      color: palette[i % palette.length] as string,
      delay: Math.random() * 0.18,
      driftFrac: Math.random() * 2 - 1,
      spins: 1 + Math.random() * 3,
      rounded: Math.random() > 0.5,
    }));
  }, [count, origin, runKey]);

  useEffect(() => {
    anim.setValue(0);
    const animation = Animated.timing(anim, {
      toValue: 1,
      duration: dur,
      easing: Easing.out(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start(({ finished }) => finished && onDone?.());
    return () => animation.stop();
  }, [runKey, dur]);

  return (
    <View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }, style]}>
      {pieces.map((p) => {
        const translateY = anim.interpolate({ inputRange: [0, p.delay, 1], outputRange: [0, 0, -rise], extrapolate: 'clamp' });
        const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.driftFrac * driftBasis] });
        const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${Math.round(p.spins * 360)}deg`] });
        const opacity = anim.interpolate({ inputRange: [0, p.delay, 0.82, 1], outputRange: [0, 1, 1, 0], extrapolate: 'clamp' });
        return (
          <Animated.View
            key={`${runKey}-${p.key}`}
            style={{
              position: 'absolute',
              left: `${p.leftPct}%`,
              bottom: origin === 'bottom' ? 0 : undefined,
              top: origin === 'center' ? '50%' : undefined,
              width: p.w,
              height: p.h,
              borderRadius: p.rounded ? t.radius.pill : t.radius.sm,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
