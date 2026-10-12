import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UI } from '../theme/tokens';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Companion crash:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Weepo hit a glitch</Text>
          <Text style={styles.lead}>
            Your chats and settings usually stay on this device — nothing was sent to Mon Mon.
          </Text>
          <Text style={styles.msg}>{this.state.error.message}</Text>
          <Text style={styles.hint}>
            Tap Try again to reload this screen. If it keeps happening, force-quit and reopen the app.
            Last resort: Settings → Delete all local data (only on this phone).
          </Text>
          <Pressable style={styles.btn} onPress={() => this.setState({ error: null })}>
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: UI.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { color: UI.text, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  lead: { color: UI.textMid, textAlign: 'center', lineHeight: 20, marginBottom: 10, fontSize: 14 },
  msg: { color: UI.textDim, textAlign: 'center', marginBottom: 12, fontSize: 12 },
  hint: { color: UI.textDim, textAlign: 'center', marginBottom: 20, fontSize: 12, lineHeight: 18 },
  btn: {
    backgroundColor: UI.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 3,
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
