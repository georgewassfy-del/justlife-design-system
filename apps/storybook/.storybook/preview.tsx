import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '@justlife/ui';
import justlifeTheme from './theme';
import '@justlife/tokens/css';

// The product is light-only; the catalog presents the light theme exclusively.
const preview: Preview = {
  parameters: {
    // Theme the Docs pages with our Poppins-based theme too (not just the manager).
    docs: { theme: justlifeTheme },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
      expanded: true,
    },
    options: {
      storySort: {
        order: ['Overview', 'Foundations', 'Primitives', 'Core', 'Components', 'Patterns', 'Screens'],
      },
    },
    viewport: {
      viewports: {
        iphone: { name: 'iPhone 14', styles: { width: '390px', height: '844px' }, type: 'mobile' },
        pixel: { name: 'Pixel 7', styles: { width: '412px', height: '915px' }, type: 'mobile' },
        ipad: { name: 'iPad', styles: { width: '820px', height: '1180px' }, type: 'tablet' },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
      },
    },
  },
  decorators: [
    (Story, context) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.style.background = '#FBFAF7';
      }
      // Mobile is the default target: render most stories inside a 375px phone
      // frame (with the 16px screen margin) so Playground/Docs show real mobile
      // size instead of stretching full width. Wide showcases opt out with
      // `parameters.layout = 'fullscreen'` or `parameters.mobileFrame = false`.
      const fullscreen = context.parameters?.layout === 'fullscreen';
      const framed = !fullscreen && context.parameters?.mobileFrame !== false;
      return (
        <ThemeProvider themeName="light">
          {framed ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <div
                style={{
                  // The phone "screen" is the page canvas (#FBFAF7) so white cards pop inside the frame.
                  width: 375,
                  background: '#FBFAF7',
                  borderRadius: 32,
                  border: '1px solid #EDEDED',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: 16 }}>
                  <Story />
                </div>
              </div>
            </div>
          ) : fullscreen ? (
            // True full-bleed (e.g. screens) — no padding, edge to edge.
            <Story />
          ) : (
            <div style={{ padding: 24 }}>
              <Story />
            </div>
          )}
        </ThemeProvider>
      );
    },
  ],
  tags: ['autodocs'],
};

export default preview;
