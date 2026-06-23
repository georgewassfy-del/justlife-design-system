import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { ServiceCard, InfoCard, Icon, Text, HStack, VStack, useTheme } from '../index';
import { PlaceholderImage } from '../_dev/PlaceholderImage';

/**
 * Screen adaptation: Women's Salon → Bestsellers, rebuilt in the new design
 * system from an old-app screenshot. Real DS components are used where they
 * exist; anything not yet built is shown as a GREEN placeholder.
 */
const meta = {
  title: "Screens/Women's Salon",
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;

const MISSING_GREEN = '#22C55E';

/** Green placeholder for a part the design system doesn't have yet. */
function Missing({ label, height }: { label: string; height: number }) {
  return (
    <View
      style={{
        height,
        margin: 16,
        borderRadius: 16,
        backgroundColor: MISSING_GREEN,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Text variant="labelLarge" align="center" style={{ color: '#FFFFFF' }}>
        {label}
      </Text>
    </View>
  );
}

export const Bestsellers: StoryObj = {
  render: () => {
    const t = useTheme();
    return (
      <View style={{ width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: t.background.canvas, minHeight: 812 }}>
        {/* Status bar (composed from primitives) */}
        <HStack justify="space-between" align="center" style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 }}>
          <Text variant="labelMedium">16:12</Text>
          <HStack gap="xs" align="center">
            <Icon name="signal" size="sm" />
            <Icon name="wifi" size="sm" />
            <Icon name="battery" size="sm" />
          </HStack>
        </HStack>

        {/* Nav header (composed — no NavBar component yet) */}
        <HStack
          justify="space-between"
          align="center"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: t.borderWidth.thin,
            borderColor: t.border.default,
          }}
        >
          <HStack gap="sm" align="center">
            <Icon name="chevron-left" size="lg" />
            <Text variant="headlineSmall">Women&apos;s Salon</Text>
          </HStack>
          <HStack gap="md" align="center">
            <Icon name="search" size="lg" />
            <Icon name="heart" size="lg" />
          </HStack>
        </HStack>

        {/* Section header (composed) */}
        <View style={{ backgroundColor: t.background.tertiary, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text variant="titleLarge">Bestsellers</Text>
        </View>

        {/* Hero / promo banner — NOT BUILT (needs a banner component + photo asset) */}
        <Missing label="Hero / Promo banner — not built (needs banner component + image asset)" height={150} />

        {/* Service list — real ServiceCard */}
        <VStack gap="sm" style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <ServiceCard
            title="Gel Mani-Pedi"
            description="Polished, glossy gel nails for hands & feet with long-lasting shine."
            optionsTag="2 Options"
            price="99"
            image={<PlaceholderImage seed="gelmanipedi" />}
          />
          <InfoCard tone="info" icon="info">
            Pick your gel shade after adding to cart.
          </InfoCard>
          <ServiceCard
            title="Princess Mani-Pedi (7–16y)"
            description="Gentle nail care with fun polish colors, specially designed for young girls."
            optionsTag="2 Options"
            price="49"
            image={<PlaceholderImage seed="princess" />}
          />
          <ServiceCard
            title="Classic Mani-Pedi Combo"
            duration="90 min"
            description="Bestselling Classic Mani-Pedi Combo with Essie & Kinetics shades."
            price="109"
            oldPrice="180"
            image={<PlaceholderImage seed="classiccombo" />}
          />
          <InfoCard tone="success" icon="circle-check">
            You save AED 71 vs booking separately.
          </InfoCard>
          <ServiceCard
            title="Gel Polish Mani-Pedi Combo"
            duration="130 min"
            description="Achieve stunning, long-lasting nails with our Gel Manicure & Pedicure."
            price="169"
            oldPrice="260"
            image={<PlaceholderImage seed="gelpolishcombo" />}
          />
          <ServiceCard
            title="Polish-Free Mani-Pedi"
            duration="70 min"
            description="Classic Manicure & Pedicure treatment without polish."
            price="79"
            image={<PlaceholderImage seed="polishfree" />}
          />
        </VStack>
      </View>
    );
  },
};
