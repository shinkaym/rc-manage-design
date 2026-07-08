import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

type SectionCollapseProps = {
  child: ReactNode;
  contentSpacing?: number;
  initiallyExpanded?: boolean;
  title: string;
};

export function SectionCollapse({
  child,
  contentSpacing = spacing.sm,
  initiallyExpanded = true,
  title,
}: SectionCollapseProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, contentSpacing);
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const rotateValue = useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateValue, {
      toValue: expanded ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [expanded, rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['270deg', '90deg'],
  });

  return (
    <View>
      <Pressable onPress={() => setExpanded((value) => !value)} style={styles.headerPressable}>
        {({ pressed }) => (
          <View style={[styles.header, pressed ? styles.headerPressed : null]}>
            <Text style={styles.title}>{title}</Text>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <HugeiconsIcon icon={ArrowRight01Icon} size={24} color={theme.colors.textSecondary} strokeWidth={2} />
            </Animated.View>
          </View>
        )}
      </Pressable>

      {expanded ? <View style={styles.content}>{child}</View> : null}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, contentSpacing: number) {
  return StyleSheet.create({
    headerPressable: {
      borderRadius: radius.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xxs,
    },
    headerPressed: {
      opacity: 0.9,
    },
    title: {
      flex: 1,
      ...typography.headlineMedium,
      fontSize: 20,
      lineHeight: 26,
      color: theme.colors.textSecondary,
    },
    content: {
      paddingVertical: contentSpacing,
    },
  });
}
