import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

export type SegmentTabItem<T> = {
  label: string;
  value: T;
};

type SegmentTabsProps<T> = {
  items: SegmentTabItem<T>[];
  onChange: (value: T) => void;
  selectedValue: T;
};

export function SegmentTabs<T>({
  items,
  onChange,
  selectedValue,
}: SegmentTabsProps<T>) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isSelected = item.value === selectedValue;

        return (
          <Pressable
            key={String(item.value)}
            onPress={() => onChange(item.value)}
            style={styles.buttonPressable}>
            {({ pressed }) => (
              <View
                style={[
                  styles.button,
                  isSelected ? styles.buttonSelected : null,
                  pressed && !isSelected ? styles.buttonPressed : null,
                ]}>
                <Text style={[styles.label, isSelected ? styles.labelSelected : null]}>
                  {item.label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: spacing.xxs,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
    },
    buttonPressable: {
      flex: 1,
      borderRadius: radius.pill,
      overflow: 'hidden',
    },
    button: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSelected: {
      backgroundColor: theme.colors.primary,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    label: {
      ...typography.labelLarge,
      color: theme.colors.textSecondary,
      fontFamily: typography.titleMedium.fontFamily,
      fontSize: 13,
      lineHeight: 18,
    },
    labelSelected: {
      color: theme.colors.surface,
    },
  });
}
