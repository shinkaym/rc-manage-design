import { HugeiconsIcon } from '@hugeicons/react-native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { toSoftColor } from '@/shared/utils/color';
import {
  categoryIconCatalog,
  customCategorySeed,
  defaultCategorySeed,
  type CategoryItem,
} from '../../../mock/category-data';

type CategoryPickerSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (category: CategoryItem) => void;
  selectedCategoryId?: string;
};

export function CategoryPickerSheet({ isVisible, onClose, onSelect, selectedCategoryId }: CategoryPickerSheetProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);

  return (
    <Modal animationType='fade' transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.dismissArea} onPress={onClose}>
          <View style={styles.scrim} />
        </Pressable>

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <ScrollView
            contentInsetAdjustmentBehavior='automatic'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.title}>Choose Category</Text>

            <CategoryPickerSection
              items={defaultCategorySeed}
              selectedCategoryId={selectedCategoryId}
              title='Default List'
              onSelect={onSelect}
            />

            <CategoryPickerSection
              items={customCategorySeed}
              selectedCategoryId={selectedCategoryId}
              title='Custom List'
              onSelect={onSelect}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

type CategoryPickerSectionProps = {
  items: CategoryItem[];
  onSelect: (category: CategoryItem) => void;
  selectedCategoryId?: string;
  title: string;
};

function CategoryPickerSection({ items, onSelect, selectedCategoryId, title }: CategoryPickerSectionProps) {
  const styles = createStyles(useAppTheme(), 0);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <CategoryOptionCard
            key={item.id}
            category={item}
            isSelected={item.id === selectedCategoryId}
            onPress={() => onSelect(item)}
          />
        ))}
      </View>
    </View>
  );
}

type CategoryOptionCardProps = {
  category: CategoryItem;
  isSelected: boolean;
  onPress: () => void;
};

function CategoryOptionCard({ category, isSelected, onPress }: CategoryOptionCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0);
  const iconPreset = categoryIconCatalog[category.iconKey];

  return (
    <Pressable onPress={onPress} style={styles.cardPressable}>
      {({ pressed }) => (
        <View style={[styles.card, isSelected ? styles.cardSelected : null, pressed ? styles.cardPressed : null]}>
          <View style={[styles.iconBadge, { backgroundColor: toSoftColor(category.colorValue) }]}>
            <HugeiconsIcon icon={iconPreset.icon} color={category.colorValue} size={18} strokeWidth={2} />
          </View>

          <Text numberOfLines={1} style={styles.cardLabel}>
            {category.label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, bottomInset: number) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    dismissArea: {
      flex: 1,
    },
    scrim: {
      flex: 1,
      backgroundColor: 'rgba(25, 28, 29, 0.28)',
    },
    sheet: {
      maxHeight: '72%',
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surface,
      paddingTop: spacing.xs,
      boxShadow: '0 -12px 24px rgba(0, 0, 0, 0.14)',
    },
    handle: {
      width: 52,
      height: 5,
      borderRadius: radius.pill,
      alignSelf: 'center',
      backgroundColor: theme.colors.borderAlt,
      marginBottom: spacing.md,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: (bottomInset > 0 ? bottomInset : spacing.md) + spacing.md,
      gap: spacing.lg,
    },
    title: {
      ...typography.titleLarge,
      color: theme.colors.textSecondary,
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    cardPressable: {
      width: '48%',
      minWidth: 140,
    },
    card: {
      minHeight: 56,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    cardSelected: {
      borderColor: theme.colors.primary,
      boxShadow: '0 0 0 2px rgba(245, 124, 0, 0.12)',
    },
    cardPressed: {
      opacity: 0.92,
    },
    iconBadge: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(25, 28, 29, 0.08)',
    },
    cardLabel: {
      flex: 1,
      ...typography.bodyMedium,
      fontFamily: typography.titleMedium.fontFamily,
      color: theme.colors.textSecondary,
    },
  });
}
