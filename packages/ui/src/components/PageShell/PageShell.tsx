import React, { forwardRef, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type View as ViewType,
  type ViewProps,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { elevationToStyle, type ElevationToken } from '../../theme/style-helpers';
import type { Tokens } from '@justlife/tokens';

export interface PageShellProps extends Omit<ViewProps, 'children'> {
  /**
   * Renders the pinned header. Receives the live `collapsed` flag (driven by scroll) so it can
   * scroll-collapse — pass it straight to `<Header collapsed={collapsed} divider={false} … />`.
   */
  renderHeader: (collapsed: boolean) => React.ReactNode;
  /**
   * The band art behind the card (the `z −2` layer) — fills the band area, so pass a node that
   * stretches (e.g. `<RadialGlow style={{ flex: 1 }} … />` for the soft aurora, a `<LinearGradient>`,
   * a solid `<View>`, or a media/video node). Omit for no band (card on the page background).
   */
  band?: React.ReactNode;
  /** Expanded band height in px. Default 200. */
  bandHeight?: number;
  /** Content laid over the band (e.g. a tagline). Fades out as the band collapses. */
  bandContent?: React.ReactNode;
  /**
   * Optional row that pins directly under the header once the band has collapsed (e.g. the salon
   * category-chips slider). Fades / slides in on collapse.
   */
  stickyRow?: React.ReactNode;
  /**
   * Floating bottom bar (the funnel's Total + Next/Complete `CheckoutBar`). Overlays the bottom of the
   * scroll area — content scrolls **behind** it — so pair it with {@link PageShellProps.footerInset}.
   */
  footer?: React.ReactNode;
  /** Bottom padding added inside the content card so the last items clear the floating `footer`. */
  footerInset?: number;
  /**
   * Top padding inside the content card, above the first item. Defaults to the band overlap so content
   * meets the band's bottom edge. Pass a smaller value (e.g. `space.md`) when the page's first item is a
   * **card**, so its top gap equals the page's left/right padding; keep the larger default when the first
   * item is **text**, which reads better with extra breathing room under the rounded card top.
   */
  contentInsetTop?: number;
  /** Page content, rendered inside the rounded-top content card. */
  children: React.ReactNode;
  /** Content-card top-corner radius. Default `radius.2xl` (24). */
  cardRadius?: number;
  /** How far the card overlaps up into the band (px). Default `size.24`. */
  overlap?: number;
  /** Height reserved for the pinned header (used to place the sticky row). Default `size.48`. */
  headerHeight?: number;
  /** Scroll offset (px) at which the header collapses. Default ≈ `bandHeight - overlap - headerHeight`. */
  collapseThreshold?: number;
  /** Fires when the collapsed state flips. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * **Pinned mode** (home-cleaning funnel): the header, band and rounded card are all **fixed** — only
   * the content *inside* the card scrolls. No band-collapse, no header collapse (`renderHeader` always
   * receives `false`). Leave `false` (default) for the flex-funnel collapsing behaviour.
   */
  pinned?: boolean;
  /**
   * Make the scroll content fill the viewport height (pinned mode) so a trailing element can be pushed to
   * the bottom with a `flex:1` spacer — content still scrolls normally when it overflows. Default `false`.
   */
  contentGrow?: boolean;
  /**
   * Elevation of the rounded content card — controls the depth of the band ↔ card seam. Default
   * `raised` (a soft downward shadow); pass `sheet` for a deeper, **upward** seam shadow (the card
   * reading as lifted above the band).
   */
  cardElevation?: keyof Tokens['elevation'];
  /** Raw shadow override for the content card — takes precedence over `cardElevation` (e.g. a tuned soft seam shadow). */
  cardShadow?: ElevationToken;
}

/**
 * Layered "depth" page scaffold for the booking funnels. A soft-gradient (or media) **band sits
 * behind** a **rounded-top content card** that overlaps up into it — conceptually band `z −2`, card
 * `z 0`. The card scrolls over the band; the band fades + parallaxes away and, past a threshold, the
 * header scroll-collapses (via the `Header`'s own `collapsed` animation) and an optional sticky row
 * (category chips) pins under the header. Scroll is built in — pass a header, a band, and content and
 * it just works. Animated with the `motion` tokens. The band is a slot (`band`) — e.g. a `RadialGlow`
 * for the soft aurora, a solid colour, or a media node; a tagline/overlay goes in `bandContent`.
 */
export const PageShell = forwardRef<ViewType, PageShellProps>(function PageShell(
  {
    renderHeader,
    band,
    bandHeight = 200,
    bandContent,
    stickyRow,
    footer,
    footerInset = 0,
    contentInsetTop,
    children,
    cardRadius,
    overlap,
    headerHeight,
    collapseThreshold,
    onCollapsedChange,
    pinned = false,
    contentGrow = false,
    cardElevation = 'raised',
    cardShadow,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const radius = cardRadius ?? t.radius['2xl'];
  const lap = overlap ?? t.size['24'];
  const hHeight = headerHeight ?? t.size['48'];
  const threshold = collapseThreshold ?? Math.max(t.size['16'], bandHeight - lap - hHeight);
  // Card shadow: a raw override wins, else the named elevation token. Applied to the OUTER card layer
  // (the inner layer does the `overflow:'hidden'` clip) so iOS doesn't clip the shadow away.
  const cardShadowStyle = elevationToStyle(cardShadow ?? t.elevation[cardElevation]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [collapsed, setCollapsed] = useState(false);

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false, // we read the value in JS to flip `collapsed`
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      setCollapsed((prev) => {
        // Hysteresis around the threshold so it doesn't flicker mid-scroll.
        const next = prev ? y > threshold - hHeight : y > threshold;
        if (next !== prev) onCollapsedChange?.(next);
        return next;
      });
    },
  });

  const clamp = { extrapolate: 'clamp' as const };
  const stickyOpacity = scrollY.interpolate({ inputRange: [threshold - hHeight, threshold], outputRange: [0, 1], ...clamp });
  const stickyTranslate = scrollY.interpolate({ inputRange: [threshold - hHeight, threshold], outputRange: [-t.size['8'], 0], ...clamp });

  const hasBand = !!(band || bandContent);
  // Top padding above the first content item. Defaults to the overlap (content meets the band's bottom
  // edge); callers pass a smaller value for card-first pages so the top gap matches the side padding.
  const topInset = contentInsetTop ?? (hasBand ? lap : 0);

  // ── Pinned mode: header / band / card all fixed; only the content inside the card scrolls. ──
  if (pinned) {
    return (
      <View ref={ref} style={[{ flex: 1, backgroundColor: t.background.canvas }, style]} {...rest}>
        <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Band — fixed behind the header. */}
          {hasBand ? (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: bandHeight, zIndex: 0 }}>
              {band ? <View style={StyleSheet.absoluteFill}>{band}</View> : null}
              {bandContent ? <View style={StyleSheet.absoluteFill}>{bandContent}</View> : null}
            </View>
          ) : null}

          {/* Content card — FIXED; only the inner ScrollView scrolls. Two layers: the OUTER casts the
              shadow (rounded + bg, NO clip) and the INNER clips content to the rounded top — otherwise
              iOS `overflow:'hidden'` would clip the shadow away (it shows on web, not native). */}
          <View
            style={{
              position: 'absolute',
              top: hasBand ? bandHeight - lap : 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              backgroundColor: t.background.canvas,
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              ...cardShadowStyle,
            }}
          >
            <View style={{ flex: 1, borderTopLeftRadius: radius, borderTopRightRadius: radius, overflow: 'hidden' }}>
              <Animated.ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingTop: topInset, paddingBottom: footerInset, ...(contentGrow ? { flexGrow: 1 } : null) }}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </Animated.ScrollView>
            </View>
          </View>

          {/* Header — fixed on top (never collapses). */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 }}>
            {renderHeader(false)}
          </View>

          {/* Footer — floating bottom overlay; inner content scrolls behind it. */}
          {footer ? (
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4, pointerEvents: 'box-none' }}>
              {footer}
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View
      ref={ref}
      style={[{ flex: 1, backgroundColor: t.background.canvas }, style]}
      {...rest}
    >
      {/* Stage — the layered band + scrolling card + pinned header. Clips the band parallax. */}
      <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      {/* Scrolling content — the band scrolls away behind the pinned header; the rounded card
          overlaps up into it. */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
      >
        {band || bandContent ? (
          <View style={{ height: bandHeight }}>
            {band ? <View style={StyleSheet.absoluteFill}>{band}</View> : null}
            {bandContent ? <View style={StyleSheet.absoluteFill}>{bandContent}</View> : null}
          </View>
        ) : null}
        <View
          style={{
            flexGrow: 1,
            marginTop: band || bandContent ? -lap : 0,
            backgroundColor: t.background.canvas,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            paddingTop: topInset,
            paddingBottom: footerInset,
            ...cardShadowStyle,
          }}
        >
          {children}
        </View>
      </Animated.ScrollView>

      {/* Sticky row — pins under the header once collapsed. */}
      {stickyRow ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: hHeight,
            left: 0,
            right: 0,
            zIndex: 2,
            opacity: stickyOpacity,
            transform: [{ translateY: stickyTranslate }],
            backgroundColor: t.background.canvas,
          }}
        >
          {stickyRow}
        </Animated.View>
      ) : null}

      {/* Header — pinned over the band (top layer). */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3 }}>
        {renderHeader(collapsed)}
      </View>

      {/* Footer — floating bottom overlay; content scrolls behind it. */}
      {footer ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4, pointerEvents: 'box-none' }}>
          {footer}
        </View>
      ) : null}
      </View>
    </View>
  );
});
