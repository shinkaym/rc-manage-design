import { PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import type { EmployeeItem } from '../../../mock/employee-data';

type EmployeeCardProps = {
  employee: EmployeeItem;
  onEdit?: (employee: EmployeeItem) => void;
};

export function EmployeeCard({ employee, onEdit }: EmployeeCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, employee.accentColor);

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image source={employee.avatarUrl} style={styles.avatarImage} contentFit='cover' />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.rolePill}>
            <Text numberOfLines={1} style={styles.roleText}>
              {employee.role}
            </Text>
          </View>

          <Text numberOfLines={1} style={styles.name}>
            {employee.name}
          </Text>
        </View>

        <Text numberOfLines={1} style={styles.bio}>
          {employee.bio}
        </Text>
      </View>

      <Pressable hitSlop={8} onPress={() => onEdit?.(employee)} style={styles.editPressable}>
        {({ pressed }) => (
          <View style={pressed ? styles.editButtonPressed : null}>
            <HugeiconsIcon icon={PencilEdit02Icon} size={20} color={theme.colors.textSecondary} strokeWidth={2.2} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

type EmployeeCardSkeletonProps = {
  withSpacing?: boolean;
};

export function EmployeeCardSkeleton({ withSpacing = false }: EmployeeCardSkeletonProps) {
  const theme = useAppTheme();
  const styles = createSkeletonStyles(theme);

  return (
    <View style={[styles.container, withSpacing ? styles.containerSpacing : null]}>
      <View style={styles.avatarPlaceholder} />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.pillPlaceholder} />
          <View style={styles.namePlaceholder} />
        </View>

        <View style={styles.bioPlaceholder} />
      </View>

      <View style={styles.iconPlaceholder} />
    </View>
  );
}

function withOpacity(hexColor: string, alpha: number) {
  const normalized = hexColor.replace('#', '');

  if (normalized.length !== 6) {
    return `rgba(245, 124, 0, ${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function createStyles(theme: ReturnType<typeof useAppTheme>, accentColor: string) {
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
    avatarContainer: {
      width: 52,
      height: 52,
      overflow: 'hidden',
      borderRadius: radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: withOpacity(accentColor, 0.18),
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    content: {
      flex: 1,
      marginLeft: spacing.sm,
      gap: spacing.xxs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    rolePill: {
      maxWidth: 112,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
    },
    roleText: {
      ...typography.labelLarge,
      color: theme.colors.textSecondary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    name: {
      flex: 1,
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    bio: {
      ...typography.bodyMedium,
      color: theme.colors.textTertiary,
    },
    editPressable: {
      marginLeft: spacing.sm,
      borderRadius: radius.pill,
    },
    editButtonPressed: {
      opacity: 0.72,
    },
  });
}

function createSkeletonStyles(theme: ReturnType<typeof useAppTheme>) {
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
    containerSpacing: {
      marginTop: spacing.sm,
    },
    avatarPlaceholder: {
      width: 52,
      height: 52,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(148, 163, 184, 0.22)',
    },
    content: {
      flex: 1,
      marginLeft: spacing.sm,
      gap: spacing.xs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    pillPlaceholder: {
      width: 84,
      height: 18,
      borderRadius: radius.sm,
      backgroundColor: 'rgba(148, 163, 184, 0.16)',
    },
    namePlaceholder: {
      width: 96,
      height: 18,
      borderRadius: radius.sm,
      backgroundColor: 'rgba(148, 163, 184, 0.16)',
    },
    bioPlaceholder: {
      width: '88%',
      height: 16,
      borderRadius: radius.sm,
      backgroundColor: 'rgba(148, 163, 184, 0.16)',
    },
    iconPlaceholder: {
      width: 20,
      height: 20,
      marginLeft: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: 'rgba(148, 163, 184, 0.16)',
    },
  });
}
