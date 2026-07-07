import { HugeiconsIcon } from '@hugeicons/react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { shellIcons } from './shell-config';

type MonthSelectorChipProps = {
  label: string;
  onPress?: () => void;
};

export function MonthSelectorChip({ label, onPress }: MonthSelectorChipProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      {({ pressed }) => (
        <View style={[styles.container, pressed ? styles.containerPressed : null]}>
          <HugeiconsIcon
            icon={shellIcons.calendar}
            size={18}
            color={theme.colors.textSecondary}
            strokeWidth={1.8}
          />
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    pressable: {
      borderRadius: radius.sm,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      boxShadow: `0 4px 12px ${theme.colors.shadow}`,
      gap: spacing.xs,
    },
    containerPressed: {
      opacity: 0.9,
    },
    label: {
      ...typography.bodyMedium,
      fontFamily: typography.titleMedium.fontFamily,
      color: theme.colors.textSecondary,
    },
  });
}
