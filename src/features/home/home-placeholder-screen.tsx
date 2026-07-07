import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { shellMetrics } from '@/features/shell/shell-config';
import { useAppTheme } from '@/hooks/use-app-theme';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

export function HomePlaceholderScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <>
      <StatusBar style="dark" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.screen}
        contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Home screen will be ported next</Text>
          <Text style={styles.description}>
            The main shell, drawer, and bottom navigation are in place now, so we can move on to the real dashboard UI next.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom:
        shellMetrics.bottomNavHeight +
        shellMetrics.centerFabSize / 2 +
        shellMetrics.centerFabGap +
        shellMetrics.centerFabLabelHeight +
        spacing.sm,
    },
    card: {
      maxWidth: 420,
      gap: spacing.sm,
    },
    title: {
      ...typography.headlineMedium,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    description: {
      ...typography.bodyLarge,
      color: theme.colors.textHint,
      textAlign: 'center',
    },
  });
}
