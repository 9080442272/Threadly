import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, ShieldCheck, Wrench, Award, Globe, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace } from '@/hooks/use-marketplace';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { RoleSelector } from '@/components/RoleSelector';

export default function ProfileScreen() {
  const theme = useTheme();
  const { userRole, manufacturerProfile, exporterProfile, resetAllData } = useMarketplace();

  const handleReset = async () => {
    await resetAllData();
    alert('🔄 App database reset to initial mock data. Enjoy testing!');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>My Profile</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage your corporate B2B identity
          </Text>
        </View>

        {/* Role switcher inside Profile screen */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <RoleSelector />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* MANUFACTURER PROFILE DETAILS */}
          {userRole === 'manufacturer' && (
            <>
              {/* Profile Card Header */}
              <View style={[styles.profileHeaderCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                <View style={styles.avatar}>
                  <Building2 size={24} color={theme.primary} />
                </View>
                <Text style={[styles.companyName, { color: theme.text }]}>
                  {manufacturerProfile.companyName}
                </Text>
                <View style={[styles.badge, { backgroundColor: `${theme.success}12` }]}>
                  <ShieldCheck size={11} color={theme.success} />
                  <Text style={[styles.badgeText, { color: theme.success }]}>Verified Manufacturer</Text>
                </View>
                <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                  {manufacturerProfile.factoryLocation}
                </Text>
              </View>

              {/* Plant Capacity Section */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Plant Capacity</Text>
              </View>
              <View style={[styles.listCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                <View style={styles.listItem}>
                  <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>Max Monthly Capacity</Text>
                  <Text style={[styles.itemValue, { color: theme.text }]}>
                    {manufacturerProfile.maxCapacity.toLocaleString()} pcs
                  </Text>
                </View>
                <View style={[styles.itemDivider, { backgroundColor: theme.cardBorder }]} />
                <View style={styles.listItem}>
                  <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>Available Sourcing Buffer</Text>
                  <Text style={[styles.itemValue, { color: theme.primary, fontWeight: '700' }]}>
                    {manufacturerProfile.availableCapacity.toLocaleString()} pcs
                  </Text>
                </View>
              </View>

              {/* Machinery Section */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Machinery Inventory</Text>
              </View>
              <View style={[styles.listCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                {manufacturerProfile.machinery.map((mach, idx) => (
                  <View key={idx}>
                    {idx > 0 && <View style={[styles.itemDivider, { backgroundColor: theme.cardBorder }]} />}
                    <View style={styles.listFlexItem}>
                      <Wrench size={14} color={theme.textSecondary} />
                      <Text style={[styles.flexItemText, { color: theme.text }]}>{mach}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Specialisations Section */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Product Specialisations</Text>
              </View>
              <View style={styles.tagWrapper}>
                {manufacturerProfile.specialisations.map((spec, idx) => (
                  <View key={idx} style={[styles.tag, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.tagText, { color: theme.text }]}>{spec}</Text>
                  </View>
                ))}
              </View>

              {/* Certifications Section */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Certifications</Text>
              </View>
              <View style={[styles.listCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                {manufacturerProfile.certifications.map((cert, idx) => (
                  <View key={idx}>
                    {idx > 0 && <View style={[styles.itemDivider, { backgroundColor: theme.cardBorder }]} />}
                    <View style={styles.listFlexItem}>
                      <Award size={14} color={theme.success} />
                      <Text style={[styles.flexItemText, { color: theme.text }]}>{cert}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* EXPORTER PROFILE DETAILS */}
          {userRole === 'exporter' && (
            <>
              {/* Profile Card Header */}
              <View style={[styles.profileHeaderCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                <View style={styles.avatar}>
                  <Globe size={24} color={theme.primary} />
                </View>
                <Text style={[styles.companyName, { color: theme.text }]}>
                  {exporterProfile.companyName}
                </Text>
                <View style={[styles.badge, { backgroundColor: `${theme.success}12` }]}>
                  <ShieldCheck size={11} color={theme.success} />
                  <Text style={[styles.badgeText, { color: theme.success }]}>Verified Sourcing Partner</Text>
                </View>
                <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                  International Exporter Sourcing Hub
                </Text>
              </View>

              {/* Business details */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Business Summary</Text>
              </View>
              <View style={[styles.listCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder, padding: 16 }]}>
                <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
                  {exporterProfile.businessDetails}
                </Text>
              </View>

              {/* Target Categories */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Sourced Categories</Text>
              </View>
              <View style={styles.tagWrapper}>
                {exporterProfile.categories.map((cat, idx) => (
                  <View key={idx} style={[styles.tag, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.tagText, { color: theme.text }]}>{cat}</Text>
                  </View>
                ))}
              </View>

              {/* Certifications & Memberships */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Trade Associations</Text>
              </View>
              <View style={[styles.listCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                {exporterProfile.certifications.map((cert, idx) => (
                  <View key={idx}>
                    {idx > 0 && <View style={[styles.itemDivider, { backgroundColor: theme.cardBorder }]} />}
                    <View style={styles.listFlexItem}>
                      <Award size={14} color={theme.primary} />
                      <Text style={[styles.flexItemText, { color: theme.text }]}>{cert}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Reset App Data Button */}
          <View style={styles.dangerZone}>
            <Pressable style={[styles.resetBtn, { borderColor: theme.timer }]} onPress={handleReset}>
              <RefreshCw size={14} color={theme.timer} />
              <Text style={[styles.resetBtnText, { color: theme.timer }]}>Reset Marketplace Database</Text>
            </Pressable>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingBottom: Platform.OS === 'ios' ? 0 : BottomTabInset,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  profileHeaderCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F612',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  listCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  listFlexItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  flexItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  dangerZone: {
    marginTop: 32,
    alignItems: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
