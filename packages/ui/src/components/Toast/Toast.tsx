import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, type View as ViewType } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { elevationToStyle } from '../../theme/style-helpers';
import { hexToRgba } from '../../primitives/RadialGlow';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';

export type ToastTone = 'neutral' | 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  /** Button label, e.g. "Undo", "View". */
  label: string;
  onPress: () => void;
}

export interface ToastProps {
  /** The message. Wraps to a second line, then truncates. */
  message: string;
  /** Tone — sets the leading icon + its colour. Default `neutral` (no icon). */
  tone?: ToastTone;
  /** Override the leading icon (Lucide name). `null` forces no icon; omit to use the tone's default. */
  icon?: string | null;
  /** A single trailing action (e.g. "Undo"). */
  action?: ToastAction;
  /** Show the trailing ✕. Defaults to `true` when there's **no** action, `false` when there is. */
  dismissible?: boolean;
  /** Fired by the ✕. */
  onDismiss?: () => void;
  /** Animate **in** (`true`) or **out** (`false`); mirrors `BottomSheet`. Default `true`. */
  open?: boolean;
  /** Anchor / slide direction — `bottom` slides up, `top` slides down. Default `bottom`. */
  position?: 'top' | 'bottom';
  /** Called once the exit animation has finished (after `open` flips to `false`). */
  onExited?: () => void;
}

/** Default Lucide glyph per tone. `neutral` shows none unless an `icon` is passed. */
const TONE_ICON: Record<ToastTone, string | null> = {
  neutral: null,
  success: 'circle-check',
  error: 'circle-alert',
  info: 'info',
  warning: 'triangle-alert',
};

/**
 * **Toast / Snackbar** — a transient, self-dismissing message bar. A **dark surface** (`background.inverse`)
 * keeps it distinct from the light cards/sheets and gives every tone a consistent look; the tone is carried
 * by a coloured **leading icon** (success/error/info/warning) rather than tinting the whole bar. Holds an
 * optional **action** (e.g. "Undo") and/or a **✕**.
 *
 * Presentational only: it animates itself (slide + fade, `open` lifecycle) but does **not** manage timing,
 * queueing or placement — drive it imperatively via `ToastProvider` + `useToast()`, which positions it above
 * the safe-area inset and auto-dismisses it. Fully tokenised (surface, radius `xl`, `elevation.overlay`,
 * `motion`); a `setTimeout` settles the end state where `requestAnimationFrame` is throttled (headless preview).
 */
export const Toast = forwardRef<ViewType, ToastProps>(function Toast(
  { message, tone = 'neutral', icon, action, dismissible, onDismiss, open = true, position = 'bottom', onExited },
  ref,
) {
  const t = useTheme();
  const [rendered, setRendered] = useState(open);
  const [measured, setMeasured] = useState(0);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const firedExit = useRef(false);
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  useEffect(() => {
    if (open) {
      firedExit.current = false;
      setRendered(true);
    }
  }, [open]);

  useEffect(() => {
    if (!rendered) return;
    const to = open ? 1 : 0;
    const duration = open ? t.motion.duration.medium : t.motion.duration.fast;
    const easing = Easing.bezier(
      ...((open ? t.motion.easing.decelerate : t.motion.easing.accelerate) as [number, number, number, number]),
    );
    // Settling the exit (set rendered false + notify) must run at most once across the anim callback and the
    // fallback timeout, or onExited double-fires and the queue advances twice.
    const settleExit = () => {
      if (open || firedExit.current) return;
      firedExit.current = true;
      setRendered(false);
      onExitedRef.current?.();
    };
    const anim = Animated.timing(progress, { toValue: to, duration, easing, useNativeDriver: false });
    anim.start(({ finished }) => {
      if (finished) settleExit();
    });
    const settle = setTimeout(() => {
      progress.setValue(to);
      settleExit();
    }, duration + 60);
    return () => {
      anim.stop();
      clearTimeout(settle);
    };
  }, [open, rendered, t, progress]);

  if (!rendered) return null;

  const iconName = icon === null ? null : (icon ?? TONE_ICON[tone]);
  const toneColor =
    tone === 'success'
      ? t.icon.success
      : tone === 'error'
        ? t.icon.error
        : tone === 'info'
          ? t.icon.info
          : tone === 'warning'
            ? t.icon.warning
            : t.icon.inverse;
  const showClose = dismissible ?? !action;
  const distance = (measured || t.size['80']) + t.space.md;
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [position === 'top' ? -distance : distance, 0],
  });

  return (
    <Animated.View
      ref={ref}
      accessibilityLiveRegion="polite"
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      onLayout={(e) => {
        const h = Math.round(e.nativeEvent.layout.height);
        if (h > 0 && measured === 0) setMeasured(h);
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.sm,
        paddingVertical: t.space.sm,
        paddingLeft: t.space.md,
        paddingRight: t.space.sm,
        minHeight: t.size['48'],
        backgroundColor: t.background.inverse,
        borderRadius: t.radius.xl,
        opacity: progress,
        transform: [{ translateY }],
        ...elevationToStyle(t.elevation.overlay),
      }}
    >
      {iconName ? <Icon name={iconName} size="sm" color={toneColor} /> : null}

      <Text variant="bodyMedium" color="inverse" numberOfLines={2} style={{ flex: 1 }}>
        {message}
      </Text>

      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          hitSlop={t.space.sm}
          onPress={action.onPress}
          style={({ pressed }) => ({ paddingHorizontal: t.space.xs, opacity: pressed ? 0.6 : 1 })}
        >
          <Text variant="labelLarge" style={{ color: t.text.brand }}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}

      {showClose ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          hitSlop={t.space.sm}
          onPress={onDismiss}
          style={({ pressed }) => ({
            width: t.size['32'],
            height: t.size['32'],
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon name="x" size="sm" color={hexToRgba(t.icon.inverse, t.opacity['75'])} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
});
