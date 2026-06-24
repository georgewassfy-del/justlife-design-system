import React, { forwardRef } from 'react';
import { View, type View as ViewType, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Icon } from '../Icon';
import type { Tokens } from '@justlife/tokens';

export type BadgeTone = 'rating' | 'success' | 'neutral' | 'brand' | 'danger' | 'warning';

export interface BadgeProps extends Omit<ViewProps, 'children'> {
  /** Badge label. */
  children: React.ReactNode;
  tone?: BadgeTone;
  /** Optional leading Lucide icon (e.g. "star"). */
  icon?: string;
  /** Fill the icon (e.g. a solid rating star). */
  iconFilled?: boolean;
}

/** Background + foreground pairs from the `badge` tokens. */
function toneColors(t: Tokens, tone: BadgeTone): { bg: string; fg: string } {
  switch (tone) {
    case 'rating':
      return { bg: t.badge.bg.primary, fg: t.badge.text.info };
    case 'success':
      return { bg: t.badge.bg.success, fg: t.badge.text.info };
    case 'brand':
      return { bg: t.badge.bg.brand, fg: t.badge.text.inverse };
    case 'danger':
      return { bg: t.badge.bg.danger, fg: t.badge.text.inverse };
    case 'warning':
      return { bg: t.badge.bg.warning, fg: t.badge.text.inverse };
    case 'neutral':
    default:
      return { bg: t.badge.bg.neutral, fg: t.badge.text.primary };
  }
}

/**
 * Compact pill badge (Figma "Rating Tag" / badge). Tone selects the
 * background/foreground from the `badge` tokens; supports an optional leading
 * icon (e.g. a filled rating star). Sized for inline use next to titles.
 */
export const Badge = forwardRef<ViewType, BadgeProps>(function Badge(
  { children, tone = 'neutral', icon, iconFilled = false, style, ...rest },
  ref,
) {
  const t = useTheme();
  const { bg, fg } = toneColors(t, tone);
  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: t.size['2'],
          paddingHorizontal: t.space.sm,
          paddingVertical: t.size['2'],
          borderRadius: t.radius.sm,
          backgroundColor: bg,
        },
        style,
      ]}
      {...rest}
    >
      {icon ? <Icon name={icon} size="xs" color={fg} fill={iconFilled ? fg : 'none'} /> : null}
      <Text variant="labelXXSmall" style={{ color: fg }}>
        {children}
      </Text>
    </View>
  );
});
