import { HugeiconsIcon } from '@hugeicons/react-native';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { shellMetrics, shellNavRoutes } from '../shell-config';

type MainBottomNavProps = {
  currentPathname: string;
  onNavigate: (href: Href) => void;
};

export function MainBottomNav({ currentPathname, onNavigate }: MainBottomNavProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const leftItems = shellNavRoutes.slice(0, 2);
  const rightItems = shellNavRoutes.slice(3);

  return (
    <View style={styles.container}>
      {leftItems.map((item) => (
        <View key={item.href} style={styles.navSlot}>
          <BottomNavItem
            currentPathname={currentPathname}
            href={item.href}
            icon={item.icon}
            label={item.label}
            onNavigate={onNavigate}
          />
        </View>
      ))}

      <View style={styles.centerGap} />

      {rightItems.map((item) => (
        <View key={item.href} style={styles.navSlot}>
          <BottomNavItem
            currentPathname={currentPathname}
            href={item.href}
            icon={item.icon}
            label={item.label}
            onNavigate={onNavigate}
          />
        </View>
      ))}
    </View>
  );
}

type BottomNavItemProps = {
  currentPathname: string;
  href: Href;
  icon: (typeof shellNavRoutes)[number]['icon'];
  label: string;
  onNavigate: (href: Href) => void;
};

function BottomNavItem({ currentPathname, href, icon, label, onNavigate }: BottomNavItemProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const isActive = currentPathname.startsWith(href.toString());
  const color = isActive ? theme.colors.primary : 'rgba(0, 0, 0, 0.87)';

  return (
    <Pressable onPress={() => onNavigate(href)} style={styles.itemPressable}>
      {({ pressed }) => (
        <View style={[styles.itemContent, pressed ? styles.itemPressed : null]}>
          <HugeiconsIcon icon={icon} size={24} color={color} strokeWidth={1.9} />
          <Text style={[styles.itemLabel, { color }, isActive ? styles.itemLabelActive : null]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      height: shellMetrics.bottomNavHeight,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.08)',
    },
    navSlot: {
      flex: 1,
    },
    centerGap: {
      width: 72,
    },
    itemPressable: {
      borderRadius: 12,
    },
    itemContent: {
      paddingVertical: 6,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xxs,
    },
    itemPressed: {
      opacity: 0.85,
    },
    itemLabel: {
      ...typography.labelLarge,
      color: 'rgba(0, 0, 0, 0.87)',
      textAlign: 'center',
    },
    itemLabelActive: {
      fontFamily: typography.titleMedium.fontFamily,
    },
  });
}
