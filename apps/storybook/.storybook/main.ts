import type { StorybookConfig } from '@storybook/react-native-web-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: [
    '../../../packages/ui/src/**/*.mdx',
    '../../../packages/ui/src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  staticDirs: ['../public'],
  framework: {
    // Handles the react-native -> react-native-web alias and Flow-strips the
    // react-native ecosystem for both dev and production builds.
    name: '@storybook/react-native-web-vite',
    options: {},
  },
  docs: {},
  typescript: {
    check: false,
    reactDocgen: 'react-docgen',
  },
  async viteFinal(viteConfig) {
    // Prefer `.web` files so the DOM Icon.web.tsx is used on web.
    return mergeConfig(viteConfig, {
      resolve: {
        extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
      },
      // Allow the Cloudflare quick-tunnel host (for sharing the preview with remote testers) past
      // Vite's dev-server host check. Scoped to *.trycloudflare.com, not opened to all hosts.
      server: {
        allowedHosts: ['.trycloudflare.com'],
      },
    });
  },
};

export default config;
