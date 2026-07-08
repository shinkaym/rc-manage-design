import { Add01Icon, ArrowDown01Icon, ArrowUp01Icon, Cancel01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { formatCurrency, getReceiptItemTotal } from '../receipt-item-utils';
import type { ReceiptItemState } from '../receipt-types';

const dialogColumnWidths = {
  actions: 44,
  name: 188,
  price: 96,
  quantity: 84,
  total: 108,
} as const;

const dialogTableMinWidth =
  dialogColumnWidths.name +
  dialogColumnWidths.quantity +
  dialogColumnWidths.price +
  dialogColumnWidths.total +
  dialogColumnWidths.actions +
  spacing.xs * 4;

type HugeIcon = typeof Cancel01Icon;

type ItemsEditDialogProps = {
  isVisible: boolean;
  items: ReceiptItemState[];
  onAddItem: () => void;
  onChangeItem: (
    itemId: string,
    field: keyof Pick<ReceiptItemState, 'name' | 'price' | 'quantity'>,
    value: string,
  ) => void;
  onClose: () => void;
  onDeleteItem: (itemId: string) => void;
  onMoveItem: (itemId: string, direction: 'down' | 'up') => void;
  onSave: () => void;
};

export function ItemsEditDialog({
  isVisible,
  items,
  onAddItem,
  onChangeItem,
  onClose,
  onDeleteItem,
  onMoveItem,
  onSave,
}: ItemsEditDialogProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);
  const [isHorizontalHintDismissed, setIsHorizontalHintDismissed] = useState(false);

  return (
    <Modal transparent animationType='fade' visible={isVisible} onRequestClose={onClose}>
      <View style={styles.dialogBackdrop}>
        <Pressable style={styles.dialogBackdropPressable} onPress={onClose} />

        <View style={styles.dialogCard}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogTitleBlock}>
              <Text style={styles.dialogTitle}>Edit Items</Text>
              <Text style={styles.dialogSubtitle}>
                Edit rows directly, then swipe the table sideways if you need more room.
              </Text>
            </View>

            <DialogSurfaceIconButton icon={Cancel01Icon} onPress={onClose} />
          </View>

          <Pressable onPress={onAddItem} style={styles.addItemPressable}>
            {({ pressed }) => (
              <View style={[styles.addItemButton, pressed ? styles.addItemButtonPressed : null]}>
                <HugeiconsIcon icon={Add01Icon} color='#FFFFFF' size={18} strokeWidth={1.9} />
                <Text style={styles.addItemLabel}>Add Item</Text>
              </View>
            )}
          </Pressable>

          {!isHorizontalHintDismissed ? (
            <Pressable onPress={() => setIsHorizontalHintDismissed(true)} style={styles.horizontalHintPressable}>
              {({ pressed }) => (
                <View style={[styles.horizontalHint, pressed ? styles.horizontalHintPressed : null]}>
                  <Text style={styles.horizontalHintText}>Swipe sideways to see all item columns</Text>
                </View>
              )}
            </Pressable>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalTableContent}
          >
            <View style={styles.tableCanvas}>
              <View style={styles.dialogTableHeader}>
                <TableHeaderCell label='NAME' width={dialogColumnWidths.name} />
                <TableHeaderCell centered label='QTY' width={dialogColumnWidths.quantity} />
                <TableHeaderCell centered label='PRICE' width={dialogColumnWidths.price} />
                <TableHeaderCell align='right' label='TOTAL' width={dialogColumnWidths.total} />
                <TableHeaderCell align='center' label='' width={dialogColumnWidths.actions} />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.dialogRowsScroll}
                contentContainerStyle={styles.dialogRowsContent}
              >
                {items.map((item, index) => (
                  <View key={item.id} style={styles.dialogItemRow}>
                    <View style={[styles.dialogCell, styles.dialogNameColumn]}>
                      <DialogInput
                        value={item.name}
                        onChangeText={(value) => onChangeItem(item.id, 'name', value)}
                        placeholder='Item name'
                      />
                    </View>

                    <View style={[styles.dialogCell, styles.dialogQuantityColumn]}>
                      <DialogInput
                        value={item.quantity}
                        onChangeText={(value) => onChangeItem(item.id, 'quantity', value)}
                        placeholder='0'
                        keyboardType='number-pad'
                        textAlign='center'
                      />
                    </View>

                    <View style={[styles.dialogCell, styles.dialogPriceColumn]}>
                      <DialogInput
                        value={item.price}
                        onChangeText={(value) => onChangeItem(item.id, 'price', value)}
                        placeholder='0.00'
                        keyboardType='decimal-pad'
                        textAlign='center'
                      />
                    </View>

                    <View style={[styles.dialogCell, styles.dialogTotalColumn]}>
                      <Text style={styles.dialogItemTotalText}>{formatCurrency(getReceiptItemTotal(item))}</Text>
                    </View>

                    <View style={[styles.dialogCell, styles.dialogActionsColumn]}>
                      <IconMiniButton
                        disabled={index === 0}
                        icon={ArrowUp01Icon}
                        onPress={() => onMoveItem(item.id, 'up')}
                      />
                      <IconMiniButton
                        disabled={index === items.length - 1}
                        icon={ArrowDown01Icon}
                        onPress={() => onMoveItem(item.id, 'down')}
                      />
                      <IconMiniButton
                        destructive
                        disabled={items.length <= 1}
                        icon={Delete02Icon}
                        onPress={() => onDeleteItem(item.id)}
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.dialogFooter}>
            <Pressable onPress={onClose} style={styles.dialogFooterSecondaryPressable}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.dialogFooterSecondaryButton,
                    pressed ? styles.dialogFooterSecondaryButtonPressed : null,
                  ]}
                >
                  <Text style={styles.dialogFooterSecondaryLabel}>Cancel</Text>
                </View>
              )}
            </Pressable>

            <Pressable onPress={onSave} style={styles.dialogFooterPrimaryPressable}>
              {({ pressed }) => (
                <View
                  style={[styles.dialogFooterPrimaryButton, pressed ? styles.dialogFooterPrimaryButtonPressed : null]}
                >
                  <Text style={styles.dialogFooterPrimaryLabel}>Save Items</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type DialogInputProps = {
  keyboardType?: 'decimal-pad' | 'default' | 'number-pad';
  onChangeText: (value: string) => void;
  placeholder: string;
  textAlign?: 'center' | 'left' | 'right';
  value: string;
};

function DialogInput({
  keyboardType = 'default',
  onChangeText,
  placeholder,
  textAlign = 'left',
  value,
}: DialogInputProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textHint}
      textAlign={textAlign}
      style={styles.dialogInput}
    />
  );
}

