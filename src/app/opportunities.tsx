import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, X, Sliders, XCircle, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace, Opportunity } from '@/hooks/use-marketplace';
import { OpportunityCard } from '@/components/OpportunityCard';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type TabKey = 'for-you' | 'all' | 'saved';

export default function OpportunitiesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { userRole, opportunities, applyToOpportunity, applications } = useMarketplace();
  
  // URL parameters for deep-linking apply actions
  const params = useLocalSearchParams<{ applyToId?: string; viewId?: string }>();

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Selected Filter States
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [filterQty, setFilterQty] = useState<number | null>(null);

  // Selected Opportunity Modal Detail States
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [applyOpp, setApplyOpp] = useState<Opportunity | null>(null);

  // Submit Application Form States
  const [bidRate, setBidRate] = useState('');
  const [capacityOffer, setCapacityOffer] = useState('');
  const [bidNotes, setBidNotes] = useState('');

  // Success Screen States
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSubmittedOpp, setLastSubmittedOpp] = useState<Opportunity | null>(null);
  const [lastBidRate, setLastBidRate] = useState('');
  const [lastCapacityOffer, setLastCapacityOffer] = useState('');

  // Handle URL deep links from Home screen
  useEffect(() => {
    if (params.applyToId) {
      const opp = opportunities.find(o => o.id === params.applyToId);
      if (opp) {
        setApplyOpp(opp);
        setBidRate(opp.rateRange.split('–')[0].replace(/[^0-9]/g, ''));
        setCapacityOffer(opp.quantity.toString());
      }
    }
    if (params.viewId) {
      const opp = opportunities.find(o => o.id === params.viewId);
      if (opp) setSelectedOpp(opp);
    }
  }, [params, opportunities]);

  const handleOpenApply = (opp: Opportunity) => {
    setApplyOpp(opp);
    setBidRate(opp.rateRange.split('–')[0].replace(/[^0-9]/g, ''));
    setCapacityOffer(opp.quantity.toString());
  };

  const handleSubmitApplication = async () => {
    if (!applyOpp || !bidRate || !capacityOffer) return;

    await applyToOpportunity({
      opportunityId: applyOpp.id,
      opportunityTitle: applyOpp.title,
      proposedRate: parseInt(bidRate, 10) || 90,
      capacityOffered: parseInt(capacityOffer, 10) || applyOpp.quantity,
      notes: bidNotes || 'We submit our standard proposal based on specs.',
    });

    setLastSubmittedOpp(applyOpp);
    setLastBidRate(bidRate);
    setLastCapacityOffer(capacityOffer);
    setShowSuccess(true);

    setApplyOpp(null);
    setBidRate('');
    setCapacityOffer('');
    setBidNotes('');
  };

  // Filter listings
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          opp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.exporterName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = filterLocation ? opp.location === filterLocation : true;
    const matchesQty = filterQty ? opp.quantity >= filterQty : true;
    
    const isSavedTab = activeTab === 'saved'; // Mock saved tab returning verified opportunities
    const matchesTab = isSavedTab ? opp.isVerified : true;

    return matchesSearch && matchesLocation && matchesQty && matchesTab;
  });

  const clearFilters = () => {
    setFilterLocation(null);
    setFilterQty(null);
    setShowFilters(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Search & Filter Header */}
        <View style={styles.header}>
          <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
            <Search size={15} color={theme.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search garments, hubs, or exporters..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <XCircle size={14} color={theme.textSecondary} />
              </Pressable>
            )}
          </View>

          <Pressable 
            style={[
              styles.filterBtn, 
              { backgroundColor: theme.backgroundElement, borderColor: showFilters ? theme.primary : theme.cardBorder }
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Sliders size={15} color={showFilters ? theme.primary : theme.textSecondary} />
          </Pressable>
        </View>

        {/* Filters Drawer Overlay */}
        {showFilters && (
          <View style={[styles.filtersPanel, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
            <Text style={[styles.filterTitle, { color: theme.text }]}>Filters</Text>
            
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Hub / Location</Text>
            <View style={styles.chipRow}>
              {['Tiruppur', 'Surat', 'Ludhiana', 'Noida'].map((loc) => {
                const isSelected = filterLocation === loc;
                return (
                  <Pressable
                    key={loc}
                    style={[styles.chip, isSelected && { backgroundColor: `${theme.primary}12`, borderColor: theme.primary }]}
                    onPress={() => setFilterLocation(isSelected ? null : loc)}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? theme.primary : theme.textSecondary }]}>
                      {loc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Minimum Quantity</Text>
            <View style={styles.chipRow}>
              {[5000, 15000, 25000].map((qty) => {
                const isSelected = filterQty === qty;
                return (
                  <Pressable
                    key={qty}
                    style={[styles.chip, isSelected && { backgroundColor: `${theme.primary}12`, borderColor: theme.primary }]}
                    onPress={() => setFilterQty(isSelected ? null : qty)}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? theme.primary : theme.textSecondary }]}>
                      {qty.toLocaleString()}+ pcs
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.filterActions}>
              <Pressable style={[styles.clearBtn, { borderColor: theme.cardBorder }]} onPress={clearFilters}>
                <Text style={[styles.clearBtnText, { color: theme.text }]}>Clear</Text>
              </Pressable>
              <Pressable style={[styles.applyFiltersBtn, { backgroundColor: theme.primary }]} onPress={() => setShowFilters(false)}>
                <Text style={styles.applyFiltersBtnText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Bottom Tab Selectors */}
        <View style={styles.tabContainer}>
          {(['for-you', 'all', 'saved'] as TabKey[]).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <Pressable
                key={tab}
                style={[styles.tabButton, isSelected && { borderBottomColor: theme.primary }]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText, 
                  { color: isSelected ? theme.text : theme.textSecondary },
                  isSelected && styles.selectedTabText
                ]}>
                  {tab === 'for-you' ? 'For You' : tab === 'all' ? 'All Contracts' : 'Saved'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Opportunities List */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredOpportunities.length === 0 ? (
            <View style={styles.emptyState}>
              <Search size={30} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No opportunities match your search parameters.
              </Text>
            </View>
          ) : (
            filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onPress={setSelectedOpp}
              />
            ))
          )}
        </ScrollView>

        {/* OPPORTUNITY DETAIL VIEW MODAL */}
        <Modal
          visible={selectedOpp !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedOpp(null)}
        >
          {selectedOpp && (
            <SafeAreaView style={[styles.detailModal, { backgroundColor: theme.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Opportunity Specs</Text>
                <Pressable onPress={() => setSelectedOpp(null)}>
                  <XCircle size={24} color={theme.textSecondary} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.detailCard}>
                  <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedOpp.title}</Text>
                  
                  <View style={styles.detailExporterRow}>
                    <Text style={[styles.detailExporter, { color: theme.textSecondary }]}>{selectedOpp.exporterName}</Text>
                    {selectedOpp.isVerified && (
                      <View style={[styles.verifiedBadge, { backgroundColor: `${theme.success}12` }]}>
                        <ShieldCheck size={12} color={theme.success} />
                        <Text style={[styles.verifiedText, { color: theme.success }]}>Verified Exporter</Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

                  {/* Info table */}
                  <View style={styles.infoTable}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableLabel, { color: theme.textSecondary }]}>Required Qty</Text>
                      <Text style={[styles.tableVal, { color: theme.text }]}>{selectedOpp.quantity.toLocaleString()} units</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableLabel, { color: theme.textSecondary }]}>Hub / Location</Text>
                      <Text style={[styles.tableVal, { color: theme.text }]}>{selectedOpp.location}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableLabel, { color: theme.textSecondary }]}>Operations</Text>
                      <Text style={[styles.tableVal, { color: theme.text }]}>{selectedOpp.operations.join(', ')}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableLabel, { color: theme.textSecondary }]}>Deadline</Text>
                      <Text style={[styles.tableVal, { color: theme.text }]}>{selectedOpp.deadlineDays} calendar days</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableLabel, { color: theme.textSecondary }]}>Target Rate</Text>
                      <Text style={[styles.tableVal, { color: theme.primary, fontWeight: '700' }]}>{selectedOpp.rateRange} / pc</Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

                  {/* Requirements details */}
                  <Text style={[styles.reqTitle, { color: theme.text }]}>Detailed Requirements</Text>
                  <Text style={[styles.reqBody, { color: theme.textSecondary }]}>{selectedOpp.requirements}</Text>
                </View>

                {userRole === 'manufacturer' && (
                  <Pressable 
                    style={[styles.applyActionBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      const opp = selectedOpp;
                      setSelectedOpp(null);
                      handleOpenApply(opp);
                    }}
                  >
                    <Text style={styles.applyActionBtnText}>Apply for Opportunity</Text>
                  </Pressable>
                )}
              </ScrollView>
            </SafeAreaView>
          )}
        </Modal>

        {/* APPLY / BID SUBMISSION MODAL */}
        <Modal
          visible={applyOpp !== null}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setApplyOpp(null)}
        >
          {applyOpp && (
            <View style={styles.overlayBg}>
              <View style={[styles.dialogCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                <View style={styles.dialogHeader}>
                  <Text style={[styles.dialogTitle, { color: theme.text }]}>Submit Proposal</Text>
                  <Pressable onPress={() => setApplyOpp(null)}>
                    <X size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>
                <Text style={[styles.dialogSubtitle, { color: theme.textSecondary }]}>
                  {applyOpp.title} ({applyOpp.exporterName})
                </Text>

                <View style={styles.dialogForm}>
                  <View style={styles.dialogInputItem}>
                    <Text style={[styles.dialogInputLabel, { color: theme.textSecondary }]}>Your Bid Rate (₹ per piece) *</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={bidRate}
                      onChangeText={setBidRate}
                      style={[styles.dialogInput, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.background }]}
                    />
                  </View>

                  <View style={styles.dialogInputItem}>
                    <Text style={[styles.dialogInputLabel, { color: theme.textSecondary }]}>Capacity Offered (pcs) *</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={capacityOffer}
                      onChangeText={setCapacityOffer}
                      style={[styles.dialogInput, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.background }]}
                    />
                  </View>

                  <View style={styles.dialogInputItem}>
                    <Text style={[styles.dialogInputLabel, { color: theme.textSecondary }]}>Proposal Details / Notes</Text>
                    <TextInput
                      multiline
                      numberOfLines={3}
                      value={bidNotes}
                      onChangeText={setBidNotes}
                      placeholder="Specializations, trim resources, machinery speed..."
                      placeholderTextColor={theme.textSecondary}
                      style={[styles.dialogInput, styles.dialogMultiline, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.background }]}
                    />
                  </View>

                  <Pressable style={[styles.dialogSubmitBtn, { backgroundColor: theme.primary }]} onPress={handleSubmitApplication}>
                    <Text style={styles.dialogSubmitBtnText}>Submit Bid Sourcing Proposal</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </Modal>

        {/* SUCCESS SCREEN MODAL */}
        <Modal
          visible={showSuccess}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setShowSuccess(false)}
        >
          <SafeAreaView style={[styles.successContainer, { backgroundColor: theme.background }]}>
            <View style={styles.successContent}>
              
              {/* Glowing Check Icon */}
              <View style={[styles.successBadgeOutline, { borderColor: `${theme.success}30` }]}>
                <View style={[styles.successBadgeInner, { backgroundColor: `${theme.success}15` }]}>
                  <ShieldCheck size={52} color={theme.success} />
                </View>
              </View>

              <Text style={[styles.successTitle, { color: theme.text }]}>
                Proposal Submitted!
              </Text>
              <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
                Your sourcing bid has been sent to {lastSubmittedOpp?.exporterName || 'the exporter'} for review.
              </Text>

              {/* Proposal Specs Summary */}
              <View style={[styles.successSpecsCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                <Text style={[styles.successSpecsHeader, { color: theme.textSecondary }]}>
                  PROPOSAL SUMMARY
                </Text>
                
                <View style={styles.successSpecRow}>
                  <Text style={[styles.successSpecLabel, { color: theme.textSecondary }]}>Contract</Text>
                  <Text style={[styles.successSpecValue, { color: theme.text }]} numberOfLines={1}>
                    {lastSubmittedOpp?.title}
                  </Text>
                </View>

                <View style={styles.successSpecRow}>
                  <Text style={[styles.successSpecLabel, { color: theme.textSecondary }]}>Offered Qty</Text>
                  <Text style={[styles.successSpecValue, { color: theme.text }]}>
                    {parseInt(lastCapacityOffer, 10).toLocaleString()} units
                  </Text>
                </View>

                <View style={styles.successSpecRow}>
                  <Text style={[styles.successSpecLabel, { color: theme.textSecondary }]}>Bid Rate</Text>
                  <Text style={[styles.successSpecValue, { color: theme.primary, fontWeight: '700' }]}>
                    ₹ {lastBidRate} / pc
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.successActions}>
                <Pressable
                  style={[styles.successPrimaryBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setShowSuccess(false);
                    router.push('/mywork');
                  }}
                >
                  <Text style={styles.successPrimaryBtnText}>Track in My Work</Text>
                </Pressable>

                <Pressable
                  style={[styles.successSecondaryBtn, { borderColor: theme.cardBorder }]}
                  onPress={() => setShowSuccess(false)}
                >
                  <Text style={[styles.successSecondaryBtnText, { color: theme.text }]}>
                    Back to Marketplace
                  </Text>
                </Pressable>
              </View>

            </View>
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
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: 8,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersPanel: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: Spacing.four,
    marginBottom: 8,
    gap: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#33415520',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  clearBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  applyFiltersBtn: {
    flex: 2,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyFiltersBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#33415515',
    marginHorizontal: Spacing.four,
    marginBottom: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectedTabText: {
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  detailModal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#33415515',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalContent: {
    padding: 16,
    gap: 20,
  },
  detailCard: {
    gap: 12,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  detailExporterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailExporter: {
    fontSize: 13,
    fontWeight: '700',
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
  divider: {
    height: 1,
  },
  infoTable: {
    gap: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tableVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  reqTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  reqBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  applyActionBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  applyActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  dialogSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  dialogForm: {
    gap: 12,
    marginTop: 4,
  },
  dialogInputItem: {
    gap: 6,
  },
  dialogInputLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  dialogInput: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  dialogMultiline: {
    height: 60,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  dialogSubmitBtn: {
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dialogSubmitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    width: '90%',
    maxWidth: 450,
    alignItems: 'center',
    padding: 24,
  },
  successBadgeOutline: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successBadgeInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  successSpecsCard: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 32,
  },
  successSpecsHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  successSpecRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successSpecLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  successSpecValue: {
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '65%',
  },
  successActions: {
    width: '100%',
    gap: 12,
  },
  successPrimaryBtn: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  successSecondaryBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
