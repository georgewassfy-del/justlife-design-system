import { create } from '@storybook/theming';
import { themes as dsThemes } from '@justlife/tokens';

// The catalog UI is itself styled with Justlife design tokens.
const t = dsThemes.light;
const poppins = '"Poppins", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default create({
  base: 'light',

  brandTitle: 'Justlife Design System',
  brandTarget: '_self',
  brandImage: './justlife-logo.svg',

  colorPrimary: t.background.brandDefault,
  colorSecondary: t.background.brandDefault,

  // App chrome
  appBg: t.background.secondary,
  appContentBg: t.background.primary,
  appPreviewBg: t.background.primary,
  appBorderColor: t.border.default,
  appBorderRadius: t.radius.default,

  // Text
  textColor: t.text.primary,
  textInverseColor: t.text.inverse,
  textMutedColor: t.text.secondary,

  // Toolbar / nav
  barBg: t.background.primary,
  barTextColor: t.text.secondary,
  barHoverColor: t.background.brandHover,
  barSelectedColor: t.background.brandDefault,

  // Inputs
  inputBg: t.background.primary,
  inputBorder: t.border.default,
  inputTextColor: t.text.primary,
  inputBorderRadius: t.radius.default,

  fontBase: poppins,
  // Poppins everywhere — even inline code/snippets — per the "one font" rule.
  fontCode: poppins,
});
