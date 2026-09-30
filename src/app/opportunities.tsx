import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, XCircle, Sliders } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace, GARMENT_CATEGORIES } from '@/hooks/use-marketplace';
import { OpportunityCard } from '@/components/OpportunityCard';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function OpportunitiesScreen() {
  const theme = useTheme();
  const { jobs } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);

  const openJobs = jobs.filter(j => j.status === 'OPEN');

  const filteredJobs = openJobs.filter(job => {
    const matchesSearch =
      job.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCat !== 'All' && job.category.toLowerCase() !== selectedCat.toLowerCase()) return false;
    if (filterLocation && job.location.toLowerCase() !== filterLocation.toLowerCase()) return false;

    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Search Header */}
        <View style={styles.header}>
          <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
            <Search size={16} color={theme.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search process, category, or location..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <XCircle size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: theme.backgroundElement, borderColor: showFilters ? theme.primary : theme.cardBorder }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Sliders size={16} color={showFilters ? theme.primary : theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Location Filter Box */}
        {showFilters && (
          <View style={styles.filterBox}>
            <Text style={styles.filterTitle}>Filter by Location Hub</Text>
            <View style={styles.chipRow}>
              {['Tiruppur', 'PN Road', 'Khaderpet', 'Dharapuram Road', 'College Road'].map(loc => {
                const isSelected = filterLocation === loc;
                return (
                  <TouchableOpacity
                    key={loc}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setFilterLocation(isSelected ? null : loc)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{loc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Category Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {['All', ...GARMENT_CATEGORIES.map(c => c.name)].map(catName => {
            const isSelected = selectedCat === catName;
            return (
              <TouchableOpacity
                key={catName}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => setSelectedCat(catName)}
              >
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>{catName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Feed */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredJobs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Search size={32} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Opportunities Found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search terms or selecting another category filter.
              </Text>
            </View>
          ) : (
            filteredJobs.map(job => <OpportunityCard key={job.id} job={job} />)
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBox: {
    paddingHorizontal: Spacing.four,
    marginBottom: 12,
    gap: 8,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  catScroll: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    gap: 8,
    paddingBottom: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  catChipActive: {
    backgroundColor: '#2563EB',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  emptyBox: {
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
});
