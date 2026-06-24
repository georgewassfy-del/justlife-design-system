import React, { forwardRef } from 'react';
import { Pressable, type View as ViewType, type PressableProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState';
import { Icon } from '../Icon/Icon';
import type { ControlSize } from '../Toggle/Toggle';

export interface CheckboxProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Renders the mixed/indeterminate state (a dash). */
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  size?: ControlSize;
  disabled?: boolean;
  accessibilityLabel?: string;
}

// Intrinsic box + glyph sizes from the Figma "Controls" set.
const SIZES = {
  sm: { box: 16, glyph: 10 },
  md: { box: 24, glyph: 16 },
} as const;

/** Checkbox. Mirrors the Figma Controls → Checkbox; colours are tokenised. */
export const Checkbox = forwardRef<ViewType, CheckboxProps>(function Checkbox(
  {
    checked,
    defaultChecked = false,
    indeterminate = false,
    onChange,
    size = 'md',
    disabled = false,
    accessibilityLabel,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const [isChecked, setChecked] = useControllableState(checked, defaultChecked);
  const s = SIZES[size];

  const active = isChecked || indeterminate;
  const filled = active && !disabled; // brand fill only when active and enabled
  const showBorder = !filled;
  const glyphColor = disabled ? t.icon.disabled : t.icon.onSolid;

  const handlePress = () => {
    if (disabled) return;
    const next = !isChecked;
    setChecked(next);
    onChange?.(next);
  };

  return (
    <Pressable
      ref={ref}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : isChecked, disabled }}
      {...({ 'aria-checked': indeterminate ? 'mixed' : isChecked } as Record<string, unknown>)}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={handlePress}
      style={{
        width: s.box,
        height: s.box,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: t.radius.sm,
        backgroundColor: filled ? t.background.brandDefault : 'transparent',
        borderWidth: showBorder ? t.borderWidth.thin : 0,
        borderColor: disabled ? t.border.disabled : t.border.default,
      }}
      {...rest}
    >
      {indeterminate ? (
        <Icon name="minus" size={s.glyph} color={glyphColor} strokeWidth={3} />
      ) : isChecked ? (
        <Icon name="check" size={s.glyph} color={glyphColor} strokeWidth={3} />
      ) : null}
    </Pressable>
  );
});
