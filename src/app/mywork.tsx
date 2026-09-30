import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Factory, Phone, MessageSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace, JobStatus, ContactStatus } from '@/hooks/use-marketplace';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type DashboardTab = 'posted' | 'contacted';

export default function MyWorkScreen() {
  const theme = useTheme();
  const { userProfile, jobs, contacts, updateJobStatus, updateContactStatus } = useMarketplace();
  const [activeTab, setActiveTab] = useState<DashboardTab>('posted');

  const myPostedJobs = jobs.filter(j => j.postedByUserId === userProfile.userId);
  const myContactedJobs = contacts.filter(c => c.interestedUserId === userProfile.userId);

  const handleStatusChange = async (jobId: string, currentStatus: JobStatus) => {
    const statuses: JobStatus[] = ['OPEN', 'IN_DISCUSSION', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % (statuses.length - 1); // Cycle through non-cancelled
    const nextStatus = statuses[nextIdx];

    await updateJobStatus(jobId, nextStatus);
    Alert.alert('Status Updated', `Job status changed to ${nextStatus}`);
  };

  const getStatusStyle = (status: JobStatus | ContactStatus) => {
    switch (status) {
      case 'OPEN':
      case 'INTERESTED':
        return { bg: '#EFF6FF', text: '#2563EB' };
      case 'IN_DISCUSSION':
      case 'CONTACTED':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return { bg: '#E0F2FE', text: '#0284C7' };
      case 'COMPLETED':
      case 'ACCEPTED':
        return { bg: '#DCFCE7', text: '#16A34A' };
      case 'CANCELLED':
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>My Work Dashboard</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Track work requirements you posted and job works you contacted
          </Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'posted' && styles.tabBtnActive]}
            onPress={() => setActiveTab('posted')}
          >
            <Text style={[styles.tabText, activeTab === 'posted' && styles.tabTextActive]}>
              Work I Posted ({myPostedJobs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'contacted' && styles.tabBtnActive]}
            onPress={() => setActiveTab('contacted')}
          >
            <Text style={[styles.tabText, activeTab === 'contacted' && styles.tabTextActive]}>
              Work I Contacted ({myContactedJobs.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* TAB 1: WORK I POSTED */}
          {activeTab === 'posted' && (
            myPostedJobs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Factory size={32} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Posted Requirements</Text>
                <Text style={styles.emptySub}>
                  When you post a job-work requirement, it will appear here so you can track its status.
                </Text>
              </View>
            ) : (
              myPostedJobs.map(job => {
                const st = getStatusStyle(job.status);
                return (
                  <View key={job.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.catTag}>
                        <Text style={styles.catTagText}>{job.category} • {job.subcategory}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.statusBadge, { backgroundColor: st.bg }]}
                        onPress={() => handleStatusChange(job.id, job.status)}
                      >
                        <Text style={[styles.statusText, { color: st.text }]}>{job.status}</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.quantityTitle}>{job.quantity.toLocaleString()} pcs</Text>
                    {job.ratePerPiece && (
                      <Text style={styles.rateText}>Target Rate: ₹{job.ratePerPiece} / pc</Text>
                    )}

                    <View style={styles.specRow}>
                      <Text style={styles.specItem}>📍 {job.location}</Text>
                      <Text style={styles.specItem}>⏱ {job.deadlineDays} days</Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.tapTip}>Tap status badge to update pipeline status</Text>
                    </View>
                  </View>
                );
              })
            )
          )}

          {/* TAB 2: WORK I CONTACTED */}
          {activeTab === 'contacted' && (
            myContactedJobs.length === 0 ? (
              <View style={styles.emptyCard}>
                <MessageSquare size={32} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Inquired Jobs Yet</Text>
                <Text style={styles.emptySub}>
                  When you discover a job on the "Find Work" feed and contact the owner, it will be saved here.
                </Text>
              </View>
            ) : (
              myContactedJobs.map(contact => {
                const st = getStatusStyle(contact.status);
                return (
                  <View key={contact.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.jobTitle}>{contact.jobTitle}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                        <Text style={[styles.statusText, { color: st.text }]}>{contact.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.companySub}>Posted by: {contact.jobPostedByCompany}</Text>
                    {contact.notes && (
                      <Text style={styles.notesBox}>"{contact.notes}"</Text>
                    )}

                    <View style={styles.cardFooter}>
                      <Text style={styles.timestampText}>
                        Contacted: {new Date(contact.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                );
              })
            )
          )}
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.four,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  catTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  quantityTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  rateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  specRow: {
    flexDirection: 'row',
    gap: 16,
  },
  specItem: {
    fontSize: 12,
    color: '#64748B',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 4,
  },
  tapTip: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  companySub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    color: '#334155',
    fontStyle: 'italic',
  },
  timestampText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
