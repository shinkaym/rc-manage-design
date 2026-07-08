import { HugeiconsIcon } from '@hugeicons/react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { shellIcons } from './shell-config';

type MainAppBarActionButtonProps = {
  backgroundColor?: string;
  color?: string;
  disabled?: boolean;
  icon: typeof shellIcons.menu;
  onPress: () => void;
};

type MainAppBarProps = {
  centerChild?: ReactNode;
  leftMode?: 'back' | 'menu';
  onLeftPress: () => void;
  rightSlot?: ReactNode;
  title?: string;
};

export function MainAppBar({
  centerChild,
  leftMode = 'menu',
  onLeftPress,
  rightSlot,
  title,
}: MainAppBarProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const leftIcon = leftMode === 'back' ? shellIcons.back : shellIcons.menu;

  return (
    <View style={styles.container}>
      <View style={[styles.sideSlot, styles.sideSlotLeft]}>
        <MainAppBarActionButton icon={leftIcon} onPress={onLeftPress} />
      </View>

      <View style={styles.centerContent}>
        {centerChild ?? (title ? <Text style={styles.title}>{title}</Text> : null)}
      </View>

      <View style={[styles.sideSlot, styles.sideSlotRight]}>
        {rightSlot}
      </View>
    </View>
  );
}

export function MainAppBarActionButton({
  backgroundColor,
  color,
  disabled = false,
  icon,
  onPress,
}: MainAppBarActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={styles.iconButtonPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.iconButton,
            backgroundColor ? { backgroundColor } : null,
            disabled ? styles.iconButtonDisabled : null,
            pressed && !disabled ? styles.iconButtonPressed : null,
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
    iconButtonDisabled: {
      opacity: 0.5,
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
