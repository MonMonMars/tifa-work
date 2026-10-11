import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { TitleScreen } from './src/screens/TitleScreen';
import { CompanionProvider, useCompanionStore } from './src/store/companionStore';
import { UI } from './src/theme/tokens';

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
  const { ready, personaId, selectPersona, expression, setExpressionManual } = useCompanionStore();
  const [screen, setScreen] = useState<RootScreen>('title');

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
        <StatusBar style="light" />
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
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {/* Home + avatar stage stays mounted under overlays (aiva-companion pattern). */}
      <HomeScreen
        personaId={personaId}
        onOpenChat={() => setScreen('chat')}
        onOpenSettings={() => setScreen('settings')}
        onChangePersona={goSelect}
        onProbeExpression={onProbeExpression}
      />

      {screen === 'chat' && (
        <View style={styles.overlay}>
          <ChatScreen personaId={personaId} onClose={goHome} />
        </View>
      )}

      {screen === 'settings' && (
        <View style={styles.overlay}>
          <SettingsScreen onClose={goHome} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.bg },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: UI.bg,
  },
});
