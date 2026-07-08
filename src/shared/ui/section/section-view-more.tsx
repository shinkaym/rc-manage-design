import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

type SectionViewMoreProps = {
  hiddenCount: number;
  onPress: () => void;
};

export function SectionViewMore({ hiddenCount, onPress }: SectionViewMoreProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [lineWidth, setLineWidth] = useState(0);
  const dashCount = Math.max(1, Math.ceil(lineWidth / 10));

  return (
    <View style={styles.container} onLayout={(event) => setLineWidth(event.nativeEvent.layout.width)}>
      <View pointerEvents='none' style={styles.line}>
        {Array.from({ length: dashCount }).map((_, index) => (
          <View key={`dash-${index}`} style={styles.dash} />
        ))}
      </View>

      <Pressable onPress={onPress} style={styles.pressable}>
        {({ pressed }) => (
          <View style={[styles.labelContainer, pressed ? styles.labelContainerPressed : null]}>
            <Text style={styles.label}>+{hiddenCount} more</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      width: '100%',
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    line: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      overflow: 'hidden',
    },
    dash: {
      width: 6,
      height: 1,
      backgroundColor: 'rgba(245, 124, 0, 0.3)',
    },
    pressable: {
      borderRadius: 999,
    },
    labelContainer: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      backgroundColor: theme.colors.background,
    },
    labelContainerPressed: {
      opacity: 0.85,
    },
    label: {
      ...typography.labelLarge,
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.primary,
      fontFamily: typography.titleMedium.fontFamily,
      textAlign: 'center',
    },
  });
}
