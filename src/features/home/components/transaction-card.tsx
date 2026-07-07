import { HugeiconsIcon } from '@hugeicons/react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { formatCurrency } from '../home-data';
import type { TransactionItem } from '../home-data';

type TransactionCardProps = {
  icon: TransactionItem['icon'];
  note: string;
  style?: StyleProp<ViewStyle>;
  time: string;
  title: string;
  total: number;
};

export function TransactionCard({
  icon,
  note,
  style,
  time,
  title,
  total,
}: TransactionCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <HugeiconsIcon icon={icon} size={24} color={theme.colors.primary} strokeWidth={1.8} />
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.timePill}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        </View>

        <Text numberOfLines={1} style={styles.note}>
          {note}
        </Text>
      </View>

      <Text style={styles.total}>{formatCurrency(total, 0)}</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
    },
    iconContainer: {
      width: 52,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xs,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
    },
    content: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    timePill: {
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
    },
    timeText: {
      ...typography.labelLarge,
      fontFamily: typography.titleMedium.fontFamily,
      color: theme.colors.textSecondary,
    },
    title: {
      flex: 1,
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    note: {
      ...typography.bodyMedium,
      marginTop: spacing.xxs,
      color: theme.colors.textTertiary,
    },
    total: {
      ...typography.titleMedium,
      marginLeft: spacing.sm,
      color: theme.colors.secondary,
    },
  });
}
