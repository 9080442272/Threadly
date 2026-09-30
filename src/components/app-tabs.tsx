import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, Platform, useColorScheme } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home as HomeIcon, Search, Plus, ClipboardCheck, User2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace } from '@/hooks/use-marketplace';
import { PostWorkModal } from './PostWorkModal';

export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const { selectAction } = useMarketplace();
  const [showPostModal, setShowPostModal] = useState(false);

  // Handle Central Plus Button click -> Open Post Work form
  const handleCentralAction = () => {
    selectAction('POST_WORK');
    setShowPostModal(true);
  };

  // Determine Active Tab
  const isHome = pathname === '/' || pathname === '';
  const isOpp = pathname.startsWith('/opportunities');
  const isWork = pathname.startsWith('/mywork');
  const isProfile = pathname.startsWith('/profile');

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#f1f5f9',
          },
        ]}
      >
        {/* Tab 1: Home */}
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isHome }}
          style={styles.tabItem}
          onPress={() => router.replace('/')}
        >
          <HomeIcon size={22} color={isHome ? theme.primary : '#94a3b8'} />
          <Text style={[styles.tabLabel, { color: isHome ? theme.primary : '#64748b' }]}>Home</Text>
        </Pressable>

        {/* Tab 2: Opportunities */}
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isOpp }}
          style={styles.tabItem}
          onPress={() => {
            selectAction('FIND_WORK');
            router.replace('/');
          }}
        >
          <Search size={22} color={isOpp ? theme.primary : '#94a3b8'} />
          <Text style={[styles.tabLabel, { color: isOpp ? theme.primary : '#64748b' }]}>Find Work</Text>
        </Pressable>

        {/* Tab 3: Central Plus Action Button (Post Work) */}
        <View style={styles.centerItemWrapper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Post Job Work"
            style={[
              styles.centerButton,
              {
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
              },
            ]}
            onPress={handleCentralAction}
          >
            <Plus size={26} color="#ffffff" />
          </Pressable>
        </View>

        {/* Tab 4: My Work */}
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isWork }}
          style={styles.tabItem}
          onPress={() => router.replace('/mywork')}
        >
          <ClipboardCheck size={22} color={isWork ? theme.primary : '#94a3b8'} />
          <Text style={[styles.tabLabel, { color: isWork ? theme.primary : '#64748b' }]}>My Work</Text>
        </Pressable>

        {/* Tab 5: Profile */}
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isProfile }}
          style={styles.tabItem}
          onPress={() => router.replace('/profile')}
        >
          <User2 size={22} color={isProfile ? theme.primary : '#94a3b8'} />
          <Text style={[styles.tabLabel, { color: isProfile ? theme.primary : '#64748b' }]}>Profile</Text>
        </Pressable>
      </View>

      {/* Post Work Modal */}
      <PostWorkModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSuccess={() => {
          setShowPostModal(false);
          router.replace('/mywork');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    maxWidth: 500,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  centerItemWrapper: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
});