type TableHeaderCellProps = {
  align?: 'center' | 'left' | 'right';
  centered?: boolean;
  label: string;
  width: number;
};

function TableHeaderCell({ align = 'left', centered = false, label, width }: TableHeaderCellProps) {
  const styles = createStyles(useAppTheme(), 0);
  const textAlign = centered ? 'center' : align;

  return (
    <View style={[styles.dialogHeaderCell, { width }]}>
      <Text style={[styles.dialogTableHeaderText, { textAlign }]}>{label}</Text>
    </View>
  );
}

type DialogSurfaceIconButtonProps = {
  icon: HugeIcon;
  onPress: () => void;
};

function DialogSurfaceIconButton({ icon, onPress }: DialogSurfaceIconButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0);

  return (
    <Pressable onPress={onPress} style={styles.surfaceIconPressable}>
      {({ pressed }) => (
        <View style={[styles.surfaceIconButton, pressed ? styles.surfaceIconButtonPressed : null]}>
          <HugeiconsIcon icon={icon} color={theme.colors.primary} size={20} strokeWidth={2} />
        </View>
      )}
    </Pressable>
  );
}

type IconMiniButtonProps = {
  destructive?: boolean;
  disabled?: boolean;
  icon: HugeIcon;
  onPress: () => void;
};

