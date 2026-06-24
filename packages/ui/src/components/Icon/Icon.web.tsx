import React from 'react';
import { icons as lucideIcons } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { toPascalCase, type IconProps } from './icons';

type LucideComp = React.ComponentType<{
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}>;

/** Web icon — renders a Lucide DOM SVG. Native uses `Icon.tsx`. */
export function Icon({ name, size = 'md', color, fill, strokeWidth = 1.5, label }: IconProps) {
  const t = useTheme();
  const dimension = typeof size === 'number' ? size : t.iconSize[size];
  const stroke = color ?? t.icon.primary;
  const Glyph = (lucideIcons as Record<string, LucideComp>)[toPascalCase(name)];
  if (!Glyph) {
    console.warn(`[Icon] Unknown Lucide icon: "${name}" — browse https://lucide.dev/icons`);
    return null;
  }
  return (
    <Glyph
      size={dimension}
      color={stroke}
      fill={fill ?? 'none'}
      strokeWidth={strokeWidth}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
