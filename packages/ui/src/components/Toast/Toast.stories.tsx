import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Toast } from './Toast';
import { ToastProvider, useToast } from './ToastProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../primitives/Text';
import { Button } from '../Button';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  args: { message: 'Booking confirmed', tone: 'neutral', open: true },
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'success', 'error', 'info', 'warning'] },
    message: { control: 'text' },
    dismissible: { control: 'boolean' },
    open: { control: 'boolean' },
    position: { control: 'inline-radio', options: ['top', 'bottom'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Transient self-dismissing **snackbar**. A dark surface (`background.inverse`) keeps it distinct from the light cards; the tone shows as a coloured leading icon. Drive it imperatively with `ToastProvider` + `useToast()` (queue + auto-dismiss + safe-area placement); the bare `Toast` is presentational.',
      },
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single bar — tweak tone/message/action via Controls. */
export const Playground: Story = {
  args: { tone: 'success', message: 'Voucher applied — 15% off', dismissible: true },
};

/** Every tone. `neutral` shows no icon; the rest carry a coloured glyph. */
export const Tones: Story = {
  render: () => {
    const t = useTheme();
    return (
      <View style={{ gap: t.space.sm }}>
        <Toast message="Changes saved" tone="neutral" />
        <Toast message="Booking confirmed" tone="success" />
        <Toast message="Couldn’t apply that code" tone="error" />
        <Toast message="Your pro is running 10 min late" tone="info" />
        <Toast message="Slots are filling up fast" tone="warning" />
      </View>
    );
  },
};

/** With a trailing action (the ✕ hides when an action is present unless you force `dismissible`). */
export const WithAction: Story = {
  render: () => {
    const t = useTheme();
    return (
      <View style={{ gap: t.space.sm }}>
        <Toast message="Address removed" tone="neutral" action={{ label: 'Undo', onPress: () => {} }} />
        <Toast message="Booking cancelled" tone="success" action={{ label: 'View', onPress: () => {} }} />
        <Toast
          message="Network error"
          tone="error"
          action={{ label: 'Retry', onPress: () => {} }}
          dismissible
        />
      </View>
    );
  },
};

/** A long message wraps to two lines, then truncates. */
export const LongMessage: Story = {
  args: {
    tone: 'info',
    message:
      'We moved your 14:00 cleaning to 15:30 because your professional’s earlier job ran long — tap to review.',
    action: { label: 'Review', onPress: () => {} },
  },
};

/** Bounded, positioned "screen" so the provider's absolute overlay has a frame to anchor to. */
function Stage({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ position: 'relative', height: 560, overflow: 'hidden', backgroundColor: t.background.secondary }}>
      {children}
    </View>
  );
}

function Triggers() {
  const t = useTheme();
  const toast = useToast();
  return (
    <View style={{ padding: t.space.md, gap: t.space.sm }}>
      <Text variant="titleSmall">Tap to fire a toast</Text>
      <Button onPress={() => toast.success('Booking confirmed')}>Success</Button>
      <Button variant="secondary" onPress={() => toast.error('Couldn’t apply that code', { action: { label: 'Retry', onPress: () => {} } })}>
        Error + Retry
      </Button>
      <Button variant="secondary" onPress={() => toast.info('Your pro is on the way')}>
        Info
      </Button>
      <Button variant="secondary" onPress={() => toast.show('Address removed', { action: { label: 'Undo', onPress: () => {} } })}>
        Neutral + Undo
      </Button>
      <Button variant="ghost" onPress={() => toast.warning('Slots are filling up', { duration: 0 })}>
        Sticky warning
      </Button>
    </View>
  );
}

/** Interactive — the real `useToast()` API: queueing, auto-dismiss, and the slide/fade animation. */
export const Interactive: Story = {
  parameters: { controls: { disable: true }, layout: 'fullscreen' },
  render: () => (
    <Stage>
      <ToastProvider position="bottom">
        <Triggers />
      </ToastProvider>
    </Stage>
  ),
};