function IconMiniButton({ destructive = false, disabled = false, icon, onPress }: IconMiniButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0);
  const color = destructive ? theme.colors.danger : theme.colors.secondary;

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.iconMiniPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.iconMiniButton,
            disabled ? styles.iconMiniButtonDisabled : null,
            pressed && !disabled ? styles.iconMiniButtonPressed : null,
          ]}
        >
          <HugeiconsIcon icon={icon} color={disabled ? theme.colors.textHint : color} size={14} strokeWidth={1.9} />
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, bottomInset: number) {
  return StyleSheet.create({
    dialogBackdrop: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      backgroundColor: 'rgba(17, 24, 39, 0.38)',
    },
    dialogBackdropPressable: {
      ...StyleSheet.absoluteFillObject,
    },
    dialogCard: {
      maxHeight: '90%',
      borderRadius: radius.xl,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surface,
      padding: spacing.lg,
      boxShadow: '0 16px 40px rgba(17, 24, 39, 0.16)',
      gap: spacing.md,
    },
    dialogHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    dialogTitleBlock: {
      flex: 1,
    },
    dialogTitle: {
      ...typography.headlineMedium,
      color: theme.colors.textSecondary,
    },
    dialogSubtitle: {
      ...typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: spacing.xxs,
    },
    surfaceIconPressable: {
      borderRadius: radius.pill,
    },
    surfaceIconButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: theme.colors.surface,
      boxShadow: `0 4px 8px ${theme.colors.shadow}`,
    },
    surfaceIconButtonPressed: {
      opacity: 0.9,
    },
    addItemPressable: {
      alignSelf: 'flex-start',
      borderRadius: radius.lg,
    },
    addItemButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
    },
    addItemButtonPressed: {
      opacity: 0.9,
    },
    addItemLabel: {
      ...typography.titleMedium,
      color: '#FFFFFF',
    },
    horizontalHintPressable: {
      alignSelf: 'flex-start',
      borderRadius: radius.md,
    },
    horizontalHint: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(245, 124, 0, 0.10)',
    },
    horizontalHintPressed: {
      opacity: 0.86,
    },
    horizontalHintText: {
      ...typography.labelLarge,
      color: theme.colors.secondary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    horizontalTableContent: {
      paddingBottom: spacing.xs,
    },
    tableCanvas: {
      minWidth: dialogTableMinWidth,
    },
    dialogTableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingBottom: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(225, 227, 228, 0.9)',
    },
    dialogHeaderCell: {
      justifyContent: 'center',
    },
    dialogTableHeaderText: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      letterSpacing: 0.5,
    },
    dialogRowsScroll: {
      maxHeight: 360,
    },
    dialogRowsContent: {
      gap: spacing.sm,
      paddingTop: spacing.sm,
    },
    dialogItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    dialogCell: {
      justifyContent: 'center',
    },
    dialogNameColumn: {
      width: dialogColumnWidths.name,
    },
    dialogQuantityColumn: {
      width: dialogColumnWidths.quantity,
    },
    dialogPriceColumn: {
      width: dialogColumnWidths.price,
    },
    dialogTotalColumn: {
      width: dialogColumnWidths.total,
    },
    dialogActionsColumn: {
      width: dialogColumnWidths.actions,
      alignItems: 'center',
      gap: spacing.xxs,
    },
    dialogInput: {
      minHeight: 38,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.textSecondary,
      ...typography.bodyMedium,
    },
    dialogItemTotalText: {
      ...typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'right',
    },
    iconMiniPressable: {
      borderRadius: radius.sm,
    },
    iconMiniButton: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
    },
    iconMiniButtonDisabled: {
      opacity: 0.45,
    },
    iconMiniButtonPressed: {
      opacity: 0.84,
    },
    dialogFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.xs,
      paddingBottom: bottomInset > 0 ? bottomInset : 0,
    },
    dialogFooterSecondaryPressable: {
      flex: 1,
      borderRadius: radius.lg,
    },
    dialogFooterSecondaryButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1.5,
      borderColor: theme.colors.secondary,
      backgroundColor: theme.colors.surface,
    },
    dialogFooterSecondaryButtonPressed: {
      opacity: 0.9,
    },
    dialogFooterSecondaryLabel: {
      ...typography.titleMedium,
      color: theme.colors.secondary,
    },
    dialogFooterPrimaryPressable: {
      flex: 1.6,
      borderRadius: radius.lg,
    },
    dialogFooterPrimaryButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
      boxShadow: '0 8px 18px rgba(245, 124, 0, 0.24)',
    },
    dialogFooterPrimaryButtonPressed: {
      opacity: 0.92,
    },
    dialogFooterPrimaryLabel: {
      ...typography.titleMedium,
      color: '#FFFFFF',
    },
  });
}
