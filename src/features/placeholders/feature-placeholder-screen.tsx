import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { shellMetrics } from '@/features/shell/shell-config';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

type FeaturePlaceholderScreenProps = {
  description: string;
  title: string;
};

export function FeaturePlaceholderScreen({
  description,
  title,
}: FeaturePlaceholderScreenProps) {
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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
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
      width: '100%',
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
