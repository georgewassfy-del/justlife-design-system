import React, { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type View as ViewType,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { elevationToStyle } from '../../theme/style-helpers';
import { hexToRgba } from '../../primitives/RadialGlow';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';

export interface BottomSheetProps extends Omit<ViewProps, 'children'> {
  /** Title shown at the top-left of the sheet. */
  title?: string;
  /**
   * Whether the sheet is shown. The sheet **animates in** when this becomes true and **animates out**
   * (then unmounts) when it becomes false — so a parent can keep it mounted and just flip `open`. Default
   * `true` (mount = open), which still animates in. Default `true`.
   */
  open?: boolean;
  /** Fired when the scrim **or** the close button is pressed. */
  onClose?: () => void;
  /** Circular close button in the top-right corner. Default `true`. */
  showClose?: boolean;
  /** Centred grabber handle at the top. Default `true`. */
  showGrabber?: boolean;
  /** Pinned footer (e.g. a primary action). Sits above the home-indicator inset. */
  footer?: ReactNode;
  /** Body content. Scrolls when it exceeds the capped height. */
  children?: ReactNode;
}

/**
 * Modal **bottom sheet**. A dimming scrim (tap to dismiss) over a surface that **slides up** from the
 * bottom with rounded **top** corners; the scrim **fades in** alongside it (and both reverse on close).
 * Anatomy: centred grabber · circular close in the top-right corner · left-aligned title · scrollable
 * body · optional pinned footer action.
 *
 * Rules (all tokenised): top corners `radius.2xl` (24); scrim `effects.overlay-default` @ `opacity.40`;
 * surface `elevation.sheet`; height capped at **90%** of the host; the footer clears the device home
 * indicator via `safeArea.bottom`. Renders as an absolute overlay filling its **positioned parent** (drop
 * it inside the screen container), so it stays inside a device frame rather than portalling out. Motion
 * uses the `motion` tokens (slide-up `decelerate`, slide-out `accelerate`); a `setTimeout` settles the end
 * state where `requestAnimationFrame` is throttled.
 */
export const BottomSheet = forwardRef<ViewType, BottomSheetProps>(function BottomSheet(
  { title, open = true, onClose, showClose = true, showGrabber = true, footer, children, style, ...rest },
  ref,
) {
  const t = useTheme();
  const [rendered, setRendered] = useState(open);
  const [sheetH, setSheetH] = useState(0);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  // Grows the sheet's bottom padding by the keyboard height. The sheet is white + bottom-anchored, so this
  // keeps it glued to the screen bottom (no gap/other colour below it) while its content rises above the
  // keyboard. (Animating padding is a layout prop → JS driver, so the whole sheet uses the JS driver.)
  const bottomPad = useRef(new Animated.Value(t.safeArea.bottom)).current;

  useEffect(() => {
    if (open) setRendered(true);
  }, [open]);

  useEffect(() => {
    if (!rendered) return;
    const to = open ? 1 : 0;
    const duration = open ? t.motion.duration.slow : t.motion.duration.medium;
    const easing = Easing.bezier(...((open ? t.motion.easing.decelerate : t.motion.easing.accelerate) as [number, number, number, number]));
    const anim = Animated.timing(progress, { toValue: to, duration, easing, useNativeDriver: false });
    anim.start(({ finished }) => {
      if (finished && !open) setRendered(false);
    });
    const settle = setTimeout(() => {
      progress.setValue(to);
      if (!open) setRendered(false);
    }, duration + 60);
    return () => {
      anim.stop();
      clearTimeout(settle);
    };
  }, [open, rendered, t, progress]);

  // Keep the sheet's content above the keyboard by growing its bottom padding to safeArea + keyboard
  // height, matching the keyboard's own show/hide animation. The sheet stays bottom-anchored so its white
  // fills all the way down — nothing else shows below it. (No-op on web — no on-screen keyboard event.)
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const animateTo = (to: number, duration?: number) =>
      Animated.timing(bottomPad, {
        toValue: to,
        duration: duration || t.motion.duration.medium,
        easing: Easing.bezier(...(t.motion.easing.standard as [number, number, number, number])),
        useNativeDriver: false,
      }).start();
    const onShow = (e: { endCoordinates?: { height: number }; duration?: number }) =>
      animateTo(t.safeArea.bottom + (e.endCoordinates?.height ?? 0), e.duration);
    const onHide = (e: { duration?: number }) => animateTo(t.safeArea.bottom, e.duration);
    const subShow = Keyboard.addListener(showEvt, onShow);
    const subHide = Keyboard.addListener(hideEvt, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [bottomPad, t]);

  if (!rendered) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [sheetH || t.size['96'], 0] });

  return (
    <View
      ref={ref}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: t.zIndex.modal }}
      {...rest}
    >
      {/* Scrim — dims the screen (fades with the sheet); tap to dismiss. */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: hexToRgba(t.effects.overlayDefault, t.opacity['40']) }]}
        />
      </Animated.View>
      <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <Animated.View
          onLayout={(e) => {
            // Measure once (for the slide distance); the animated bottom padding would otherwise re-fire
            // this every frame.
            const h = Math.round(e.nativeEvent.layout.height);
            if (h > 0 && sheetH === 0) setSheetH(h);
          }}
          style={[
            {
              maxHeight: '90%',
              backgroundColor: t.background.surfaceRaised,
              borderTopLeftRadius: t.radius['2xl'],
              borderTopRightRadius: t.radius['2xl'],
              // Grows with the keyboard so the white sheet stays anchored to the screen bottom.
              paddingBottom: bottomPad,
              // Fade with the slide — also masks the pre-measure frame, so no flash before it slides up.
              opacity: progress,
              transform: [{ translateY }],
              ...elevationToStyle(t.elevation.sheet),
            },
            style,
          ]}
        >
          {/* Circular close — pinned to the sheet's top-right corner. */}
          {showClose ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={{
                position: 'absolute',
                top: t.space.md,
                right: t.space.md,
                zIndex: 1,
                width: t.size['32'],
                height: t.size['32'],
                borderRadius: t.radius.pill,
                backgroundColor: t.background.secondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="x" size="sm" color={t.icon.secondary} />
            </Pressable>
          ) : null}

          {/* Grabber — drag/dismiss affordance. */}
          {showGrabber ? (
            <View style={{ alignItems: 'center', paddingVertical: t.space.sm }}>
              <View style={{ width: t.size['32'], height: t.size['4'], borderRadius: t.radius.pill, backgroundColor: t.border.default }} />
            </View>
          ) : null}

          {/* Title — breathing room above; right inset clears the corner close button. */}
          {title ? (
            <View
              style={{
                paddingLeft: t.space.md,
                paddingRight: showClose ? t.size['48'] : t.space.md,
                paddingTop: t.space.md,
                paddingBottom: t.space.md,
              }}
            >
              <Text variant="titleSmall">{title}</Text>
            </View>
          ) : null}

          {/* Body — scrolls when it exceeds the capped height. */}
          <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingHorizontal: t.space.md, paddingBottom: t.space.md, gap: t.space.sm }}>
            {children}
          </ScrollView>

          {/* Pinned footer action. */}
          {footer ? <View style={{ paddingHorizontal: t.space.md, paddingTop: t.space.sm }}>{footer}</View> : null}
        </Animated.View>
      </View>
    </View>
  );
});
