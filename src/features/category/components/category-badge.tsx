import { HugeiconsIcon } from '@hugeicons/react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';

import { categoryIconCatalog, type CategoryItem } from '../../../mock/category-data';
import { toSoftColor } from '@/shared/utils/color';

type CategoryBadgeProps = {
  category: CategoryItem;
  onPress?: () => void;
};

export function CategoryBadge({ category, onPress }: CategoryBadgeProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const iconPreset = categoryIconCatalog[category.iconKey];

  const badgeContent = (
    <View style={[styles.badge, { backgroundColor: toSoftColor(category.colorValue) }]}>
      <HugeiconsIcon icon={iconPreset.icon} color={category.colorValue} size={20} strokeWidth={1.9} />
    </View>
  );

  if (!onPress) {
    return badgeContent;
  }

  return (
    <Pressable onPress={onPress} style={styles.badgePressable}>
      {({ pressed }) => <View style={pressed ? styles.badgePressed : null}>{badgeContent}</View>}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    badgePressable: {
      borderRadius: radius.lg,
    },
    badgePressed: {
      opacity: 0.9,
    },
    badge: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: 'rgba(87, 66, 53, 0.10)',
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceAlt,
    },
  });
}
