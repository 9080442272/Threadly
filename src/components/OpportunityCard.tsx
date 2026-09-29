import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { ShieldCheck, Package, MapPin, Wrench, Clock } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Opportunity } from '@/hooks/use-marketplace';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onPress: (opp: Opportunity) => void;
}

export function OpportunityCard({
  opportunity,
  onPress,
}: OpportunityCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
      {/* Exporter and Verification Header */}
      <View style={styles.cardHeader}>
        <Text style={[styles.exporterText, { color: theme.textSecondary }]}>
          {opportunity.exporterName}
        </Text>
        {opportunity.isVerified && (
          <View style={[styles.verifiedBadge, { backgroundColor: `${theme.success}12` }]}>
            <ShieldCheck size={12} color={theme.success} />
            <Text style={[styles.verifiedText, { color: theme.success }]}>Verified Exporter</Text>
          </View>
        )}
      </View>

      {/* Product Title */}
      <Text style={[styles.title, { color: theme.text }]}>{opportunity.title}</Text>

      {/* Specifications Grid */}
      <View style={styles.specGrid}>
        {/* Quantity */}
        <View style={styles.specItem}>
          <Package size={14} color={theme.textSecondary} />
          <Text style={[styles.specText, { color: theme.text }]}>
            {opportunity.quantity.toLocaleString()} pcs
          </Text>
        </View>

        {/* Location */}
        <View style={styles.specItem}>
          <MapPin size={14} color={theme.textSecondary} />
          <Text style={[styles.specText, { color: theme.text }]}>{opportunity.location}</Text>
        </View>

        {/* Operations */}
        <View style={styles.specItem}>
          <Wrench size={14} color={theme.textSecondary} />
          <Text style={[styles.specText, { color: theme.text }]} numberOfLines={1}>
            {opportunity.operations.join(' + ')}
          </Text>
        </View>

        {/* Deadline */}
        <View style={styles.specItem}>
          <Clock size={14} color={theme.textSecondary} />
          <Text style={[styles.specText, { color: theme.text }]}>{opportunity.deadlineDays} days</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />

      {/* Footer Pricing & CTA */}
      <View style={styles.cardFooter}>
        <View>
          <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Target Rate</Text>
          <Text style={[styles.priceValue, { color: theme.primary }]}>
            {opportunity.rateRange} <Text style={styles.priceUnit}>/ pc</Text>
          </Text>
        </View>

        <View style={styles.footerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View opportunity details for ${opportunity.title}`}
            style={[styles.viewBtn, { backgroundColor: theme.primary }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => onPress(opportunity)}
          >
            <Text style={styles.viewBtnText}>View Opportunity</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exporterText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 16,
    marginBottom: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  specText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '500',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
