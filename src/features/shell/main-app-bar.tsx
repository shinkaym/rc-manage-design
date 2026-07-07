import { HugeiconsIcon } from '@hugeicons/react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { shellIcons } from './shell-config';

type MainAppBarProps = {
  centerChild?: ReactNode;
  onMenuPress: () => void;
  title?: string;
};

export function MainAppBar({ centerChild, onMenuPress, title }: MainAppBarProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Pressable onPress={onMenuPress} style={styles.menuButtonPressable}>
        {({ pressed }) => (
          <View style={[styles.menuButton, pressed ? styles.menuButtonPressed : null]}>
            <HugeiconsIcon
              icon={shellIcons.menu}
              color={theme.colors.primary}
              size={22}
              strokeWidth={2.2}
            />
          </View>
        )}
      </Pressable>

      <View style={styles.centerContent}>
        {centerChild ?? <Text style={styles.title}>{title}</Text>}
      </View>

      <View style={styles.trailingSpacer} />
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    menuButtonPressable: {
      borderRadius: radius.pill,
    },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      boxShadow: `0 4px 8px ${theme.colors.shadow}`,
    },
    menuButtonPressed: {
      opacity: 0.9,
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    title: {
      ...typography.headlineMedium,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    trailingSpacer: {
      width: spacing.xxxl,
    },
  });
}
