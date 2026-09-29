import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { MarketplaceProvider } from '@/hooks/use-marketplace';

SplashScreen.preventAutoHideAsync();

import { Slot } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <MarketplaceProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <View style={{ flex: 1, position: 'relative' }}>
          <Slot />
          <AppTabs />
        </View>
      </ThemeProvider>
    </MarketplaceProvider>
  );
}
