import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { THREAD_STORAGE_CAP } from '../../domain/chatThreadLimits';
import type { ChatMessage } from '../../domain/messages';
import { useUi } from '../../theme/useUi';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: ChatMessage[];
  personaColor: string;
  typing?: boolean;
  personaName?: string;
  emptySearch?: boolean;
  threadAtStorageCap?: boolean;
}

export function MessageList({
  messages,
  personaColor,
  typing,
  personaName,
  emptySearch,
  threadAtStorageCap,
}: Props) {
  const UI = useUi();
  const styles = useMemo(() => makeStyles(UI), [UI]);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble message={item} personaColor={personaColor} />
    ),
    [personaColor],
  );

  const scrollKey =
    messages.length > 0
      ? `${messages[messages.length - 1]?.id}:${messages[messages.length - 1]?.content.length}`
      : 'empty';

  useEffect(() => {
    if (messages.length === 0) return;
    listRef.current?.scrollToEnd({ animated: true });
  }, [scrollKey, typing, messages.length]);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      accessibilityLabel="Chat messages"
      initialNumToRender={18}
      maxToRenderPerBatch={12}
      windowSize={9}
      removeClippedSubviews
      contentContainerStyle={[styles.content, messages.length === 0 && styles.contentEmpty]}
      ListHeaderComponent={
        threadAtStorageCap ? (
          <View style={styles.capBanner}>
            <Text style={styles.capText}>
              Showing the latest {THREAD_STORAGE_CAP} messages — older ones were trimmed on device.
            </Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{emptySearch ? 'No matches' : 'Start talking'}</Text>
          <Text style={styles.emptySub}>
            {emptySearch
              ? 'Try different words or clear the search field.'
              : `${personaName ? `${personaName} is here.` : 'Your companion is here.'} Offline banter works with no API key.`}
          </Text>
        </View>
      }
      ListFooterComponent={
        typing ? (
          <View style={styles.typing}>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
            <Text style={styles.typingText}>Thinking…</Text>
          </View>
        ) : null
      }
    />
  );
}

function makeStyles(UI: ReturnType<typeof useUi>) {
  return StyleSheet.create({
    content: { paddingVertical: 12, flexGrow: 1 },
    contentEmpty: { flex: 1, justifyContent: 'center' },
    empty: { paddingHorizontal: 24, alignItems: 'center' },
    emptyTitle: { color: UI.text, fontWeight: '800', fontSize: 18, marginBottom: 8 },
    emptySub: { color: UI.textDim, textAlign: 'center', lineHeight: 20, fontSize: 14 },
    typing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    typingDots: { flexDirection: 'row', gap: 4 },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: UI.accent,
      opacity: 0.35,
    },
    dot1: { opacity: 0.9 },
    dot2: { opacity: 0.6 },
    dot3: { opacity: 0.4 },
    typingText: { color: UI.textDim, fontSize: 13 },
    capBanner: {
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 10,
      borderRadius: 3,
      backgroundColor: UI.surfaceTop,
      borderWidth: 1,
      borderColor: UI.hairline,
    },
    capText: { color: UI.textDim, fontSize: 11, lineHeight: 15, textAlign: 'center' },
  });
}
