import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import type { PersonaId } from './src/domain/personas';
import type { ExpressionSnapshot } from './src/expression/types';
import type { RootScreen } from './src/navigation/types';
import { ChatScreen } from './src/screens/ChatScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PersonaSelectScreen } from './src/screens/PersonaSelectScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PreChatTipSheet } from './src/components/onboarding/PreChatTipSheet';
import { TitleScreen } from './src/screens/TitleScreen';
import { getPersona } from './src/domain/personas';
import { CompanionProvider, useCompanionStore } from './src/store/companionStore';
import { useUi } from './src/theme/useUi';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <CompanionProvider>
          <AppBody />
        </CompanionProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function AppBody() {
  const {
    ready,
    personaId,
    selectPersona,
    expression,
    setExpressionManual,
    themeMode,
    hasSeenPreChatTips,
    markPreChatTipsSeen,
  } = useCompanionStore();
  const UI = useUi();
  const statusStyle = themeMode === 'light' ? 'dark' : 'light';
  const [screen, setScreen] = useState<RootScreen>('title');
  const [preChatTipsOpen, setPreChatTipsOpen] = useState(false);

  const goHome = useCallback(() => setScreen('home'), []);
  const goSelect = useCallback(() => setScreen('personaSelect'), []);

  const onTitleEnter = useCallback(() => {
    setScreen(personaId ? 'home' : 'personaSelect');
  }, [personaId]);

  const onPersonaConfirm = useCallback(
    (id: PersonaId) => {
      selectPersona(id);
      setScreen('home');
    },
    [selectPersona],
  );

  const onProbeExpression = useCallback(
    (label: string, weights: ExpressionSnapshot['weights']) => {
      setExpressionManual({
        weights,
        label: `Manual · ${label}`,
        source: 'manual',
        updatedAt: Date.now(),
      });
    },
    [setExpressionManual],
  );

  if (!ready) {
    return <TitleScreen ready={false} />;
  }

  if (screen === 'title') {
    return (
      <>
        <TitleScreen ready returning={Boolean(personaId)} onEnter={onTitleEnter} />
        <StatusBar style={statusStyle} />
      </>
    );
  }

  if (screen === 'personaSelect' || !personaId) {
    return (
      <>
        <PersonaSelectScreen
          onConfirm={onPersonaConfirm}
          onCancel={personaId ? goHome : undefined}
          initialSelected={personaId ?? 'mika'}
          mode={personaId ? 'switch' : 'onboarding'}
        />
        <StatusBar style={statusStyle} />
      </>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: UI.bg }]}>
      <StatusBar style={statusStyle} />
      {Platform.OS === 'web' ? (
        <View style={[styles.webDemoBar, { borderBottomColor: UI.hairline, backgroundColor: UI.surface }]}>
          <Text style={[styles.webDemoText, { color: UI.textDim }]}>
            Browser demo · chats & settings stay in this browser only
          </Text>
        </View>
      ) : null}
      {/* Home + avatar stage stays mounted under overlays (aiva-companion pattern). */}
      <HomeScreen
        personaId={personaId}
        onOpenChat={() => {
          if (!hasSeenPreChatTips) {
            setPreChatTipsOpen(true);
            return;
          }
          setScreen('chat');
        }}
        onOpenSettings={() => setScreen('settings')}
        onChangePersona={goSelect}
        onProbeExpression={onProbeExpression}
      />

      <PreChatTipSheet
        visible={preChatTipsOpen}
        personaName={getPersona(personaId).name}
        onContinue={() => {
          markPreChatTipsSeen();
          setPreChatTipsOpen(false);
          setScreen('chat');
        }}
      />

      {screen === 'chat' && (
        <View style={[styles.overlay, { backgroundColor: UI.bg }]}>
          <ChatScreen personaId={personaId} onClose={goHome} />
        </View>
      )}

      {screen === 'settings' && (
        <View style={[styles.overlay, { backgroundColor: UI.bg }]}>
          <SettingsScreen onClose={goHome} onWipedAllData={() => setScreen('title')} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webDemoBar: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  webDemoText: { fontSize: 11, textAlign: 'center', fontWeight: '600' },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
});
