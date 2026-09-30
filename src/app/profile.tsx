import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, ShieldCheck, MapPin, Phone, FileText, LogOut, Edit3, Save, RefreshCw, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace } from '@/hooks/use-marketplace';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const { userProfile, updateProfile, logoutUser, selectAction, resetAllData, resetOnboarding } = useMarketplace();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [companyName, setCompanyName] = useState(userProfile.companyName);
  const [mobile, setMobile] = useState(userProfile.mobile);
  const [businessLocation, setBusinessLocation] = useState(userProfile.businessLocation);
  const [gstNumber, setGstNumber] = useState(userProfile.gstNumber || '');
  const [companyDescription, setCompanyDescription] = useState(userProfile.companyDescription || '');

  const handleSaveProfile = async () => {
    await updateProfile({
      name,
      companyName,
      mobile,
      businessLocation,
      gstNumber,
      companyDescription,
    });
    setIsEditing(false);
    Alert.alert('Profile Saved', 'Your garment unit profile details have been updated.');
  };

  const handleLogout = async () => {
    await logoutUser();
    Alert.alert('Logged Out', 'You have been logged out.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Unit Profile</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Garment Unit & Company Identity
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Card Header */}
          <View style={[styles.profileHeaderCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
            <View style={styles.avatar}>
              <Building2 size={28} color="#2563EB" />
            </View>
            <Text style={[styles.companyNameText, { color: theme.text }]}>
              {userProfile.companyName || 'Garment Unit'}
            </Text>
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={12} color="#16A34A" />
              <Text style={styles.verifiedText}>Verified Tiruppur Unit</Text>
            </View>
            <Text style={styles.ownerText}>Owner: {userProfile.name}</Text>
          </View>

          {/* Action Switcher Hub */}
          <View style={styles.actionHub}>
            <Text style={styles.actionHubTitle}>Action Selection Mode</Text>
            <TouchableOpacity style={styles.switchBtn} onPress={() => selectAction(null)}>
              <RefreshCw size={14} color="#2563EB" />
              <Text style={styles.switchBtnText}>Switch Action (Post Work / Find Work)</Text>
            </TouchableOpacity>
          </View>

          {/* Details & Edit Form */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Company & Business Details</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(!isEditing)}>
              {isEditing ? (
                <>
                  <Save size={14} color="#2563EB" />
                  <Text style={styles.editBtnText}>Cancel</Text>
                </>
              ) : (
                <>
                  <Edit3 size={14} color="#2563EB" />
                  <Text style={styles.editBtnText}>Edit Profile</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {isEditing ? (
            /* EDIT FORM */
            <View style={styles.formCard}>
              <View style={styles.formItem}>
                <Text style={styles.formLabel}>Manager / Owner Name</Text>
                <TextInput style={styles.formInput} value={name} onChangeText={setName} />
              </View>

              <View style={styles.formItem}>
                <Text style={styles.formLabel}>Garment Company Name</Text>
                <TextInput style={styles.formInput} value={companyName} onChangeText={setCompanyName} />
              </View>

              <View style={styles.formItem}>
                <Text style={styles.formLabel}>Mobile Number (+91)</Text>
                <TextInput style={styles.formInput} value={mobile} onChangeText={setMobile} keyboardType="numeric" />
              </View>

              <View style={styles.formItem}>
                <Text style={styles.formLabel}>Business Location (Tiruppur)</Text>
                <TextInput style={styles.formInput} value={businessLocation} onChangeText={setBusinessLocation} />
              </View>

              <View style={styles.formItem}>
                <Text style={styles.formLabel}>GSTIN (Optional)</Text>
                <TextInput style={styles.formInput} value={gstNumber} onChangeText={setGstNumber} placeholder="33AAAAA0000A1Z5" />
              </View>

              <View style={styles.formItem}>
                <Text style={styles.formLabel}>Company Description</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  value={companyDescription}
                  onChangeText={setCompanyDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.saveProfileBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveProfileBtnText}>SAVE PROFILE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* DISPLAY DETAILS */
            <View style={styles.listCard}>
              <View style={styles.listItem}>
                <Text style={styles.itemLabel}>Contact Person</Text>
                <Text style={styles.itemValue}>{userProfile.name}</Text>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.listItem}>
                <Text style={styles.itemLabel}>Mobile Number</Text>
                <Text style={styles.itemValue}>+91 {userProfile.mobile}</Text>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.listItem}>
                <Text style={styles.itemLabel}>Business Location</Text>
                <Text style={styles.itemValue}>{userProfile.businessLocation}</Text>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.listItem}>
                <Text style={styles.itemLabel}>GST Number</Text>
                <Text style={styles.itemValue}>{userProfile.gstNumber || 'Not Provided'}</Text>
              </View>

              <View style={styles.itemDivider} />

              <View style={[styles.listItem, { flexDirection: 'column', alignItems: 'flex-start', gap: 4 }]}>
                <Text style={styles.itemLabel}>Unit Specifications & Description</Text>
                <Text style={styles.descBody}>{userProfile.companyDescription || 'No description provided.'}</Text>
              </View>
            </View>
          )}

          {/* Onboarding Re-play, Logout & Reset Buttons */}
          <View style={styles.footerZone}>
            <TouchableOpacity style={styles.onboardingBtn} onPress={resetOnboarding}>
              <Sparkles size={14} color="#2563EB" />
              <Text style={styles.onboardingBtnText}>Re-play Onboarding Experience</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={16} color="#DC2626" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={resetAllData}>
              <RefreshCw size={12} color="#94A3B8" />
              <Text style={styles.resetText}>Reset Demo Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
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
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  profileHeaderCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyNameText: {
    fontSize: 18,
    fontWeight: '800',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  ownerText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actionHub: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  actionHubTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 8,
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  itemLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  descBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    gap: 12,
  },
  formItem: {
    gap: 4,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  multilineInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  saveProfileBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  footerZone: {
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  onboardingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  onboardingBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
