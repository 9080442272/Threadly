import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Factory, Search, PlusCircle, CheckCircle2, ChevronRight, Sparkles, Building2, MapPin } from 'lucide-react-native';
import { useMarketplace } from '../hooks/use-marketplace';

interface ActionSelectionProps {
  onSelectPostWork: () => void;
  onSelectFindWork: () => void;
}

export function ActionSelection({ onSelectPostWork, onSelectFindWork }: ActionSelectionProps) {
  const { userProfile, jobs } = useMarketplace();
  const openJobsCount = jobs.filter(j => j.status === 'OPEN').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeSubtitle}>TIRUPPUR GARMENT JOB-WORK NETWORK</Text>
          <Text style={styles.companyTitle}>{userProfile.companyName || 'Garment Unit'}</Text>
          <View style={styles.locationBadge}>
            <MapPin size={13} color="#64748B" />
            <Text style={styles.locationText}>{userProfile.businessLocation || 'Tiruppur, TN'}</Text>
          </View>
        </View>
        <View style={styles.verifiedTag}>
          <CheckCircle2 size={14} color="#16A34A" />
          <Text style={styles.verifiedText}>Verified Unit</Text>
        </View>
      </View>

      {/* Main Question Heading */}
      <View style={styles.promptSection}>
        <Text style={styles.promptHeading}>What do you want to do today?</Text>
        <Text style={styles.promptSub}>Choose an action below. You can change this anytime.</Text>
      </View>

      {/* Action Option 1: POST WORK */}
      <TouchableOpacity
        style={styles.actionCardPrimary}
        activeOpacity={0.88}
        onPress={onSelectPostWork}
      >
        <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
          <Factory size={28} color="#2563EB" />
        </View>

        <View style={styles.actionTextContainer}>
          <View style={styles.tagRow}>
            <Text style={styles.actionTagPrimary}>I HAVE WORK</Text>
          </View>
          <Text style={styles.actionTitlePrimary}>Post Work</Text>
          <Text style={styles.actionDescPrimary}>
            I have semi-finished garment pieces & need a job-work unit for stitching, ironing, buttoning, printing, etc.
          </Text>
        </View>

        <View style={styles.actionFooterPrimary}>
          <Text style={styles.actionBtnTextPrimary}>Post Requirement Now</Text>
          <ChevronRight size={18} color="#2563EB" />
        </View>
      </TouchableOpacity>

      {/* Action Option 2: FIND WORK */}
      <TouchableOpacity
        style={styles.actionCardSecondary}
        activeOpacity={0.88}
        onPress={onSelectFindWork}
      >
        <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
          <Search size={28} color="#16A34A" />
        </View>

        <View style={styles.actionTextContainer}>
          <View style={styles.tagRow}>
            <Text style={styles.actionTagSecondary}>{openJobsCount} OPEN JOBS NEARBY</Text>
          </View>
          <Text style={styles.actionTitleSecondary}>Find Work</Text>
          <Text style={styles.actionDescSecondary}>
            My unit has available capacity & machines ready to take job-work orders from other Tiruppur garment units.
          </Text>
        </View>

        <View style={styles.actionFooterSecondary}>
          <Text style={styles.actionBtnTextSecondary}>Browse Job Work Feed</Text>
          <ChevronRight size={18} color="#16A34A" />
        </View>
      </TouchableOpacity>

      {/* Quick Market Overview Footer */}
      <View style={styles.infoBanner}>
        <Sparkles size={18} color="#0EA5E9" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Direct Business Connection</Text>
          <Text style={styles.infoText}>
            Threadly connects Tiruppur garment companies directly via Call or WhatsApp. No middleman commissions or delays.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  welcomeSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  companyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  promptSection: {
    marginBottom: 16,
  },
  promptHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  promptSub: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  actionCardPrimary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2563EB',
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  actionCardSecondary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#16A34A',
    marginBottom: 20,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  actionTextContainer: {
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  actionTagPrimary: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.6,
  },
  actionTagSecondary: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.6,
  },
  actionTitlePrimary: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  actionTitleSecondary: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  actionDescPrimary: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  actionDescSecondary: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  actionFooterPrimary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtnTextPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  actionFooterSecondary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtnTextSecondary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#0284C7',
    lineHeight: 17,
  },
});
