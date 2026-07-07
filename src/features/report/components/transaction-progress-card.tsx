import { HugeiconsIcon } from '@hugeicons/react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { formatCurrency } from '@/features/home/home-data';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';
import type { ProgressItem } from '@/features/report/report-data';

type TransactionProgressCardProps = ProgressItem;

export function TransactionProgressCard({
  amount,
  color,
  icon,
  percentage,
  progress,
  title,
  trackColor,
}: TransactionProgressCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const progressWidth = `${Math.max(0, Math.min(progress, 1)) * 100}%`;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <HugeiconsIcon icon={icon} size={24} color={theme.colors.primary} strokeWidth={1.8} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
            <View style={[styles.progressFill, { backgroundColor: color, width: progressWidth }]} />
          </View>
          <Text style={styles.percentage}>{percentage.toFixed(2)}%</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 52,
      height: 52,
      padding: spacing.xs,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    title: {
      flex: 1,
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    amount: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
      gap: spacing.sm,
    },
    progressTrack: {
      flex: 1,
      height: 10,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      overflow: 'hidden',
      justifyContent: 'center',
    },
    progressFill: {
      height: '100%',
      borderRadius: radius.pill,
      borderCurve: 'continuous',
    },
    percentage: {
      ...typography.labelLarge,
      color: theme.colors.textHint,
      fontFamily: typography.titleMedium.fontFamily,
    },
  });
}
