import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, FileText, Package, ArrowRightCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace, Application, Order } from '@/hooks/use-marketplace';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { GarmentScanner } from '@/components/GarmentScanner';

type MainTab = 'applications' | 'orders';
type AppStatusFilter = Application['status'] | 'all';
type OrderStatusFilter = Order['status'] | 'all';

export default function MyWorkScreen() {
  const theme = useTheme();
  const { userRole, applications, orders, updateApplicationStatus, updateOrderProgress } = useMarketplace();

  const [activeTab, setActiveTab] = useState<MainTab>('applications');
  const [appFilter, setAppFilter] = useState<AppStatusFilter>('all');
  const [orderFilter, setOrderFilter] = useState<OrderStatusFilter>('all');
  const [showScanner, setShowScanner] = useState(false);

  const handleScanCode = async (code: string) => {
    setShowScanner(false);
    const targetOrder = orders.find(o => o.id === code);
    if (targetOrder) {
      let nextProgress = targetOrder.progress + 20;
      if (nextProgress > 100) nextProgress = 100;
      
      let nextStatus: Order['status'] = 'production';
      if (nextProgress >= 100) nextStatus = 'completed';
      else if (nextProgress >= 90) nextStatus = 'ready';
      else if (nextProgress >= 70) nextStatus = 'quality-check';

      await updateOrderProgress(targetOrder.id, nextProgress, nextStatus);
      alert(`✅ Scanned Garment Slip for "${targetOrder.opportunityTitle}"!\nProgress updated to ${nextProgress}% (${nextStatus.replace('-', ' ')}).`);
    } else {
      alert(`⚠️ Code Scanned: "${code}".\nNo matching active production order found.`);
    }
  };

  // Filter applications
  const filteredApps = applications.filter((app) => {
    if (appFilter === 'all') return true;
    return app.status === appFilter;
  });

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'all') return true;
    return order.status === orderFilter;
  });

  const getStatusColor = (status: Application['status'] | Order['status']) => {
    switch (status) {
      case 'accepted':
      case 'ready':
      case 'completed':
        return theme.success;
      case 'shortlisted':
      case 'negotiation':
      case 'production':
      case 'quality-check':
        return theme.focus;
      case 'submitted':
      case 'upcoming':
        return theme.primary;
      case 'rejected':
        return theme.timer;
      default:
        return theme.textSecondary;
    }
  };

  const handleUpdateProgress = async (orderId: string, currentProgress: number) => {
    let nextProgress = currentProgress + 10;
    if (nextProgress > 100) nextProgress = 0;
    
    let nextStatus: Order['status'] = 'production';
    if (nextProgress === 0) nextStatus = 'upcoming';
    else if (nextProgress < 70) nextStatus = 'production';
    else if (nextProgress < 90) nextStatus = 'quality-check';
    else if (nextProgress < 100) nextStatus = 'ready';
    else nextStatus = 'completed';

    await updateOrderProgress(orderId, nextProgress, nextStatus);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Page Title */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.text }]}>My Work</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Monitor active contracts and production pipelines
              </Text>
            </View>
            <Pressable 
              style={[styles.scanIconBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}
              onPress={() => setShowScanner(true)}
            >
              <QrCode size={15} color={theme.primary} />
              <Text style={[styles.scanIconText, { color: theme.primary }]}>Scan Slip</Text>
            </Pressable>
          </View>
        </View>

        {/* Core Segmented Control (Applications vs Orders) */}
        <View style={[styles.segmentedBg, { backgroundColor: theme.backgroundElement }]}>
          <Pressable
            style={[styles.segButton, activeTab === 'applications' && { backgroundColor: theme.backgroundSelected }]}
            onPress={() => setActiveTab('applications')}
          >
            <Text style={[styles.segText, { color: activeTab === 'applications' ? theme.text : theme.textSecondary, fontWeight: activeTab === 'applications' ? '800' : '600' }]}>
              Bids & Proposals ({applications.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segButton, activeTab === 'orders' && { backgroundColor: theme.backgroundSelected }]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.segText, { color: activeTab === 'orders' ? theme.text : theme.textSecondary, fontWeight: activeTab === 'orders' ? '800' : '600' }]}>
              Production Orders ({orders.length})
            </Text>
          </Pressable>
        </View>

        {/* Tab Filters */}
        {activeTab === 'applications' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['all', 'submitted', 'shortlisted', 'negotiation', 'accepted', 'rejected'] as AppStatusFilter[]).map((f) => {
              const isSelected = appFilter === f;
              return (
                <Pressable
                  key={f}
                  style={[styles.filterChip, { backgroundColor: theme.backgroundElement }, isSelected && { backgroundColor: theme.backgroundSelected }]}
                  onPress={() => setAppFilter(f)}
                >
                  <Text style={[styles.filterChipText, { color: isSelected ? theme.text : theme.textSecondary }]}>
                    {f === 'all' ? 'All Bids' : f}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['all', 'upcoming', 'production', 'quality-check', 'ready', 'completed'] as OrderStatusFilter[]).map((f) => {
              const isSelected = orderFilter === f;
              return (
                <Pressable
                  key={f}
                  style={[styles.filterChip, { backgroundColor: theme.backgroundElement }, isSelected && { backgroundColor: theme.backgroundSelected }]}
                  onPress={() => setOrderFilter(f)}
                >
                  <Text style={[styles.filterChipText, { color: isSelected ? theme.text : theme.textSecondary }]}>
                    {f === 'all' ? 'All Orders' : f.replace('-', ' ')}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Main List Scroll */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* APPLICATIONS PIPELINE */}
          {activeTab === 'applications' && (
            filteredApps.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={28} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No matching applications.</Text>
              </View>
            ) : (
              filteredApps.map((app) => {
                const statusColor = getStatusColor(app.status);
                return (
                  <View key={app.id} style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>{app.opportunityTitle}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}12` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{app.status}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.cardSpecs}>
                      <Text style={[styles.specText, { color: theme.textSecondary }]}>
                        Bid Rate: <Text style={{ color: theme.text, fontWeight: '700' }}>₹{app.proposedRate}/pc</Text>
                      </Text>
                      <Text style={[styles.specText, { color: theme.textSecondary }]}>
                        Offered Qty: <Text style={{ color: theme.text, fontWeight: '700' }}>{app.capacityOffered.toLocaleString()} pcs</Text>
                      </Text>
                    </View>
                    
                    {app.notes && (
                      <Text style={[styles.notesText, { color: theme.textSecondary, backgroundColor: theme.background }]}>
                        "{app.notes}"
                      </Text>
                    )}

                    {/* Exporter role based decision actions (to test shortlisting/acceptance flows) */}
                    {userRole === 'exporter' && app.status !== 'accepted' && app.status !== 'rejected' && (
                      <View style={[styles.actionRow, { borderTopColor: theme.cardBorder }]}>
                        {app.status === 'submitted' && (
                          <Pressable
                            style={[styles.actionBtn, { borderColor: theme.cardBorder }]}
                            onPress={() => updateApplicationStatus(app.id, 'shortlisted')}
                          >
                            <Text style={[styles.actionBtnText, { color: theme.text }]}>Shortlist</Text>
                          </Pressable>
                        )}
                        {(app.status === 'submitted' || app.status === 'shortlisted') && (
                          <Pressable
                            style={[styles.actionBtn, { borderColor: theme.cardBorder }]}
                            onPress={() => updateApplicationStatus(app.id, 'negotiation')}
                          >
                            <Text style={[styles.actionBtnText, { color: theme.text }]}>Negotiate</Text>
                          </Pressable>
                        )}
                        <Pressable
                          style={[styles.actionBtn, { backgroundColor: theme.success }]}
                          onPress={() => updateApplicationStatus(app.id, 'accepted')}
                        >
                          <Text style={styles.actionBtnTextWhite}>Accept Bid</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.actionBtn, { backgroundColor: theme.timer }]}
                          onPress={() => updateApplicationStatus(app.id, 'rejected')}
                        >
                          <Text style={styles.actionBtnTextWhite}>Reject</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })
            )
          )}

          {/* ORDERS TRACKING PIPELINE */}
          {activeTab === 'orders' && (
            filteredOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Package size={28} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No active orders.</Text>
              </View>
            ) : (
              filteredOrders.map((order) => {
                const statusColor = getStatusColor(order.status);
                return (
                  <View key={order.id} style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>{order.opportunityTitle}</Text>
                        <Text style={[styles.clientLabel, { color: theme.textSecondary }]}>
                          {userRole === 'manufacturer' ? `Exporter: ${order.exporterName}` : `Manufacturer: ${order.manufacturerName}`}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}12` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{order.status.replace('-', ' ')}</Text>
                      </View>
                    </View>

                    <View style={styles.cardSpecs}>
                      <Text style={[styles.specText, { color: theme.textSecondary }]}>
                        Contract Qty: <Text style={{ color: theme.text, fontWeight: '700' }}>{order.quantity.toLocaleString()} pcs</Text>
                      </Text>
                      <Text style={[styles.specText, { color: theme.textSecondary }]}>
                        Rate: <Text style={{ color: theme.text, fontWeight: '700' }}>₹{order.rate}/pc</Text>
                      </Text>
                      <Text style={[styles.specText, { color: theme.textSecondary }]}>
                        Delivery: <Text style={{ color: theme.text, fontWeight: '700' }}>{order.endDate}</Text>
                      </Text>
                    </View>

                    {/* Progress slider tracking */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressTextRow}>
                        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Production Progress</Text>
                        <Text style={[styles.progressVal, { color: theme.text }]}>{order.progress}%</Text>
                      </View>
                      <View style={[styles.progressBarBg, { backgroundColor: theme.backgroundSelected }]}>
                        <View style={[styles.progressBarFill, { backgroundColor: statusColor, width: `${order.progress}%` }]} />
                      </View>
                    </View>

                    {/* Manufacturer Action: Update order tracking progress */}
                    {userRole === 'manufacturer' && order.status !== 'completed' && (
                      <Pressable
                        style={[styles.updateProgressBtn, { backgroundColor: theme.primary }]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => handleUpdateProgress(order.id, order.progress)}
                      >
                        <ArrowRightCircle size={14} color="#ffffff" />
                        <Text style={styles.updateProgressText}>Log Production Step (+10%)</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })
            )
          )}
        </ScrollView>

        {/* Live / Simulated QR Scanner Modal */}
        <Modal
          visible={showScanner}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowScanner(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <GarmentScanner 
              onScan={handleScanCode} 
              onClose={() => setShowScanner(false)} 
            />
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
  segmentedBg: {
    flexDirection: 'row',
    marginHorizontal: Spacing.four,
    borderRadius: 14,
    padding: 3,
    marginBottom: 12,
  },
  segButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  segText: {
    fontSize: 12,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.four,
    marginBottom: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  clientLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  specText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesText: {
    padding: 10,
    borderRadius: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 6,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnTextWhite: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  progressSection: {
    gap: 6,
    marginTop: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  updateProgressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: 10,
    marginTop: 6,
  },
  updateProgressText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  scanIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  scanIconText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
