import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Bell,
  Search,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace, GARMENT_CATEGORIES } from '@/hooks/use-marketplace';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { ActionSelection } from '@/components/ActionSelection';
import { PostWorkModal } from '@/components/PostWorkModal';
import { OpportunityCard } from '@/components/OpportunityCard';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const {
    userProfile,
    hasCompletedOnboarding,
    currentAction,
    selectAction,
    jobs,
  } = useMarketplace();

  const [showPostModal, setShowPostModal] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Search & Filter state for Find Work Feed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // STEP A: If onboarding is not completed, show Onboarding Flow
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={() => {}} />;
  }

  // Filter open jobs
  const openJobs = jobs.filter(job => job.status === 'OPEN');

  const filteredJobs = openJobs.filter(job => {
    // Search match
    const matchesSearch =
      job.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category match
    if (selectedCategory === 'All') return true;
    return job.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // STEP B: If action is not chosen yet, show Action Selection screen
  if (!currentAction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.topBar}>
            <Text style={[styles.logoText, { color: theme.primary }]}>THREADS</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={[styles.bellBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}
              onPress={() => router.push('/messages')}
            >
              <Bell size={16} color={theme.primary} />
            </Pressable>
          </View>

          <ActionSelection
            onSelectPostWork={() => {
              selectAction('POST_WORK');
              setShowPostModal(true);
            }}
            onSelectFindWork={() => selectAction('FIND_WORK')}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.logoText, { color: theme.primary }]}>THREADS</Text>
            <TouchableOpacity style={styles.actionBadge} onPress={() => selectAction(null)}>
              <Text style={styles.actionBadgeText}>
                {currentAction === 'POST_WORK' ? 'MODE: POST WORK 🏭' : 'MODE: FIND WORK 🧵'}
              </Text>
              <RefreshCw size={10} color="#2563EB" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.switchActionBtn}
              onPress={() => selectAction(null)}
            >
              <Text style={styles.switchActionText}>Switch Action</Text>
            </TouchableOpacity>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={[styles.bellBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}
              onPress={() => router.push('/messages')}
            >
              <Bell size={16} color={theme.primary} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* FIND WORK FEED */}
          {currentAction === 'FIND_WORK' && (
            <>
              <View style={styles.feedHeadingRow}>
                <View>
                  <Text style={[styles.feedTitle, { color: theme.text }]}>Job Work Opportunities</Text>
                  <Text style={[styles.feedSub, { color: theme.textSecondary }]}>
                    {openJobs.length} active job requirements in Tiruppur
                  </Text>
                </View>
              </View>

              {/* Search Box */}
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
                  <Pressable onPress={() => setSearchQuery('')}>
                    <XCircle size={16} color={theme.textSecondary} />
                  </Pressable>
                )}
              </View>

              {/* Category Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                {['All', ...GARMENT_CATEGORIES.map(c => c.name)].map((catName) => {
                  const isSelected = selectedCategory === catName;
                  return (
                    <TouchableOpacity
                      key={catName}
                      style={[
                        styles.chip,
                        { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
                        isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
                      ]}
                      onPress={() => setSelectedCategory(catName)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : theme.textSecondary, fontWeight: isSelected ? '700' : '600' }
                        ]}
                      >
                        {catName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Feed List */}
              <View style={styles.feedList}>
                {filteredJobs.length === 0 ? (
                  <View style={[styles.emptyBox, { backgroundColor: theme.backgroundElement }]}>
                    <Search size={32} color={theme.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No Jobs Found</Text>
                    <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                      Try adjusting your search terms or category filter.
                    </Text>
                  </View>
                ) : (
                  filteredJobs.map(job => (
                    <OpportunityCard key={job.id} job={job} />
                  ))
                )}
              </View>
            </>
          )}

          {/* POST WORK DASHBOARD SUMMARY */}
          {currentAction === 'POST_WORK' && (
            <>
              <View style={styles.postWorkHeader}>
                <Text style={[styles.feedTitle, { color: theme.text }]}>Work You Posted</Text>
                <Text style={[styles.feedSub, { color: theme.textSecondary }]}>
                  Manage your active garment job-work requirements
                </Text>
              </View>

              <TouchableOpacity
                style={styles.bigPostBtn}
                activeOpacity={0.88}
                onPress={() => setShowPostModal(true)}
              >
                <Plus size={24} color="#FFFFFF" />
                <Text style={styles.bigPostBtnText}>POST NEW JOB WORK</Text>
              </TouchableOpacity>

              {/* List of user's posted jobs */}
              <View style={styles.feedList}>
                {jobs.filter(j => j.postedByUserId === userProfile.userId).length === 0 ? (
                  <View style={[styles.emptyBox, { backgroundColor: theme.backgroundElement }]}>
                    <Plus size={32} color={theme.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No Posted Jobs Yet</Text>
                    <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                      Click "POST NEW JOB WORK" above to post your requirement for Tiruppur units.
                    </Text>
                  </View>
                ) : (
                  jobs.filter(j => j.postedByUserId === userProfile.userId).map(job => (
                    <OpportunityCard key={job.id} job={job} />
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Floating Action Button for POST WORK */}
        {currentAction === 'POST_WORK' && (
          <TouchableOpacity
            style={[styles.floatingFab, { backgroundColor: theme.primary }]}
            activeOpacity={0.88}
            onPress={() => setShowPostModal(true)}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.fabText}>Post Work</Text>
          </TouchableOpacity>
        )}

        {/* Post Work Form Modal */}
        <PostWorkModal
          visible={showPostModal}
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
            setPostSuccess(true);
            setTimeout(() => setPostSuccess(false), 3000);
          }}
        />
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
    position: 'relative',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchActionBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  switchActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  feedHeadingRow: {
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  feedSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  feedList: {
    marginTop: 8,
  },
  emptyBox: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  postWorkHeader: {
    marginBottom: 16,
  },
  bigPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  bigPostBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  floatingFab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : BottomTabInset + 16,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
