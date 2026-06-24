import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState';
import { hapticTap } from '../../lib/haptics';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon/Icon';
import type { TextProps } from '../../primitives/Text';

export type StepperSize = 'sm' | 'md' | 'lg';

export interface QuantityStepperProps {
  value?: number;
  defaultValue?: number;
  /** Minimum value the stepper can reach (minus disables here). Default 1. */
  min?: number;
  /** Maximum value (plus disables here). Default no maximum. */
  max?: number;
  onChange?: (value: number) => void;
  size?: StepperSize;
  disabled?: boolean;
}

// Intrinsic sizes from the Figma Quantity Stepper set.
const SIZES: Record<StepperSize, { btn: number; icon: number; qty: TextProps['variant'] }> = {
  sm: { btn: 22, icon: 14, qty: 'titleSmall' },
  md: { btn: 26, icon: 14, qty: 'titleMedium' },
  lg: { btn: 32, icon: 16, qty: 'titleLarge' },
};

export function QuantityStepper({
  value,
  defaultValue = 0,
  min = 1,
  max = Number.POSITIVE_INFINITY,
  onChange,
  size = 'md',
  disabled = false,
}: QuantityStepperProps) {
  const t = useTheme();
  const [count, setCount] = useControllableState(value, defaultValue);
  const s = SIZES[size];

  const set = (next: number) => {
    // Every stepper interaction (add · increase · decrease · remove) routes through here, so the haptic
    // tick lives here — a tactile click on each press (native only; no-op on web).
    hapticTap();
    setCount(next);
    onChange?.(next);
  };

  const squareButton = (
    key: string,
    icon: string,
    active: boolean,
    onPress: () => void,
    label: string,
  ) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !active }}
      disabled={!active}
      onPress={onPress}
      style={{
        width: s.btn,
        height: s.btn,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: t.radius.md,
        backgroundColor: active ? t.btn.primary.bg : t.btn.disabled.bg,
      }}
    >
      <Icon name={icon} size={s.icon} color={active ? t.btn.primary.text : t.btn.disabled.text} />
    </Pressable>
  );

  // Collapsed "Add" state — a single plus button (Figma State=Add).
  if (count <= 0) {
    return squareButton('add', 'plus', !disabled, () => !disabled && set(Math.max(min, 1)), 'Add');
  }

  // At the floor, the minus becomes a remove (trash) action — pressing it drops
  // the value to 0 (which collapses back to the Add control). Above the floor it
  // decrements normally.
  const atMin = count <= min;
  const canIncrease = !disabled && count < max;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        // `center` (not flex-start) so the stepper hugs its content without
        // stretching, yet stays vertically centered in a row (e.g. next to an
        // Add button) instead of pinning to the top.
        alignSelf: 'center',
        borderRadius: t.radius.default,
        backgroundColor: t.button.bg.default,
      }}
    >
      {squareButton(
        'left',
        atMin ? 'trash-2' : 'minus',
        !disabled,
        () => !disabled && set(atMin ? 0 : count - 1),
        atMin ? 'Remove' : 'Decrease quantity',
      )}
      <Text
        variant={s.qty}
        style={{
          color: disabled ? t.text.disabled : t.text.primary,
          paddingHorizontal: t.space.sm,
          minWidth: s.btn,
          textAlign: 'center',
        }}
      >
        {count}
      </Text>
      {squareButton('plus', 'plus', canIncrease, () => canIncrease && set(count + 1), 'Increase quantity')}
    </View>
  );
}
