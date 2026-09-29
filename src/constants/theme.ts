/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A', // Slate 900
    background: '#F8FAFC', // Slate 50
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EFF6FF', // Light blue
    textSecondary: '#64748B', // Slate 500
    primary: '#2563EB', // Blue 600
    success: '#059669', // Emerald 600
    focus: '#D97706',   // Amber 600
    timer: '#DC2626',   // Red 600
    accent: '#4F46E5',  // Indigo 600
    cardBorder: '#E2E8F0', // Slate 200
  },
  dark: {
    text: '#F8FAFC', // Slate 50
    background: '#0B0F19', // Deep navy black
    backgroundElement: '#1E293B', // Slate 800
    backgroundSelected: '#334155', // Slate 700
    textSecondary: '#94A3B8', // Slate 400
    primary: '#3B82F6', // Blue 500
    success: '#10B981', // Emerald 500
    focus: '#F59E0B',   // Amber 500
    timer: '#EF4444',   // Red 500
    accent: '#6366F1',  // Indigo 500
    cardBorder: '#334155', // Slate 700
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
