import {
  Cash01Icon,
  CreditCardIcon,
  Edit02Icon,
  Note01Icon,
  Payment01Icon,
  PencilEdit02Icon,
  ShoppingBag01Icon,
  Store04Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/features/category/components/category-badge';
import { CategoryPickerSheet } from '@/features/category/components/category-picker-sheet';
import { SegmentTabs } from '@/features/receipts/components/segment-tabs';
import { defaultCategorySeed, type CategoryItem } from '@/mock/category-data';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { ItemsEditDialog } from '../../features/receipts/components/items-edit-dialog';
import {
  createEmptyReceiptItem,
  formatCurrency,
  getReceiptItemTotal,
  initialReceiptItems,
  moveItemByDirection,
  parseCurrencyValue,
  sanitizeCurrencyInput,
  sanitizeIntegerInput,
} from '../../features/receipts/receipt-item-utils';
import type { ReceiptItemState } from '../../features/receipts/receipt-types';

const footerHeight = 116;

type HugeIcon = typeof Store04Icon;
type PaymentMethod = 'cash' | 'card';
type TotalFieldKey = 'discount' | 'tax' | 'tips';

type MerchantFormState = {
  address: string;
  date: string;
  name: string;
  phone: string;
};

type CardFormState = {
  cardPlaceholder: string;
  lastFourDigits: string;
};

type TotalsFormState = Record<TotalFieldKey, string>;
type EditableTotalsState = Record<TotalFieldKey, boolean>;

export function ReceiptPreviewScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);

  const [merchant, setMerchant] = useState<MerchantFormState>({
    name: 'Shell Gas Station',
    phone: '(555) 019-2837',
    date: 'Oct 24, 2023 - 14:30',
    address: '123 Market St, Suite 400',
  });
  const [isMerchantEditing, setIsMerchantEditing] = useState(false);
  const [isMerchantCategoryPickerVisible, setIsMerchantCategoryPickerVisible] = useState(false);
  const [merchantCategory, setMerchantCategory] = useState<CategoryItem>(defaultCategorySeed[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardForm, setCardForm] = useState<CardFormState>({
    cardPlaceholder: 'VISA',
    lastFourDigits: '4224',
  });
  const [items, setItems] = useState<ReceiptItemState[]>(initialReceiptItems);
  const [itemDrafts, setItemDrafts] = useState<ReceiptItemState[]>(initialReceiptItems);
  const [isItemsDialogVisible, setIsItemsDialogVisible] = useState(false);
  const [note, setNote] = useState('Fill up');
  const [totals, setTotals] = useState<TotalsFormState>({
    tax: '12.00',
    tips: '12.00',
    discount: '0.00',
  });
  const [editableTotals, setEditableTotals] = useState<EditableTotalsState>({
    tax: false,
    tips: false,
    discount: false,
  });

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + getReceiptItemTotal(item), 0), [items]);
  const taxValue = parseCurrencyValue(totals.tax);
  const tipsValue = parseCurrencyValue(totals.tips);
  const discountValue = parseCurrencyValue(totals.discount);
  const totalAmount = subtotal + taxValue + tipsValue - discountValue;
  const paymentMethodTabs = [
    { icon: Cash01Icon, label: 'Cash', value: 'cash' as const },
    { icon: CreditCardIcon, label: 'Card', value: 'card' as const },
  ];

  function handleMerchantFieldChange(field: keyof MerchantFormState, value: string) {
    setMerchant((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  }

  function handleCardFieldChange(field: keyof CardFormState, value: string) {
    setCardForm((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  }

  function handleTotalFieldChange(field: TotalFieldKey, value: string) {
    setTotals((currentValue) => ({
      ...currentValue,
      [field]: sanitizeCurrencyInput(value),
    }));
  }

  function handleEnableTotalEdit(field: TotalFieldKey) {
    setEditableTotals((currentValue) => {
      if (currentValue[field]) {
        return currentValue;
      }

      return {
        ...currentValue,
        [field]: true,
      };
    });
  }

  function handleOpenItemsDialog() {
    setItemDrafts(items.map((item) => ({ ...item })));
    setIsItemsDialogVisible(true);
  }

  function handleCloseItemsDialog() {
    setIsItemsDialogVisible(false);
    setItemDrafts(items.map((item) => ({ ...item })));
  }

  function handleSaveItemsDialog() {
    const sanitizedItems = itemDrafts.map((item) => ({
      ...item,
      name: item.name.trim() || 'Untitled item',
      quantity: sanitizeIntegerInput(item.quantity) || '0',
      price: sanitizeCurrencyInput(item.price) || '0',
    }));

    setItems(sanitizedItems);
    setItemDrafts(sanitizedItems.map((item) => ({ ...item })));
    setIsItemsDialogVisible(false);
  }

  function handleItemDraftChange(
    itemId: string,
    field: keyof Pick<ReceiptItemState, 'name' | 'price' | 'quantity'>,
    value: string,
  ) {
    setItemDrafts((currentValue) =>
      currentValue.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        if (field === 'quantity') {
          return {
            ...item,
            quantity: sanitizeIntegerInput(value),
          };
        }

        if (field === 'price') {
          return {
            ...item,
            price: sanitizeCurrencyInput(value),
          };
        }

        return {
          ...item,
          name: value,
        };
      }),
    );
  }

  function handleDeleteItemDraft(itemId: string) {
    setItemDrafts((currentValue) => currentValue.filter((item) => item.id !== itemId));
  }

  function handleMoveItemDraft(itemId: string, direction: 'down' | 'up') {
    setItemDrafts((currentValue) => moveItemByDirection(currentValue, itemId, direction));
  }

  function handleAddItemDraft() {
    setItemDrafts((currentValue) => [...currentValue, createEmptyReceiptItem()]);
  }

  function handleSelectMerchantCategory(category: CategoryItem) {
    setMerchantCategory(category);
    setIsMerchantCategoryPickerVisible(false);
  }

  function handleCancel() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/scan');
  }

  return (
    <>
      <StatusBar style='dark' />
      <View style={styles.screen}>
        <ScrollView
          contentInsetAdjustmentBehavior='automatic'
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <SectionCard>
            <View style={styles.merchantGlow} />
            <SectionHeader
              icon={Store04Icon}
              title='Merchant'
              trailing={
                <SectionEditButton
                  disabled={isMerchantEditing}
                  label='Edit'
                  onPress={() => setIsMerchantEditing(true)}
                />
              }
            />

            {isMerchantEditing ? (
              <View style={styles.sectionBody}>
                <View style={styles.merchantNameInputRow}>
                  <View style={styles.merchantBadgeColumn}>
                    <CategoryBadge
                      category={merchantCategory}
                      onPress={() => setIsMerchantCategoryPickerVisible(true)}
                    />
                    <Text style={styles.badgeHintText}>Tap to change</Text>
                  </View>
                  <View style={styles.merchantNameInputColumn}>
                    <Text style={styles.fieldLabel}>NAME</Text>
                    <ReceiptInput
                      value={merchant.name}
                      onChangeText={(value) => handleMerchantFieldChange('name', value)}
                      placeholder='Merchant name'
                    />
                  </View>
                </View>

                <View style={styles.twoColumnRow}>
                  <View style={styles.columnField}>
                    <Text style={styles.fieldLabel}>PHONE</Text>
                    <ReceiptInput
                      value={merchant.phone}
                      onChangeText={(value) => handleMerchantFieldChange('phone', value)}
                      placeholder='Phone'
                    />
                  </View>

                  <View style={styles.columnField}>
                    <Text style={styles.fieldLabel}>DATE</Text>
                    <MerchantDateField value={merchant.date} onPress={() => {}} />
                  </View>
                </View>

                <View style={styles.fullWidthField}>
                  <Text style={styles.fieldLabel}>ADDRESS</Text>
                  <ReceiptInput
                    value={merchant.address}
                    onChangeText={(value) => handleMerchantFieldChange('address', value)}
                    placeholder='Address'
                    multiline
                  />
                </View>
              </View>
            ) : (
              <View style={styles.sectionBody}>
                <View style={styles.merchantIdentityRow}>
                  <CategoryBadge category={merchantCategory} />
                  <View style={styles.merchantIdentityText}>
                    <Text style={styles.fieldLabel}>NAME</Text>
                    <Text style={styles.fieldValue}>{merchant.name}</Text>
                    <Text style={styles.merchantCategoryValue}>{merchantCategory.label}</Text>
                  </View>
                </View>

                <View style={styles.twoColumnRow}>
                  <DisplayField label='PHONE' value={merchant.phone} />
                  <DisplayField label='DATE' value={merchant.date} />
                </View>

                <DisplayField label='ADDRESS' value={merchant.address} />
              </View>
            )}
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={ShoppingBag01Icon}
              title='Items'
              trailing={<SectionEditButton label='Edit' onPress={handleOpenItemsDialog} />}
            />

            <View style={styles.sectionBody}>
              <View style={styles.itemsHeaderRow}>
                <View style={styles.itemNameColumn}>
                  <Text style={styles.tableHeaderText}>NAME</Text>
                </View>
                <View style={styles.itemQuantityColumn}>
                  <Text style={[styles.tableHeaderText, styles.tableHeaderCentered]}>QTY</Text>
                </View>
                <View style={styles.itemPriceColumn}>
                  <Text style={[styles.tableHeaderText, styles.tableHeaderCentered]}>PRICE</Text>
                </View>
                <View style={styles.itemTotalColumn}>
                  <Text style={[styles.tableHeaderText, styles.tableHeaderAlignedRight]}>TOTAL</Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {items.map((item, index) => (
                  <View
                    key={item.id}
                    style={[styles.itemRow, index !== items.length - 1 ? styles.itemRowDivider : null]}
                  >
                    <View style={styles.itemNameColumn}>
                      <Text style={styles.itemValueText}>{item.name}</Text>
                    </View>
                    <View style={styles.itemQuantityColumn}>
                      <Text style={[styles.itemValueText, styles.itemValueCentered]}>{item.quantity || '0'}</Text>
                    </View>
                    <View style={styles.itemPriceColumn}>
                      <Text style={[styles.itemValueText, styles.itemValueCentered]}>
                        {formatCurrency(parseCurrencyValue(item.price))}
                      </Text>
                    </View>
                    <View style={styles.itemTotalColumn}>
                      <Text style={[styles.itemValueText, styles.itemValueAlignedRight]}>
                        {formatCurrency(getReceiptItemTotal(item))}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={Payment01Icon}
              title='Payment Method'
              trailing={
                <View style={styles.paymentMethodTabsWrap}>
                  <SegmentTabs items={paymentMethodTabs} selectedValue={paymentMethod} onChange={setPaymentMethod} />
                </View>
              }
            />

            {paymentMethod === 'card' ? (
              <View style={styles.paymentInputsRow}>
                <View style={styles.columnField}>
                  <Text style={styles.fieldLabel}>Card Placeholder</Text>
                  <ReceiptInput
                    value={cardForm.cardPlaceholder}
                    onChangeText={(value) => handleCardFieldChange('cardPlaceholder', value)}
                    placeholder='Card placeholder'
                  />
                </View>

                <View style={styles.columnField}>
                  <Text style={styles.fieldLabel}>Last 4 Digits</Text>
                  <ReceiptInput
                    value={cardForm.lastFourDigits}
                    onChangeText={(value) => handleCardFieldChange('lastFourDigits', value)}
                    placeholder='Last 4 digits'
                  />
                </View>
              </View>
            ) : null}
          </SectionCard>

          <SectionCard>
            <SectionHeader icon={Note01Icon} title='Note' />

            <View style={styles.sectionBody}>
              <ReceiptInput value={note} onChangeText={setNote} placeholder='Write a note' multiline />
            </View>
          </SectionCard>

          <SectionCard>
            <View style={styles.totalsRows}>
              <EditableTotalRow
                isEditing={editableTotals.tax}
                label='Tax'
                value={totals.tax}
                onChangeText={(value) => handleTotalFieldChange('tax', value)}
                onEdit={() => handleEnableTotalEdit('tax')}
              />
              <EditableTotalRow
                isEditing={editableTotals.tips}
                label='Tips'
                value={totals.tips}
                onChangeText={(value) => handleTotalFieldChange('tips', value)}
                onEdit={() => handleEnableTotalEdit('tips')}
              />
              <EditableTotalRow
                isEditing={editableTotals.discount}
                label='Discount'
                value={totals.discount}
                onChangeText={(value) => handleTotalFieldChange('discount', value)}
                onEdit={() => handleEnableTotalEdit('discount')}
                isNegative
              />
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.amountSummaryRow}>
              <View>
                <Text style={styles.amountSummaryLabel}>TOTAL AMOUNT</Text>
                <Text style={styles.totalAmountValue}>{formatCurrency(totalAmount)}</Text>
              </View>

              <View style={styles.subtotalSummaryBlock}>
                <Text style={styles.amountSummaryLabel}>SUBTOTAL</Text>
                <Text style={styles.subtotalAmountValue}>{formatCurrency(subtotal)}</Text>
              </View>
            </View>
          </SectionCard>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={handleCancel} style={styles.footerSecondaryPressable}>
            {({ pressed }) => (
              <View style={[styles.footerSecondaryButton, pressed ? styles.footerSecondaryButtonPressed : null]}>
                <Text style={styles.footerSecondaryLabel}>Cancel</Text>
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => {}} style={styles.footerPrimaryPressable}>
            {({ pressed }) => (
              <View style={[styles.footerPrimaryButton, pressed ? styles.footerPrimaryButtonPressed : null]}>
                <Text style={styles.footerPrimaryLabel}>Confirm & Add</Text>
              </View>
            )}
          </Pressable>
        </View>

        <ItemsEditDialog
          items={itemDrafts}
          isVisible={isItemsDialogVisible}
          onAddItem={handleAddItemDraft}
          onChangeItem={handleItemDraftChange}
          onClose={handleCloseItemsDialog}
          onDeleteItem={handleDeleteItemDraft}
          onMoveItem={handleMoveItemDraft}
          onSave={handleSaveItemsDialog}
        />

        <CategoryPickerSheet
          isVisible={isMerchantCategoryPickerVisible}
          onClose={() => setIsMerchantCategoryPickerVisible(false)}
          onSelect={handleSelectMerchantCategory}
          selectedCategoryId={merchantCategory.id}
        />
      </View>
    </>
  );
}

type SectionCardProps = {
  children: ReactNode;
};

function SectionCard({ children }: SectionCardProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return <View style={styles.sectionCard}>{children}</View>;
}

type SectionHeaderProps = {
  icon: HugeIcon;
  title: string;
  trailing?: ReactNode;
};

function SectionHeader({ icon, title, trailing }: SectionHeaderProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <HugeiconsIcon icon={icon} color={theme.colors.secondary} size={22} strokeWidth={1.9} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {trailing ? <View style={styles.sectionHeaderTrailing}>{trailing}</View> : null}
    </View>
  );
}

type SectionEditButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

function SectionEditButton({ disabled = false, label, onPress }: SectionEditButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.sectionEditPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.sectionEditButton,
            disabled ? styles.sectionEditButtonDisabled : null,
            pressed && !disabled ? styles.sectionEditButtonPressed : null,
          ]}
        >
          <HugeiconsIcon
            icon={Edit02Icon}
            color={disabled ? theme.colors.textHint : theme.colors.secondary}
            size={14}
            strokeWidth={1.9}
          />
          <Text style={[styles.sectionEditLabel, disabled ? styles.sectionEditLabelDisabled : null]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

type MerchantDateFieldProps = {
  onPress: () => void;
  value: string;
};

function MerchantDateField({ onPress, value }: MerchantDateFieldProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable onPress={onPress} style={styles.dateFieldPressable}>
      {({ pressed }) => (
        <View style={[styles.dateField, pressed ? styles.dateFieldPressed : null]}>
          <Text style={styles.dateFieldValue}>{value}</Text>
          <HugeiconsIcon icon={PencilEdit02Icon} color={theme.colors.secondary} size={16} strokeWidth={1.8} />
        </View>
      )}
    </Pressable>
  );
}

type DisplayFieldProps = {
  label: string;
  value: string;
};

function DisplayField({ label, value }: DisplayFieldProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <View style={styles.displayField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

type ReceiptInputProps = {
  keyboardType?: 'decimal-pad' | 'default' | 'number-pad';
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function ReceiptInput({
  keyboardType = 'default',
  multiline = false,
  onChangeText,
  placeholder,
  value,
}: ReceiptInputProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textHint}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[styles.receiptInput, multiline ? styles.receiptInputMultiline : null]}
    />
  );
}

type EditableTotalRowProps = {
  isEditing: boolean;
  isNegative?: boolean;
  label: string;
  onChangeText: (value: string) => void;
  onEdit: () => void;
  value: string;
};

function EditableTotalRow({
  isEditing,
  isNegative = false,
  label,
  onChangeText,
  onEdit,
  value,
}: EditableTotalRowProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);
  const formattedValue = isNegative
    ? `-${formatCurrency(parseCurrencyValue(value))}`
    : formatCurrency(parseCurrencyValue(value));

  return (
    <View style={styles.totalRow}>
      <Text style={styles.totalRowLabel}>{label}</Text>

      {isEditing ? (
        <View style={styles.totalInputWrapper}>
          <Text style={styles.totalInputPrefix}>{isNegative ? '-$' : '$'}</Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType='decimal-pad'
            textAlign='right'
            placeholder='0.00'
            placeholderTextColor={theme.colors.textHint}
            style={styles.totalInput}
          />
        </View>
      ) : (
        <View style={styles.totalDisplay}>
          <Text style={styles.totalValueText}>{formattedValue}</Text>
          <Pressable onPress={onEdit} style={styles.totalEditPressable}>
            {({ pressed }) => (
              <View style={pressed ? styles.totalEditPressed : null}>
                <HugeiconsIcon icon={PencilEdit02Icon} color={theme.colors.secondary} size={16} strokeWidth={1.9} />
              </View>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, topInset: number, bottomInset: number) {
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
      paddingBottom: footerHeight + bottomInset + spacing.xl,
      paddingLeft: spacing.lg,
      gap: spacing.md,
    },
    draftBadge: {
      minWidth: 56,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
      alignItems: 'center',
    },
    draftBadgeText: {
      ...typography.labelLarge,
      color: theme.colors.textSecondary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    sectionCard: {
      overflow: 'hidden',
      padding: spacing.md,
      borderRadius: radius.xl,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: 'rgba(225, 227, 228, 0.9)',
      backgroundColor: theme.colors.surface,
      boxShadow: '0 10px 24px rgba(17, 24, 39, 0.06)',
      gap: spacing.md,
    },
    merchantGlow: {
      position: 'absolute',
      top: -52,
      right: -36,
      width: 168,
      height: 168,
      borderRadius: radius.xxxl,
      backgroundColor: 'rgba(245, 124, 0, 0.08)',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexShrink: 1,
    },
    sectionTitle: {
      ...typography.titleLarge,
      color: theme.colors.textSecondary,
      flexShrink: 1,
    },
    sectionHeaderTrailing: {
      marginLeft: spacing.sm,
    },
    paymentMethodTabsWrap: {
      width: 150,
    },
    sectionEditPressable: {
      borderRadius: radius.md,
    },
    sectionEditButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      borderRadius: radius.md,
      borderCurve: 'continuous',
    },
    sectionEditButtonDisabled: {
      backgroundColor: theme.colors.surfaceAlt,
    },
    sectionEditButtonPressed: {
      opacity: 0.84,
    },
    sectionEditLabel: {
      ...typography.labelLarge,
      color: theme.colors.secondary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    sectionEditLabelDisabled: {
      color: theme.colors.textHint,
    },
    sectionBody: {
      gap: spacing.md,
    },
    merchantIdentityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    merchantIdentityText: {
      flex: 1,
      gap: spacing.xxs,
    },
    merchantCategoryValue: {
      ...typography.bodyMedium,
      color: theme.colors.textTertiary,
    },
    merchantNameInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    merchantBadgeColumn: {
      alignItems: 'center',
      gap: spacing.xxs,
    },
    merchantNameInputColumn: {
      flex: 1,
      gap: spacing.xxs,
    },
    badgeHintText: {
      ...typography.labelLarge,
      color: theme.colors.textHint,
    },
    dateFieldPressable: {
      borderRadius: radius.md,
    },
    dateField: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
      gap: spacing.sm,
    },
    dateFieldPressed: {
      opacity: 0.9,
    },
    dateFieldValue: {
      ...typography.bodyMedium,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    twoColumnRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    columnField: {
      flex: 1,
      gap: spacing.xxs,
    },
    fullWidthField: {
      gap: spacing.xxs,
    },
    displayField: {
      flex: 1,
      gap: spacing.xxs,
    },
    fieldLabel: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      letterSpacing: 0.5,
    },
    fieldValue: {
      ...typography.bodyLarge,
      color: theme.colors.textSecondary,
    },
    receiptInput: {
      minHeight: 36,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.textSecondary,
      ...typography.bodyLarge,
    },
    receiptInputMultiline: {
      minHeight: 92,
    },
    itemsHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    tableHeaderText: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      letterSpacing: 0.5,
    },
    tableHeaderCentered: {
      textAlign: 'center',
    },
    tableHeaderAlignedRight: {
      textAlign: 'right',
    },
    itemsList: {
      borderTopWidth: 1,
      borderTopColor: 'rgba(225, 227, 228, 0.7)',
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
    },
    itemRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(225, 227, 228, 0.7)',
    },
    itemNameColumn: {
      flex: 1.7,
    },
    itemQuantityColumn: {
      flex: 0.7,
    },
    itemPriceColumn: {
      flex: 1,
    },
    itemTotalColumn: {
      flex: 1,
    },
    itemValueText: {
      ...typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    itemValueCentered: {
      textAlign: 'center',
    },
    itemValueAlignedRight: {
      textAlign: 'right',
    },
    paymentInputsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    totalsRows: {
      gap: spacing.md,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    totalRowLabel: {
      ...typography.bodyLarge,
      color: theme.colors.textTertiary,
    },
    totalDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    totalValueText: {
      ...typography.titleMedium,
      color: theme.colors.textTertiary,
    },
    totalEditPressable: {
      borderRadius: radius.sm,
    },
    totalEditPressed: {
      opacity: 0.84,
    },
    totalInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 126,
      maxWidth: 148,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
    },
    totalInputPrefix: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    totalInput: {
      flex: 1,
      minHeight: 40,
      color: theme.colors.textSecondary,
      ...typography.titleMedium,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: 'rgba(225, 227, 228, 0.95)',
    },
    amountSummaryRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    amountSummaryLabel: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      letterSpacing: 0.5,
    },
    totalAmountValue: {
      ...typography.displayLarge,
      color: theme.colors.secondary,
      marginTop: spacing.xxs,
    },
    subtotalSummaryBlock: {
      alignItems: 'flex-end',
    },
    subtotalAmountValue: {
      ...typography.headlineMedium,
      color: theme.colors.textSecondary,
      marginTop: spacing.xxs,
    },
    footer: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      left: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingTop: spacing.md,
      paddingRight: spacing.lg,
      paddingBottom: bottomInset > 0 ? bottomInset + spacing.sm : spacing.md,
      paddingLeft: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: 'rgba(225, 227, 228, 0.9)',
      backgroundColor: 'rgba(253, 253, 248, 0.98)',
    },
    footerSecondaryPressable: {
      flex: 1,
      borderRadius: radius.lg,
    },
    footerSecondaryButton: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1.5,
      borderColor: theme.colors.secondary,
      backgroundColor: theme.colors.surface,
    },
    footerSecondaryButtonPressed: {
      opacity: 0.9,
    },
    footerSecondaryLabel: {
      ...typography.titleMedium,
      color: theme.colors.secondary,
    },
    footerPrimaryPressable: {
      flex: 1.7,
      borderRadius: radius.lg,
    },
    footerPrimaryButton: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
      boxShadow: '0 8px 18px rgba(245, 124, 0, 0.28)',
    },
    footerPrimaryButtonPressed: {
      opacity: 0.92,
    },
    footerPrimaryLabel: {
      ...typography.titleMedium,
      color: '#FFFFFF',
    },
  });
}
