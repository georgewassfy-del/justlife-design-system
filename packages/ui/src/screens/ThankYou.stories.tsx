import type { Meta, StoryObj } from '@storybook/react';
import { ThankYouScreen, useTheme } from '../index';
import { Phone } from '../_dev/PhoneFrame';

/**
 * Screen adaptation: the **post-checkout Thank-You screen** (Figma `aftercheckout-or-bookingdetails`). The
 * screen itself is the SHARED, frame-agnostic `ThankYouScreen` (in `screens/ThankYouScreen.tsx`) — the SAME
 * composition the Expo app renders natively, so web and native can't drift. Here it's wrapped in the web
 * `Phone` frame with fixed web insets.
 *
 * The **hero is a large media carousel** (image **or** video) that stays **fixed** while the page scrolls up
 * over it (web pins it with `position: sticky`); shown here as GREEN media slides with the real overlay
 * chrome. The rounded **content section sits over the hero**, the confirmation card **offset up over its top
 * edge**. All copy is the exact approved Figma content. The hero's leading control is an **X close** that
 * returns to the homepage. (The same `ThankYouScreen` reused for **Booking Details** passes `leading="back"`
 * instead — see the separate **Screens/Booking Details** story.)
 */
const meta = {
  title: 'Screens/Thank You',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

// Web host: the `Phone` frame + the shared screen, with fixed web insets (status-bar inset on top).
const SAFE_TOP = 54;

/** Post-checkout confirmation — the hero's leading control is an `X` that closes to the homepage. */
export const Confirmed: StoryObj = {
  name: 'Booking Confirmed',
  render: () => {
    const t = useTheme();
    return (
      <Phone>
        <ThankYouScreen safeAreaTop={SAFE_TOP} safeAreaBottom={t.safeArea.bottom} leading="close" onLeadingPress={() => {}} />
      </Phone>
    );
  },
};
