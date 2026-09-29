import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MessageSquare, Pencil, Bell, ChevronRight, Package, ShieldCheck, Plus, XCircle, MapPin, Clock, Search } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace, Opportunity } from '@/hooks/use-marketplace';
import { RoleSelector } from '@/components/RoleSelector';
import { OpportunityCard } from '@/components/OpportunityCard';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const {
    userRole,
    manufacturerProfile,
    exporterProfile,
    updateManufacturerProfile,
    opportunities,
    applications,
    orders,
    postOpportunity,
    applyToOpportunity,
  } = useMarketplace();

  // Dialog / Modal Visibility States
  const [showPostOppModal, setShowPostOppModal] = useState(false);
  const [showUpdateCapacityPanel, setShowUpdateCapacityPanel] = useState(false);

  // Exporter New Opportunity Form State
  const [newOppTitle, setNewOppTitle] = useState('');
  const [newOppQty, setNewOppQty] = useState('');
  const [newOppLocation, setNewOppLocation] = useState('Tiruppur');
  const [newOppOps, setNewOppOps] = useState('Stitching, Finishing');
  const [newOppDeadline, setNewOppDeadline] = useState('30');
  const [newOppRate, setNewOppRate] = useState('₹ 90-110');
  const [newOppReqs, setNewOppReqs] = useState('');

  // Manufacturer Capacity Form State
  const [newCapacity, setNewCapacity] = useState(manufacturerProfile.availableCapacity.toString());

  // Home Feed Search & Filter states (Manufacturer view)
  const [homeSearch, setHomeSearch] = useState('');
  const [homeChip, setHomeChip] = useState('All');

  const handleUpdateCapacity = async () => {
    const qty = parseInt(newCapacity, 10);
    if (!isNaN(qty)) {
      await updateManufacturerProfile({ availableCapacity: qty });
      setShowUpdateCapacityPanel(false);
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

    // Reset Form
    setNewOppTitle('');
    setNewOppQty('');
    setNewOppReqs('');
    setShowPostOppModal(false);
    
    alert('🎉 Opportunity posted successfully!');
  };

  const handleApply = (opp: Opportunity) => {
    router.push({
      pathname: '/opportunities',
      params: { applyToId: opp.id }
    });
  };

  const handleViewDetails = (opp: Opportunity) => {
    router.push({
      pathname: '/opportunities',
      params: { viewId: opp.id }
    });
  };

  // Manufacturer stats
  const mActiveOrders = orders.filter(o => o.status !== 'completed');
  const mPendingApps = applications.filter(a => a.status === 'submitted');

  const filteredHomeOpportunities = opportunities.filter(opp => {
    // 1. Search filter (by title or company name)
    const matchesSearch = opp.title.toLowerCase().includes(homeSearch.toLowerCase()) || 
                          opp.exporterName.toLowerCase().includes(homeSearch.toLowerCase());
    
    // 2. Chip filter
    if (!matchesSearch) return false;
    if (homeChip === 'All') return true;
    if (homeChip === 'Nearby') return opp.location.toLowerCase() === manufacturerProfile.factoryLocation.toLowerCase();
    if (homeChip === 'T-Shirt') return opp.title.toLowerCase().includes('t-shirt') || opp.title.toLowerCase().includes('tshirt');
    if (homeChip === 'Polo') return opp.title.toLowerCase().includes('polo');
    if (homeChip === 'Denim') return opp.title.toLowerCase().includes('denim');
    return true;
  });

  // Exporter stats
  const eActiveOrders = orders.filter(o => o.status !== 'completed');
  const eApplicationsReceived = applications.filter(a => a.status === 'submitted');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Text style={[styles.logoText, { color: theme.primary }]}>THREADS</Text>
          <View style={styles.headerRight}>
            <Pressable 
              accessibilityRole="button"
              accessibilityLabel="Open Notifications"
              style={[styles.chatBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}
              onPress={() => router.push('/messages')}
            >
              <Bell size={15} color={theme.primary} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* MANUFACTURER FEED VIEW */}
          {userRole === 'manufacturer' && (
            <>
              {/* Manufacturer Company Header */}
              <View style={styles.manufacturerHeaderRow}>
                <Text style={[styles.mCompName, { color: theme.text }]}>
                  {manufacturerProfile.companyName}
                </Text>
                <Text style={[styles.mCompLoc, { color: theme.textSecondary }]}>
                  {manufacturerProfile.factoryLocation}, Tamil Nadu
                </Text>
              </View>

              <View style={[styles.jobSectionHeader, { borderTopColor: theme.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Job Work Opportunities
                </Text>
              </View>

              {/* Search Bar */}
              <View style={[styles.jobSearchBox, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                <Search size={15} color={theme.textSecondary} />
                <TextInput
                  value={homeSearch}
                  onChangeText={setHomeSearch}
                  placeholder="Search companies or orders..."
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.jobSearchInput, { color: theme.text }]}
                />
                {homeSearch.length > 0 && (
                  <Pressable onPress={() => setHomeSearch('')}>
                    <XCircle size={14} color={theme.textSecondary} />
                  </Pressable>
                )}
              </View>

              {/* Category Chips Scroll */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.jobChipsScroll}
              >
                {['All', 'Nearby', 'T-Shirt', 'Polo', 'Denim'].map((chip) => {
                  const isSelected = homeChip === chip;
                  return (
                    <Pressable
                      key={chip}
                      style={[
                        styles.jobChip, 
                        { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
                        isSelected && { backgroundColor: theme.backgroundSelected, borderColor: theme.primary }
                      ]}
                      onPress={() => setHomeChip(chip)}
                    >
                      <Text style={[
                        styles.jobChipText, 
                        { color: isSelected ? theme.primary : theme.textSecondary, fontWeight: isSelected ? '700' : '500' }
                      ]}>
                        {chip}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Feed Cards */}
              <View style={styles.jobFeedContainer}>
                {filteredHomeOpportunities.length === 0 ? (
                  <View style={styles.emptyFeed}>
                    <Search size={28} color={theme.textSecondary} />
                    <Text style={[styles.emptyFeedText, { color: theme.textSecondary }]}>
                      No matching job works found.
                    </Text>
                  </View>
                ) : (
                  filteredHomeOpportunities.map((opp) => (
                    <View key={opp.id} style={[styles.jobCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                      
                      {/* Exporter Info */}
                      <View style={styles.jobCardHeader}>
                        <View>
                          <Text style={[styles.jobExporterName, { color: theme.text }]}>
                            {opp.exporterName}
                          </Text>
                          {opp.isVerified && (
                            <View style={[styles.jobVerifiedBadge, { backgroundColor: `${theme.success}12` }]}>
                              <ShieldCheck size={11} color={theme.success} />
                              <Text style={[styles.jobVerifiedText, { color: theme.success }]}>Verified Exporter</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Divider */}
                      <View style={[styles.jobDivider, { backgroundColor: theme.cardBorder }]} />

                      {/* Job Title and Quantity */}
                      <Text style={[styles.jobTitle, { color: theme.text }]}>{opp.title}</Text>
                      <Text style={[styles.jobQty, { color: theme.primary }]}>{opp.quantity.toLocaleString()} pcs</Text>

                      {/* Specs Row */}
                      <View style={styles.jobSpecsRow}>
                        <View style={styles.jobSpecItem}>
                          <MapPin size={13} color={theme.textSecondary} />
                          <Text style={[styles.jobSpecText, { color: theme.textSecondary }]}>{opp.location}</Text>
                        </View>
                        <View style={styles.jobSpecItem}>
                          <Clock size={13} color={theme.textSecondary} />
                          <Text style={[styles.jobSpecText, { color: theme.textSecondary }]}>{opp.deadlineDays} days</Text>
                        </View>
                        <View style={styles.jobSpecItem}>
                          <Text style={[styles.jobSpecText, { color: theme.textSecondary, fontWeight: '700' }]}>
                            {opp.rateRange} / pc
                          </Text>
                        </View>
                      </View>

                      {/* Action CTA */}
                      <Pressable 
                        style={[styles.jobActionBtn, { backgroundColor: `${theme.primary}12` }]}
                        onPress={() => handleViewDetails(opp)}
                      >
                        <Text style={[styles.jobActionText, { color: theme.primary }]}>View Job Work →</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            </>
          )}

          {/* EXPORTER DASHBOARD VIEW */}
          {userRole === 'exporter' && (
            <>
              {/* Greeting */}
              <View style={styles.welcomeSection}>
                <Text style={[styles.title, { color: theme.text }]}>
                  {exporterProfile.companyName}
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Sourcing Agency • {exporterProfile.businessDetails}
                </Text>
              </View>

              {/* Main Actions Received Summary */}
              <View style={styles.metricsRow}>
                <Pressable 
                  style={[styles.metricCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}
                  onPress={() => router.push('/mywork')}
                >
                  <Text style={[styles.metricValue, { color: theme.primary }]}>{eActiveOrders.length}</Text>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Active Sourcing</Text>
                </Pressable>

                <Pressable 
                  style={[styles.metricCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}
                  onPress={() => router.push('/mywork')}
                >
                  <Text style={[styles.metricValue, { color: theme.focus }]}>{eApplicationsReceived.length}</Text>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Bids Received</Text>
                </Pressable>
              </View>

              {/* Exporter's posted opportunities */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Postings</Text>
                <Pressable onPress={() => router.push('/opportunities')}>
                  <Text style={[styles.linkText, { color: theme.primary }]}>Sourcing Center</Text>
                </Pressable>
              </View>
              {opportunities.filter(o => o.exporterName === exporterProfile.companyName).length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: theme.backgroundElement }]}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>You haven't posted any opportunities yet.</Text>
                </View>
              ) : (
                opportunities.filter(o => o.exporterName === exporterProfile.companyName).map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onPress={handleViewDetails}
                  />
                ))
              )}

              {/* Recommended Manufacturers (Vardhman Knits) */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Manufacturers near Tiruppur</Text>
              </View>
              <View style={[styles.manufacturerCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                <View style={styles.manufacturerHeader}>
                  <View style={styles.mLeft}>
                    <Text style={[styles.mName, { color: theme.text }]}>{manufacturerProfile.companyName}</Text>
                    <Text style={[styles.mLoc, { color: theme.textSecondary }]}>{manufacturerProfile.factoryLocation}</Text>
                  </View>
                  <View style={[styles.verifiedBadge, { backgroundColor: `${theme.success}12` }]}>
                    <ShieldCheck size={12} color={theme.success} />
                    <Text style={[styles.verifiedText, { color: theme.success }]}>Verified</Text>
                  </View>
                </View>
                <View style={styles.mSpecs}>
                  <Text style={[styles.mSpecText, { color: theme.text }]}>
                    Capacity: <Text style={{ color: theme.primary, fontWeight: '700' }}>{manufacturerProfile.availableCapacity.toLocaleString()} pcs avail.</Text>
                  </Text>
                  <Text style={[styles.mSpecText, { color: theme.textSecondary }]}>
                    Specs: {manufacturerProfile.specialisations.slice(0, 3).join(', ')}
                  </Text>
                </View>
                <Pressable 
                  style={[styles.mContactBtn, { backgroundColor: theme.primary }]}
                  onPress={() => router.push('/messages')}
                >
                  <Text style={styles.mContactText}>Initiate Negotiation</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>

        {/* ROLE-DEPENDENT FLOATING PRIMARY ACTION BUTTON */}
        {userRole === 'exporter' && (
          <Pressable 
            style={[styles.floatingActionBtn, { backgroundColor: theme.primary }]}
            onPress={() => setShowPostOppModal(true)}
          >
            <Plus size={22} color="#ffffff" />
            <Text style={styles.floatingActionText}>Post Opportunity</Text>
          </Pressable>
        )}

        {/* POST OPPORTUNITY SLIDE-UP MODAL (FOR EXPORTER) */}
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
    position: 'relative',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.six,
    gap: Spacing.four,
  },
  welcomeSection: {
    marginTop: 6,
  },
  superTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  capacityValue: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
  },
  capacityUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  miniBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  descText: {
    fontSize: 11,
    fontWeight: '500',
  },
  inlinePanel: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  saveBtn: {
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  alertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 4,
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  orderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  orderSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  orderRight: {
    justifyContent: 'center',
  },
  orderProgress: {
    fontSize: 15,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  manufacturerCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  manufacturerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mLeft: {
    flex: 1,
  },
  mName: {
    fontSize: 16,
    fontWeight: '800',
  },
  mLoc: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  mSpecs: {
    gap: 4,
  },
  mSpecText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mContactBtn: {
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  mContactText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  floatingActionBtn: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : BottomTabInset + 16,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
  floatingActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
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
  manufacturerHeaderRow: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  mCompName: {
    fontSize: 22,
    fontWeight: '900',
  },
  mCompLoc: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  jobSectionHeader: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 12,
  },
  jobSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 12,
  },
  jobSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  jobChipsScroll: {
    paddingVertical: 4,
    gap: 8,
    marginBottom: 16,
  },
  jobChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  jobChipText: {
    fontSize: 12,
  },
  jobFeedContainer: {
    gap: 16,
    paddingBottom: BottomTabInset + 40,
  },
  emptyFeed: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyFeedText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  jobCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobExporterName: {
    fontSize: 14,
    fontWeight: '800',
  },
  jobVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  jobVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  jobDivider: {
    height: 1,
    marginVertical: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  jobQty: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  jobSpecsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  jobSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobSpecText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jobActionBtn: {
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  jobActionText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
