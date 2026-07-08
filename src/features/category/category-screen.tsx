import { Settings02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { shellMetrics } from '@/features/shell/shell-config';
import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import {
  categoryColorPresets,
  categoryIconCatalog,
  categoryIconGroups,
  customCategorySeed,
  defaultCategorySeed,
  type CategoryIconKey,
  type CategoryItem,
} from './category-data';

const addImageSource = require('../../../assets/images/add.png');

type EditableSource = 'default' | 'custom';

type SheetState =
  | { mode: 'create' }
  | { categoryId: string; mode: 'edit'; source: EditableSource };

function normalizeHexColor(value: string) {
  const uppercase = value.trim().toUpperCase();
  const withHash = uppercase.startsWith('#') ? uppercase : `#${uppercase}`;
  const shortHexMatch = /^#([0-9A-F]{3})$/.exec(withHash);

  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return withHash;
}

function isValidHexColor(value: string) {
  return /^#[0-9A-F]{6}$/.test(normalizeHexColor(value));
}

function toSoftColor(value: string) {
  const normalized = normalizeHexColor(value);
  const hex = normalized.slice(1);
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, 0.18)`;
}

export function CategoryScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const sheetAnimation = useRef(new Animated.Value(0)).current;
  const [defaultCategories, setDefaultCategories] = useState(defaultCategorySeed);
  const [customCategories, setCustomCategories] = useState(customCategorySeed);
  const [sheetState, setSheetState] = useState<SheetState | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColorValue, setDraftColorValue] = useState('#F57C00');
  const [draftIconKey, setDraftIconKey] = useState<CategoryIconKey>('food');
  const [isCustomPickerOpen, setIsCustomPickerOpen] = useState(false);

  const sheetVisible = sheetState !== null;
  const normalizedDraftColor = normalizeHexColor(draftColorValue);
  const isDraftColorValid = isValidHexColor(normalizedDraftColor);

  useEffect(() => {
    if (!sheetVisible) {
      sheetAnimation.setValue(0);
      return;
    }

    Animated.spring(sheetAnimation, {
      damping: 18,
      mass: 0.9,
      stiffness: 180,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [sheetAnimation, sheetVisible]);

  function openCreateSheet() {
    setDraftName('');
    setDraftColorValue('#F57C00');
    setDraftIconKey('food');
    setIsCustomPickerOpen(false);
    setSheetState({ mode: 'create' });
  }

  function openEditSheet(category: CategoryItem, source: EditableSource) {
    setDraftName(category.label);
    setDraftColorValue(category.colorValue);
    setDraftIconKey(category.iconKey);
    setIsCustomPickerOpen(
      !categoryColorPresets.includes(category.colorValue as (typeof categoryColorPresets)[number])
    );
    setSheetState({
      mode: 'edit',
      source,
      categoryId: category.id,
    });
  }

  function closeSheet() {
    setSheetState(null);
  }

  function handleConfirm() {
    const trimmedName = draftName.trim();

    if (!trimmedName || !isDraftColorValid) {
      return;
    }

    if (!sheetState || sheetState.mode === 'create') {
      const nextCategory: CategoryItem = {
        colorValue: normalizedDraftColor,
        id: `custom-${Date.now()}`,
        iconKey: draftIconKey,
        label: trimmedName,
      };

      setCustomCategories((current) => [...current, nextCategory]);
      closeSheet();
      return;
    }

    const updater = (items: CategoryItem[]) =>
      items.map((item) =>
        item.id === sheetState.categoryId
          ? {
              ...item,
              colorValue: normalizedDraftColor,
              iconKey: draftIconKey,
              label: trimmedName,
            }
          : item
      );

    if (sheetState.source === 'default') {
      setDefaultCategories(updater);
    } else {
      setCustomCategories(updater);
    }

    closeSheet();
  }

  const confirmDisabled = draftName.trim().length === 0;
  const sheetTranslateY = sheetAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 0],
  });

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.contentColumn}>
            <CategorySection
              items={defaultCategories}
              title="Default List"
              onItemPress={(item) => openEditSheet(item, 'default')}
            />

            <View style={styles.sectionSpacer}>
              <Text style={styles.sectionTitle}>Custom List</Text>
              <View style={styles.grid}>
                {customCategories.map((item) => (
                  <CategoryCard
                    key={item.id}
                    item={item}
                    onPress={() => openEditSheet(item, 'custom')}
                  />
                ))}

                <ActionCard
                  imageSource={addImageSource}
                  label="Create"
                  variant="dashed"
                  onPress={openCreateSheet}
                />

                <ActionCard
                  icon={Settings02Icon}
                  label="Edit"
                  variant="edit"
                  onPress={() =>
                    Alert.alert(
                      'Edit button',
                      'This temporary tile is only here as a visual placeholder for the separate edit entry.'
                    )
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal
          animationType="fade"
          transparent
          visible={sheetVisible}
          onRequestClose={closeSheet}>
          <View style={styles.modalRoot}>
            <Pressable style={styles.dismissArea} onPress={closeSheet}>
              <View style={styles.scrim} />
            </Pressable>

            <Animated.View
              style={[
                styles.sheetContainer,
                {
                  opacity: sheetAnimation,
                  transform: [{ translateY: sheetTranslateY }],
                },
              ]}>
              <View style={styles.sheetHandle} />

              <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.sheetContent}>
                <Text style={styles.sheetTitle}>
                  {sheetState?.mode === 'edit' ? 'Edit Category' : 'Create Category'}
                </Text>

                <TextInput
                  placeholder="Input category name"
                  placeholderTextColor={theme.colors.textHint}
                  style={styles.nameInput}
                  value={draftName}
                  onChangeText={setDraftName}
                />

                <View style={styles.colorGroup}>
                  <Text style={styles.iconGroupTitle}>Color</Text>

                  <View style={styles.colorGrid}>
                    {categoryColorPresets.map((colorValue) => (
                      <ColorOptionButton
                        key={colorValue}
                        colorValue={colorValue}
                        isSelected={normalizedDraftColor === colorValue}
                        onPress={() => {
                          setDraftColorValue(colorValue);
                          setIsCustomPickerOpen(false);
                        }}
                      />
                    ))}
                  </View>

                  <Pressable
                    onPress={() => setIsCustomPickerOpen((current) => !current)}
                    style={styles.customPickerTogglePressable}>
                    {({ pressed }) => (
                      <View
                        style={[
                          styles.customPickerToggle,
                          pressed ? styles.customPickerTogglePressed : null,
                        ]}>
                        <View
                          style={[
                            styles.customPickerBar,
                            isDraftColorValid
                              ? { backgroundColor: normalizedDraftColor }
                              : styles.customPickerBarInvalid,
                          ]}
                        />
                      </View>
                    )}
                  </Pressable>

                  {isCustomPickerOpen ? (
                    <View style={styles.customPickerCard}>
                      <ColorPicker
                        adaptSpectrum
                        style={styles.colorPicker}
                        thumbSize={22}
                        value={normalizedDraftColor}
                        onChangeJS={(colors) => setDraftColorValue(colors.hex)}>
                        <Panel1 style={styles.colorPickerPanel} />
                        <HueSlider style={styles.colorPickerHue} />
                      </ColorPicker>
                    </View>
                  ) : null}
                </View>

                {categoryIconGroups.map((group) => (
                  <View key={group.title} style={styles.iconGroup}>
                    <Text style={styles.iconGroupTitle}>{group.title}</Text>
                    <View style={styles.iconGrid}>
                      {group.iconKeys.map((iconKey) => (
                        <IconOptionButton
                          key={iconKey}
                          accentColorValue={normalizedDraftColor}
                          iconKey={iconKey}
                          isSelected={draftIconKey === iconKey}
                          onPress={() => setDraftIconKey(iconKey)}
                        />
                      ))}
                    </View>
                  </View>
                ))}

                <Pressable
                  disabled={confirmDisabled}
                  onPress={handleConfirm}
                  style={styles.confirmPressable}>
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.confirmButton,
                        confirmDisabled ? styles.confirmButtonDisabled : null,
                        pressed && !confirmDisabled ? styles.confirmButtonPressed : null,
                      ]}>
                      <Text style={styles.confirmLabel}>
                        {sheetState?.mode === 'edit' ? 'Save Category' : 'Confirm & Add'}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </>
  );
}

type CategorySectionProps = {
  items: CategoryItem[];
  onItemPress: (item: CategoryItem) => void;
  title: string;
};

function CategorySection({ items, onItemPress, title }: CategorySectionProps) {
  const styles = createStyles(useAppTheme());

  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <CategoryCard key={item.id} item={item} onPress={() => onItemPress(item)} />
        ))}
      </View>
    </View>
  );
}

type CategoryCardProps = {
  item: CategoryItem;
  onPress: () => void;
};

function CategoryCard({ item, onPress }: CategoryCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const iconPreset = categoryIconCatalog[item.iconKey];

  return (
    <Pressable onPress={onPress} style={styles.cardPressable}>
      {({ pressed }) => (
        <View style={[styles.card, pressed ? styles.cardPressed : null]}>
          <View style={[styles.iconBadge, { backgroundColor: toSoftColor(item.colorValue) }]}>
            <HugeiconsIcon
              color={item.colorValue}
              icon={iconPreset.icon}
              size={20}
              strokeWidth={2.2}
            />
          </View>

          <Text numberOfLines={1} style={styles.cardLabel}>
            {item.label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

type ActionCardProps = {
  icon?: typeof Settings02Icon;
  imageSource?: number;
  label: string;
  onPress: () => void;
  variant?: 'dashed' | 'edit' | 'solid';
};

function ActionCard({
  icon,
  imageSource,
  label,
  onPress,
  variant = 'solid',
}: ActionCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={styles.cardPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            variant === 'dashed' ? styles.cardDashed : null,
            variant === 'edit' ? styles.cardEdit : null,
            pressed ? styles.cardPressed : null,
          ]}>
          <View
            style={[
              styles.actionBadge,
              variant === 'edit' ? styles.actionBadgeEdit : null,
            ]}>
            {imageSource ? (
              <Image contentFit="contain" source={imageSource} style={styles.actionImage} />
            ) : null}

            {icon ? (
              <HugeiconsIcon
                color={variant === 'edit' ? theme.colors.surface : theme.colors.textSecondary}
                icon={icon}
                size={20}
                strokeWidth={2.2}
              />
            ) : null}
          </View>

          <Text numberOfLines={1} style={styles.cardLabel}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

type IconOptionButtonProps = {
  accentColorValue: string;
  iconKey: CategoryIconKey;
  isSelected: boolean;
  onPress: () => void;
};

function IconOptionButton({
  accentColorValue,
  iconKey,
  isSelected,
  onPress,
}: IconOptionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const iconPreset = categoryIconCatalog[iconKey];
  const normalizedColor = normalizeHexColor(accentColorValue);
  const solidColor = isValidHexColor(normalizedColor) ? normalizedColor : theme.colors.primary;
  const softColor = isValidHexColor(normalizedColor)
    ? toSoftColor(normalizedColor)
    : theme.colors.surfaceAlt;

  return (
    <Pressable onPress={onPress} style={styles.iconOptionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.iconOption,
            isSelected ? { backgroundColor: softColor } : styles.iconOptionIdle,
            isSelected
              ? [
                  styles.iconOptionSelected,
                  {
                    borderColor: solidColor,
                    boxShadow: `0 0 0 2px ${softColor}`,
                  },
                ]
              : null,
            pressed ? styles.iconOptionPressed : null,
          ]}>
          <HugeiconsIcon
            color={isSelected ? solidColor : theme.colors.textHint}
            icon={iconPreset.icon}
            size={20}
            strokeWidth={2.2}
          />
        </View>
      )}
    </Pressable>
  );
}

type ColorOptionButtonProps = {
  colorValue: string;
  isSelected: boolean;
  onPress: () => void;
};

function ColorOptionButton({ colorValue, isSelected, onPress }: ColorOptionButtonProps) {
  const styles = createStyles(useAppTheme());

  return (
    <Pressable onPress={onPress} style={styles.colorOptionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.colorOptionOuter,
            isSelected ? { borderColor: colorValue } : null,
            pressed ? styles.colorOptionPressed : null,
          ]}>
          <View style={[styles.colorOptionInner, { backgroundColor: colorValue }]} />
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingTop: spacing.sm,
      paddingRight: spacing.lg,
      paddingBottom: shellMetrics.contentBottomInset,
      paddingLeft: spacing.lg,
    },
    contentColumn: {
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
    },
    sectionSpacer: {
      marginTop: spacing.xxl,
    },
    sectionTitle: {
      ...typography.titleLarge,
      color: theme.colors.textSecondary,
      marginBottom: spacing.sm,
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
      minHeight: 58,
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
      boxShadow: `0 8px 18px ${theme.colors.shadow}`,
    },
    cardDashed: {
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
    },
    cardEdit: {
      borderColor: theme.colors.border,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.985 }],
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
    actionBadge: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
    },
    actionBadgeEdit: {
      backgroundColor: theme.colors.tertiary,
      borderColor: theme.colors.tertiary,
    },
    actionImage: {
      width: 22,
      height: 22,
    },
    cardLabel: {
      flex: 1,
      ...typography.bodyMedium,
      fontFamily: typography.titleMedium.fontFamily,
      color: theme.colors.textSecondary,
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    dismissArea: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    scrim: {
      flex: 1,
      backgroundColor: 'rgba(25, 28, 29, 0.28)',
    },
    sheetContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      borderCurve: 'continuous',
      paddingTop: spacing.xs,
      boxShadow: '0 -12px 24px rgba(0, 0, 0, 0.14)',
      maxHeight: '82%',
    },
    sheetHandle: {
      width: 52,
      height: 5,
      borderRadius: radius.pill,
      alignSelf: 'center',
      backgroundColor: theme.colors.borderAlt,
      marginBottom: spacing.md,
    },
    sheetContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.lg,
    },
    sheetTitle: {
      ...typography.titleLarge,
      color: theme.colors.textSecondary,
    },
    nameInput: {
      ...typography.bodyLarge,
      height: 52,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: 0,
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.surface,
      lineHeight: 22,
      includeFontPadding: false,
    },
    iconGroup: {
      gap: spacing.sm,
    },
    colorGroup: {
      gap: spacing.sm,
    },
    iconGroupTitle: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    customPickerTogglePressable: {
      borderRadius: radius.lg,
    },
    customPickerToggle: {
      minHeight: 48,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
    },
    customPickerTogglePressed: {
      opacity: 0.92,
    },
    customPickerCard: {
      borderRadius: radius.xl,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      padding: spacing.sm,
      gap: spacing.sm,
    },
    customPickerBar: {
      width: '100%',
      height: 18,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: 'rgba(25, 28, 29, 0.08)',
    },
    customPickerBarInvalid: {
      backgroundColor: theme.colors.surfaceAlt,
    },
    colorPicker: {
      width: '100%',
      gap: spacing.sm,
    },
    colorPickerPanel: {
      width: '100%',
      height: 160,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
    },
    colorPickerHue: {
      width: '100%',
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    colorOptionPressable: {
      borderRadius: radius.pill,
    },
    colorOptionOuter: {
      width: 34,
      height: 34,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    colorOptionInner: {
      width: 22,
      height: 22,
      borderRadius: radius.pill,
    },
    colorOptionPressed: {
      opacity: 0.9,
    },
    iconOptionPressable: {
      borderRadius: radius.md,
    },
    iconOption: {
      width: 46,
      height: 46,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(25, 28, 29, 0.08)',
    },
    iconOptionIdle: {
      backgroundColor: theme.colors.surfaceAlt,
    },
    iconOptionSelected: {
      borderWidth: 1,
    },
    iconOptionPressed: {
      opacity: 0.92,
    },
    confirmPressable: {
      borderRadius: radius.lg,
    },
    confirmButton: {
      minHeight: 54,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      boxShadow: '0 10px 20px rgba(245, 124, 0, 0.22)',
    },
    confirmButtonDisabled: {
      opacity: 0.45,
    },
    confirmButtonPressed: {
      opacity: 0.92,
    },
    confirmLabel: {
      ...typography.titleMedium,
      color: theme.colors.surface,
    },
  });
}
