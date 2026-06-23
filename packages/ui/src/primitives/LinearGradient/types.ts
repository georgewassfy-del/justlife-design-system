import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface LinearGradientProps {
  /**
   * Gradient stop colours, rendered top → bottom. Pass token values
   * (e.g. `[theme.background.brandSubtle, theme.background.brandDefault]`).
   */
  colors: string[];
  /** Box style — width, borderRadius, etc. `overflow: hidden` is applied for you. */
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}
