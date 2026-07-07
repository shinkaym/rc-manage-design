import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

type SummaryCardProps = {
  amount: string;
  label: string;
};

export function SummaryCard({ amount, label }: SummaryCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      width: '100%',
      padding: spacing.md,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.secondary,
    },
    label: {
      ...typography.labelLarge,
      color: theme.colors.textTertiarySoft,
      fontFamily: typography.titleMedium.fontFamily,
      letterSpacing: 0.8,
    },
    amount: {
      ...typography.displayLarge,
      marginTop: spacing.xs,
      color: theme.colors.surface,
    },
  });
}
