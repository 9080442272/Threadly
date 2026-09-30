import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import {
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  X,
  Share2,
  Calendar,
  Building2,
  Package,
} from 'lucide-react-native';
import { JobWork, useMarketplace } from '../hooks/use-marketplace';

interface OpportunityCardProps {
  job: JobWork;
  onApplySuccess?: () => void;
}

export function OpportunityCard({ job, onApplySuccess }: OpportunityCardProps) {
  const { contactJobOwner, userProfile } = useMarketplace();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [hasContacted, setHasContacted] = useState(false);

  // Format posted date cleanly
  const formattedDate = new Date(job.postedDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  const handleCall = async () => {
    await contactJobOwner(job.id, 'Initiated Phone Call');
    setHasContacted(true);

    const phoneUrl = `tel:${job.mobile}`;
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Contact Phone', `Company Mobile: ${job.mobile}`);
    }
  };

  const handleWhatsApp = async () => {
    await contactJobOwner(job.id, 'Initiated WhatsApp Inquiry');
    setHasContacted(true);

    const message = `Hi ${job.companyName}, I saw your job-work requirement for ${job.category} (${job.subcategory}) - ${job.quantity.toLocaleString()} pcs on Threadly. I am interested in taking this work. Let's discuss!`;
    const cleanPhone = job.mobile.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(waUrl);
    if (supported) {
      await Linking.openURL(waUrl);
    } else {
      Alert.alert('WhatsApp Contact', `Mobile: +91 ${job.mobile}\nMessage copied to clipboard!`);
    }
  };

  return (
    <>
      {/* Job Card Listing */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => setDetailsVisible(true)}
      >
        {/* Card Header: Category Badge & Rate */}
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{job.category.toUpperCase()}</Text>
            <Text style={styles.subCategoryText}>• {job.subcategory}</Text>
          </View>
          {job.ratePerPiece && (
            <View style={styles.rateContainer}>
              <Text style={styles.rateValue}>₹{job.ratePerPiece}</Text>
              <Text style={styles.rateUnit}>/ pc</Text>
            </View>
          )}
        </View>

        {/* Quantity Title */}
        <View style={styles.titleSection}>
          <Text style={styles.quantityText}>{job.quantity.toLocaleString()} pcs</Text>
          <Text style={styles.companyName}>
            {job.companyName}
            {job.isVerifiedUnit && (
              <Text style={styles.verifiedInline}> ✓ Verified Unit</Text>
            )}
          </Text>
        </View>

        {/* Specs Row */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <MapPin size={14} color="#64748B" />
            <Text style={styles.specText}>{job.location}</Text>
          </View>

          <View style={styles.specItem}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.specText}>{job.deadlineDays} days deadline</Text>
          </View>
        </View>

        {/* Description Snippet */}
        {job.description && (
          <Text style={styles.descriptionSnippet} numberOfLines={2}>
            {job.description}
          </Text>
        )}

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.postedTime}>Posted {formattedDate}</Text>
          <TouchableOpacity style={styles.viewBtn} onPress={() => setDetailsVisible(true)}>
            <Text style={styles.viewBtnText}>View Requirement →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* SCREEN 6: JOB DETAILS MODAL */}
      <Modal visible={detailsVisible} animationType="slide" transparent={false} onRequestClose={() => setDetailsVisible(false)}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setDetailsVisible(false)}>
              <X size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Job Work Details</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Category & Verified Tag */}
            <View style={styles.detailCategoryRow}>
              <View style={styles.categoryBadgeLarge}>
                <Text style={styles.categoryTextLarge}>{job.category} — {job.subcategory}</Text>
              </View>
              {job.isVerifiedUnit && (
                <View style={styles.verifiedBadgeLarge}>
                  <CheckCircle2 size={14} color="#16A34A" />
                  <Text style={styles.verifiedTextLarge}>Verified Unit</Text>
                </View>
              )}
            </View>

            {/* Key Metrics Header Box */}
            <View style={styles.metricsBox}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>TOTAL QUANTITY</Text>
                <Text style={styles.metricValuePrimary}>{job.quantity.toLocaleString()} pcs</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>TARGET RATE</Text>
                <Text style={styles.metricValueSecondary}>
                  {job.ratePerPiece ? `₹${job.ratePerPiece} / pc` : 'Negotiable'}
                </Text>
              </View>
            </View>

            {/* Timeline & Location */}
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Calendar size={18} color="#2563EB" />
                <View>
                  <Text style={styles.infoBoxLabel}>Deadline</Text>
                  <Text style={styles.infoBoxValue}>{job.deadlineDays} Days</Text>
                </View>
              </View>

              <View style={styles.infoBox}>
                <MapPin size={18} color="#2563EB" />
                <View>
                  <Text style={styles.infoBoxLabel}>Location</Text>
                  <Text style={styles.infoBoxValue}>{job.location}</Text>
                </View>
              </View>
            </View>

            {/* Work Description */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Work Requirement Specifications</Text>
              <Text style={styles.detailDescriptionText}>{job.description}</Text>
            </View>

            {/* Sample Images if any */}
            {job.images && job.images.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Sample Garment Photo</Text>
                <Image source={{ uri: job.images[0] }} style={styles.detailSampleImage} resizeMode="cover" />
              </View>
            )}

            {/* Company Info Box (Revealed on Details Screen per Rule 5) */}
            <View style={styles.companyCard}>
              <Building2 size={24} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={styles.companyCardTitle}>{job.companyName}</Text>
                <Text style={styles.companyCardSub}>Garment Unit • {job.location}</Text>
                <Text style={styles.companyCardMobile}>📱 +91 {job.mobile}</Text>
              </View>
            </View>

            {hasContacted && (
              <View style={styles.contactedNotice}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.contactedNoticeText}>Contact details logged in "My Work" dashboard.</Text>
              </View>
            )}

            {/* Direct Business Connection Actions (Call & WhatsApp) */}
            <View style={styles.ctaSection}>
              <Text style={styles.ctaHeading}>Connect Directly with Unit Owner</Text>

              <View style={styles.ctaBtnRow}>
                <TouchableOpacity style={styles.callBtn} activeOpacity={0.88} onPress={handleCall}>
                  <Phone size={20} color="#FFFFFF" />
                  <Text style={styles.callBtnText}>CALL NOW</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.waBtn} activeOpacity={0.88} onPress={handleWhatsApp}>
                  <MessageSquare size={20} color="#FFFFFF" />
                  <Text style={styles.waBtnText}>WHATSAPP</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  subCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
  },
  rateUnit: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 2,
  },
  titleSection: {
    marginBottom: 10,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  companyName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  verifiedInline: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 11,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  descriptionSnippet: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  postedTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  /* MODAL STYLES */
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  detailCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadgeLarge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryTextLarge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  verifiedBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedTextLarge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 14,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricValuePrimary: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricValueSecondary: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16A34A',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
  },
  infoBoxLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  infoBoxValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  detailDescriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailSampleImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  companyCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  companyCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E40AF',
  },
  companyCardSub: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  companyCardMobile: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
    marginTop: 4,
  },
  contactedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  contactedNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  ctaSection: {
    marginTop: 10,
  },
  ctaHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  waBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  waBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
