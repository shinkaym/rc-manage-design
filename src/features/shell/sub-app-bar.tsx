import { HugeiconsIcon } from '@hugeicons/react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { shellIcons } from './shell-config';

type SubAppBarActionButtonProps = {
  backgroundColor?: string;
  color?: string;
  icon: typeof shellIcons.back;
  onPress: () => void;
};

type SubAppBarProps = {
  onBackPress: () => void;
  rightSlot?: ReactNode;
  title: string;
};

export function SubAppBar({ onBackPress, rightSlot, title }: SubAppBarProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={[styles.sideSlot, styles.sideSlotLeft]}>
        <SubAppBarActionButton icon={shellIcons.back} onPress={onBackPress} />
      </View>

      <View style={styles.centerContent}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </View>

      <View style={[styles.sideSlot, styles.sideSlotRight]}>
        {rightSlot}
      </View>
    </View>
  );
}

export function SubAppBarActionButton({
  backgroundColor,
  color,
  icon,
  onPress,
}: SubAppBarActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={styles.iconButtonPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.iconButton,
            backgroundColor ? { backgroundColor } : null,
            pressed ? styles.iconButtonPressed : null,
          ]}>
          <HugeiconsIcon
            icon={icon}
            color={color ?? theme.colors.primary}
            size={22}
            strokeWidth={2.2}
          />
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
      backgroundColor: theme.colors.background,
    },
    sideSlot: {
      minWidth: 44,
      maxWidth: 104,
      minHeight: 44,
      justifyContent: 'center',
    },
    sideSlotLeft: {
      alignItems: 'flex-start',
    },
    sideSlotRight: {
      alignItems: 'flex-end',
    },
    iconButtonPressable: {
      borderRadius: radius.pill,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      boxShadow: `0 4px 8px ${theme.colors.shadow}`,
    },
    iconButtonPressed: {
      opacity: 0.9,
    },
    centerContent: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
    },
    title: {
      ...typography.headlineMedium,
      color: theme.colors.primary,
      textAlign: 'center',
    },
  });
}
