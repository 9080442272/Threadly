import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, FileText, Package, ChevronRight, ChevronLeft, Send } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { useMarketplace, ChatThread } from '@/hooks/use-marketplace';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type MsgCategory = 'all' | 'applications' | 'orders';

export default function MessagesScreen() {
  const theme = useTheme();
  const { chatThreads, sendChatMessage, userRole } = useMarketplace();

  const [activeCategory, setActiveCategory] = useState<MsgCategory>('all');
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [replyText, setReplyText] = useState('');

  // Filter threads
  const filteredThreads = chatThreads.filter(t => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  const handleSendMessage = async () => {
    if (!selectedThread || !replyText.trim()) return;

    await sendChatMessage(selectedThread.id, replyText.trim());
    
    // Refresh active selected thread reference to show the new message
    const updatedThread = chatThreads.find(t => t.id === selectedThread.id);
    if (updatedThread) {
      setSelectedThread(updatedThread);
    }
    setReplyText('');
  };

  const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safeArea}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Messages</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Negotiate and coordinate sourcing contracts
            </Text>
          </View>

          {/* Group Tabs (All, Applications, Orders) */}
          <View style={styles.tabContainer}>
            {(['all', 'applications', 'orders'] as MsgCategory[]).map((tab) => {
              const isSelected = activeCategory === tab;
              return (
                <Pressable
                  key={tab}
                  style={[styles.tabButton, isSelected && { borderBottomColor: theme.primary }]}
                  onPress={() => setActiveCategory(tab)}
                >
                  <Text style={[
                    styles.tabText, 
                    { color: isSelected ? theme.text : theme.textSecondary },
                    isSelected && styles.selectedTabText
                  ]}>
                    {tab === 'all' ? 'All Chats' : tab === 'applications' ? 'Bids / Bidding' : 'Orders'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Threads List */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {filteredThreads.length === 0 ? (
              <View style={styles.emptyState}>
                <MessageSquare size={28} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No messages in this folder.</Text>
              </View>
            ) : (
              filteredThreads.map((thread) => {
                const latestMsg = thread.messages[thread.messages.length - 1];
                return (
                  <Pressable
                    key={thread.id}
                    style={[styles.threadCard, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}
                    onPress={() => setSelectedThread(thread)}
                  >
                    <View style={styles.threadIconContainer}>
                      <View style={[styles.threadIcon, { backgroundColor: thread.category === 'applications' ? `${theme.focus}15` : `${theme.primary}15` }]}>
                        {thread.category === 'applications' ? (
                          <FileText size={16} color={theme.focus} />
                        ) : (
                          <Package size={16} color={theme.primary} />
                        )}
                      </View>
                    </View>
                    <View style={styles.threadInfo}>
                      <View style={styles.threadMetaRow}>
                        <Text style={[styles.threadName, { color: theme.text }]} numberOfLines={1}>{thread.name}</Text>
                        <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                          {getRelativeTime(thread.lastUpdated)}
                        </Text>
                      </View>
                      <Text style={[styles.threadSubject, { color: theme.textSecondary }]} numberOfLines={1}>{thread.subject}</Text>
                      <Text style={[styles.threadPreview, { color: theme.textSecondary }]} numberOfLines={1}>
                        {latestMsg ? `${latestMsg.senderName}: ${latestMsg.text}` : 'No messages yet'}
                      </Text>
                    </View>
                    <ChevronRight size={14} color={theme.textSecondary} />
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {/* DYNAMIC CHAT POPUP OVERLAY */}
          {selectedThread && (
            <View style={[styles.chatOverlay, { backgroundColor: theme.background }]}>
              {/* Chat Header */}
              <View style={[styles.chatHeader, { borderBottomColor: theme.cardBorder }]}>
                <Pressable onPress={() => setSelectedThread(null)} style={styles.backBtn}>
                  <ChevronLeft size={18} color={theme.text} />
                  <Text style={[styles.backText, { color: theme.text }]}>Inbox</Text>
                </Pressable>
                <View style={styles.chatTitleContainer}>
                  <Text style={[styles.chatTitle, { color: theme.text }]} numberOfLines={1}>{selectedThread.name}</Text>
                  <Text style={[styles.chatSubject, { color: theme.textSecondary }]} numberOfLines={1}>{selectedThread.subject}</Text>
                </View>
                <View style={{ width: 44 }} />
              </View>

              {/* Chat Log */}
              <ScrollView 
                style={styles.chatScroll}
                contentContainerStyle={styles.chatScrollContent}
                ref={(ref) => ref?.scrollToEnd({ animated: false })}
              >
                {selectedThread.messages.map((msg) => {
                  // Determine sender alignment: system is middle, senderName matching role goes to right, others left
                  const isSystem = msg.senderName === 'System';
                  const isOwnMessage = (userRole === 'manufacturer' && msg.senderRole === 'manufacturer') ||
                                       (userRole === 'exporter' && msg.senderRole === 'exporter');
                  
                  if (isSystem) {
                    return (
                      <View key={msg.id} style={styles.systemMsgContainer}>
                        <Text style={[styles.systemMsgText, { color: theme.textSecondary, backgroundColor: theme.backgroundElement }]}>
                          {msg.text}
                        </Text>
                      </View>
                    );
                  }

                  return (
                    <View key={msg.id} style={[styles.bubbleWrapper, isOwnMessage ? styles.ownBubbleWrapper : styles.otherBubbleWrapper]}>
                      {!isOwnMessage && (
                        <Text style={[styles.senderNameLabel, { color: theme.textSecondary }]}>
                          {msg.senderName}
                        </Text>
                      )}
                      <View style={[
                        styles.bubble,
                        isOwnMessage 
                          ? { backgroundColor: theme.primary } 
                          : { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder, borderWidth: 1 }
                      ]}>
                        <Text style={[styles.bubbleText, { color: isOwnMessage ? '#ffffff' : theme.text }]}>
                          {msg.text}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Chat Input Footer */}
              <View style={[styles.chatInputRow, { borderTopColor: theme.cardBorder, backgroundColor: theme.backgroundElement }]}>
                <TextInput
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="Type your message here..."
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.chatInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.cardBorder }]}
                />
                <Pressable 
                  style={[styles.sendBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSendMessage}
                >
                  <Send size={16} color="#ffffff" />
                </Pressable>
              </View>
            </View>
          )}

        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
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
    paddingVertical: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 6,
    gap: 12,
  },
  threadIconContainer: {
    justifyContent: 'center',
  },
  threadIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadInfo: {
    flex: 1,
    gap: 2,
  },
  threadMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadName: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  threadSubject: {
    fontSize: 12,
    fontWeight: '600',
  },
  threadPreview: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  chatOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 60,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chatTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  chatSubject: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 16,
    gap: 12,
  },
  systemMsgContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  systemMsgText: {
    fontSize: 10,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bubbleWrapper: {
    maxWidth: '80%',
    gap: 4,
  },
  ownBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  otherBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  senderNameLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 6,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
