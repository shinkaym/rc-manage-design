import { HugeiconsIcon } from '@hugeicons/react-native';
import type { Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { drawerItems, shellIcons } from './shell-config';

type AppDrawerPanelProps = {
  currentPathname: string;
  onClose: () => void;
  onNavigate: (href: Href) => void;
  width: number;
};

export function AppDrawerPanel({
  currentPathname,
  onClose,
  onNavigate,
  width,
}: AppDrawerPanelProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, width);

  return (
    <View style={styles.container}>
      <Pressable onPress={onClose} style={styles.closeButtonPressable}>
        {({ pressed }) => (
          <View style={[styles.closeButton, pressed ? styles.closeButtonPressed : null]}>
            <HugeiconsIcon icon={shellIcons.close} color="#FFFFFF" size={26} strokeWidth={2.6} />
          </View>
        )}
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.name}>Charlie Puth</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}>
        {drawerItems.map((item) => {
          const isSelected = currentPathname.startsWith(item.href.toString());

          return (
            <Pressable
              key={item.href}
              onPress={() => onNavigate(item.href)}
              style={styles.itemPressable}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.item,
                    isSelected ? styles.itemSelected : null,
                    pressed ? styles.itemPressed : null,
                  ]}>
                  <HugeiconsIcon icon={item.icon} color="#FFFFFF" size={18} strokeWidth={2.4} />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, width: number) {
  return StyleSheet.create({
    container: {
      width,
      flex: 1,
      backgroundColor: theme.colors.secondary,
      paddingTop: spacing.md,
      paddingRight: spacing.xl,
      paddingBottom: spacing.xl,
      paddingLeft: spacing.xl,
    },
    closeButtonPressable: {
      alignSelf: 'flex-start',
      borderRadius: radius.pill,
    },
    closeButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonPressed: {
      opacity: 0.85,
    },
    header: {
      marginTop: spacing.xxl,
      gap: 2,
    },
    greeting: {
      ...typography.bodyLarge,
      color: '#FFFFFF',
    },
    name: {
      ...typography.titleLarge,
      fontSize: 20,
      lineHeight: 26,
      color: '#FFFFFF',
    },
    list: {
      flex: 1,
      marginTop: spacing.lg,
    },
    listContent: {
      paddingRight: spacing.lg,
      gap: spacing.xs,
    },
    itemPressable: {
      borderRadius: radius.md,
      borderCurve: 'continuous',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      gap: spacing.sm,
    },
    itemSelected: {
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    itemPressed: {
      opacity: 0.9,
    },
    itemLabel: {
      ...typography.bodyMedium,
      fontFamily: typography.titleMedium.fontFamily,
      fontSize: 15,
      lineHeight: 20,
      color: '#FFFFFF',
    },
  });
}
