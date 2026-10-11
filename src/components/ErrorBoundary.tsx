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
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.msg}>{this.state.error.message}</Text>
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
  msg: { color: UI.textDim, textAlign: 'center', marginBottom: 20 },
  btn: {
    backgroundColor: UI.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 3,
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
