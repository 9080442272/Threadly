import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, Platform, Modal, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Home as HomeIcon, Search, Plus, ClipboardCheck, User2, XCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace } from '@/hooks/use-marketplace';
import { GarmentScanner } from './GarmentScanner';
import { Colors } from '@/constants/theme';
import { ScrollView, TextInput } from 'react-native';

export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  
  const { 
    userRole, 
    postOpportunity, 
    orders, 
    updateOrderProgress,
    manufacturerProfile,
    updateManufacturerProfile
  } = useMarketplace();

  // Dialog/Modal Visibility States
  const [showPostOppModal, setShowPostOppModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [capacityInput, setCapacityInput] = useState('');

  // Exporter New Opportunity Form State
  const [newOppTitle, setNewOppTitle] = useState('');
  const [newOppQty, setNewOppQty] = useState('');
  const [newOppLocation, setNewOppLocation] = useState('Tiruppur');
  const [newOppOps, setNewOppOps] = useState('Stitching, Finishing');
  const [newOppDeadline, setNewOppDeadline] = useState('30');
  const [newOppRate, setNewOppRate] = useState('₹ 90-110');
  const [newOppReqs, setNewOppReqs] = useState('');

  // Handle Central Plus Button click
  const handleCentralAction = () => {
    if (userRole === 'exporter') {
      setShowPostOppModal(true);
    } else {
      setCapacityInput(manufacturerProfile.availableCapacity.toString());
      setShowCapacityModal(true);
    }
  };

  const handlePostOpportunity = async () => {
    if (!newOppTitle || !newOppQty) return;
    
    await postOpportunity({
      title: newOppTitle,
      quantity: parseInt(newOppQty, 10) || 10000,
      location: newOppLocation,
      operations: newOppOps.split(',').map(o => o.trim()),
      deadlineDays: parseInt(newOppDeadline, 10) || 30,
      rateRange: newOppRate,
      requirements: newOppReqs || 'Standard export quality requirements.',
    });

    setNewOppTitle('');
    setNewOppQty('');
    setNewOppReqs('');
    setShowPostOppModal(false);
    
    alert('🎉 Opportunity posted successfully!');
  };

  const handleSaveCapacity = async () => {
    const val = parseInt(capacityInput, 10);
    if (isNaN(val) || val < 0) return;
    await updateManufacturerProfile({
      ...manufacturerProfile,
      availableCapacity: val,
    });
    setShowCapacityModal(false);
    alert('⚡ Available capacity updated successfully!');
  };

  // Determine Active Tab
  const isHome = pathname === '/' || pathname === '';
  const isOpp = pathname.startsWith('/opportunities');
  const isWork = pathname.startsWith('/mywork');
  const isProfile = pathname.startsWith('/profile');

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View style={[
        styles.tabBar, 
        { 
          backgroundColor: isDark ? '#1e293b' : '#ffffff', 
          borderColor: isDark ? '#334155' : '#f1f5f9' 
        }
      ]}>
        
        {/* Tab 1: Home */}
        <Pressable 
          accessibilityRole="tab"
          accessibilityState={{ selected: isHome }}
          style={styles.tabItem} 
          onPress={() => router.replace('/')}
        >
          <HomeIcon 
            size={22} 
            color={isHome ? theme.primary : '#94a3b8'} 
          />
          <Text style={[styles.tabLabel, { color: isHome ? theme.primary : '#64748b' }]}>Home</Text>
        </Pressable>

        {/* Tab 2: Opportunities */}
        <Pressable 
          accessibilityRole="tab"
          accessibilityState={{ selected: isOpp }}
          style={styles.tabItem} 
          onPress={() => router.replace('/opportunities')}
        >
          <Search 
            size={22} 
            color={isOpp ? theme.primary : '#94a3b8'} 
          />
          <Text style={[styles.tabLabel, { color: isOpp ? theme.primary : '#64748b' }]}>Opportunities</Text>
        </Pressable>

        {/* Tab 3: Central Plus Action Button */}
        <View style={styles.centerItemWrapper}>
          <Pressable 
            accessibilityRole="button"
            accessibilityLabel={userRole === 'exporter' ? "Post Job Work" : "Update Capacity"}
            style={[
              styles.centerButton, 
              { 
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
              }
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
          <ClipboardCheck 
            size={22} 
            color={isWork ? theme.primary : '#94a3b8'} 
          />
          <Text style={[styles.tabLabel, { color: isWork ? theme.primary : '#64748b' }]}>My Work</Text>
        </Pressable>

        {/* Tab 5: Profile */}
        <Pressable 
          accessibilityRole="tab"
          accessibilityState={{ selected: isProfile }}
          style={styles.tabItem} 
          onPress={() => router.replace('/profile')}
        >
          <User2 
            size={22} 
            color={isProfile ? theme.primary : '#94a3b8'} 
          />
          <Text style={[styles.tabLabel, { color: isProfile ? theme.primary : '#64748b' }]}>Profile</Text>
        </Pressable>
      </View>

      {/* EXPORTER POST OPPORTUNITY MODAL */}
      <Modal
        visible={showPostOppModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPostOppModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Post Sourcing Opportunity</Text>
            <Pressable onPress={() => setShowPostOppModal(false)}>
              <XCircle size={24} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
            <View style={styles.formItem}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Product / Garment Name *</Text>
              <TextInput
                value={newOppTitle}
                onChangeText={setNewOppTitle}
                placeholder="e.g. Boys Hooded Sweatshirts"
                placeholderTextColor={theme.textSecondary}
                style={[styles.modalInput, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.backgroundElement }]}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formItem, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Quantity (pcs) *</Text>
                <TextInput
                  keyboardType="numeric"
                  value={newOppQty}
                  onChangeText={setNewOppQty}
                  placeholder="e.g. 15000"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.modalInput, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.backgroundElement }]}
                />
              </View>
              <View style={[styles.formItem, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Target Rate (/pc) *</Text>
                <TextInput
                  value={newOppRate}
                  onChangeText={setNewOppRate}
                  placeholder="e.g. ₹ 95-110"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.modalInput, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.backgroundElement }]}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formItem, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Sourcing Location *</Text>
                <TextInput
                  value={newOppLocation}
                  onChangeText={setNewOppLocation}
                  placeholder="e.g. Tiruppur"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.modalInput, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.backgroundElement }]}
                />
              </View>
              <View style={[styles.formItem, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Deadline (days) *</Text>
                <TextInput
                  keyboardType="numeric"
                  value={newOppDeadline}
                  onChangeText={setNewOppDeadline}
                  placeholder="e.g. 30"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.modalInput, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.backgroundElement }]}
                />
              </View>
            </View>

            <View style={styles.formItem}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Operations Required (comma separated)</Text>
              <TextInput
                value={newOppOps}
                onChangeText={setNewOppOps}
                placeholder="e.g. Stitching, Washing, Finishing"
                placeholderTextColor={theme.textSecondary}
                style={[styles.modalInput, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.backgroundElement }]}
              />
            </View>

            <View style={styles.formItem}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Detailed Sourcing Requirements</Text>
              <TextInput
                multiline
                numberOfLines={4}
                value={newOppReqs}
                onChangeText={setNewOppReqs}
                placeholder="Fabric specs, GSM, certificates, trimming requirements, packaging, etc."
                placeholderTextColor={theme.textSecondary}
                style={[styles.modalInput, styles.multilineInput, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.backgroundElement }]}
              />
            </View>

            <Pressable style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handlePostOpportunity}>
              <Text style={styles.submitBtnText}>Submit Opportunity</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* MANUFACTURER UPDATE CAPACITY MODAL */}
      <Modal
        visible={showCapacityModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCapacityModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Update Available Capacity</Text>
            <Pressable onPress={() => setShowCapacityModal(false)}>
              <XCircle size={24} color={theme.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.modalForm}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 8 }]}>Available Buffer Quantity (pcs)</Text>
            <TextInput
              keyboardType="numeric"
              value={capacityInput}
              onChangeText={setCapacityInput}
              placeholder="e.g. 35000"
              placeholderTextColor={theme.textSecondary}
              style={[styles.modalInput, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.backgroundElement }]}
            />
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
              of {manufacturerProfile.maxCapacity.toLocaleString()} pcs total monthly plant capacity.
            </Text>

            <Pressable 
              style={[styles.submitBtn, { backgroundColor: theme.primary, marginTop: 24 }]} 
              onPress={handleSaveCapacity}
            >
              <Text style={styles.submitBtnText}>Save Available Capacity</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#33415520',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalForm: {
    padding: 16,
    gap: 16,
  },
  formItem: {
    gap: 6,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  multilineInput: {
    height: 90,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  submitBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
