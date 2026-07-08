import {
  ArrowLeft01Icon,
  Cash01Icon,
  CreditCardIcon,
  Drag04Icon,
  Edit02Icon,
  Note01Icon,
  Payment01Icon,
  PencilEdit02Icon,
  ShoppingBag01Icon,
  Store04Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

const receiptItemsSeed = [
  { id: 'fuel', name: 'Fuel', quantity: 1, price: 5 },
  { id: 'water', name: 'Sparkling Water', quantity: 2, price: 3.5 },
  { id: 'snack', name: 'Protein Snack', quantity: 1, price: 6.25 },
] as const;

const footerHeight = 116;

type HugeIcon = typeof ArrowLeft01Icon;
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardForm, setCardForm] = useState<CardFormState>({
    cardPlaceholder: 'VISA',
    lastFourDigits: '4224',
  });
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

  const subtotal = useMemo(
    () =>
      receiptItemsSeed.reduce((sum, item) => sum + item.quantity * item.price, 0),
    []
  );
  const taxValue = parseCurrencyValue(totals.tax);
  const tipsValue = parseCurrencyValue(totals.tips);
  const discountValue = parseCurrencyValue(totals.discount);
  const totalAmount = subtotal + taxValue + tipsValue - discountValue;

  function handleMerchantFieldChange(
    field: keyof MerchantFormState,
    value: string
  ) {
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

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerCard}>
            <HeaderIconButton icon={ArrowLeft01Icon} onPress={() => router.back()} />

            <View style={styles.headerTitleBlock}>
              <Text style={styles.headerTitle}>Review Receipt</Text>
            </View>

            <View style={styles.draftBadge}>
              <Text style={styles.draftBadgeText}>Draft</Text>
            </View>
          </View>

          <SectionCard>
            <View style={styles.merchantGlow} />
            <SectionHeader
              icon={Store04Icon}
              title="Merchant"
              trailing={
                <SectionEditButton
                  disabled={isMerchantEditing}
                  label="Edit"
                  onPress={() => setIsMerchantEditing(true)}
                />
              }
            />

            {isMerchantEditing ? (
              <View style={styles.sectionBody}>
                <View style={styles.merchantNameInputRow}>
                  <MerchantBadge />
                  <View style={styles.merchantNameInputColumn}>
                    <Text style={styles.fieldLabel}>NAME</Text>
                    <ReceiptInput
                      value={merchant.name}
                      onChangeText={(value) => handleMerchantFieldChange('name', value)}
                      placeholder="Merchant name"
                    />
                  </View>
                </View>

                <View style={styles.twoColumnRow}>
                  <View style={styles.columnField}>
                    <Text style={styles.fieldLabel}>PHONE</Text>
                    <ReceiptInput
                      value={merchant.phone}
                      onChangeText={(value) => handleMerchantFieldChange('phone', value)}
                      placeholder="Phone"
                    />
                  </View>

                  <View style={styles.columnField}>
                    <Text style={styles.fieldLabel}>DATE</Text>
                    <ReceiptInput
                      value={merchant.date}
                      onChangeText={(value) => handleMerchantFieldChange('date', value)}
                      placeholder="Date"
                    />
                  </View>
                </View>

                <View style={styles.fullWidthField}>
                  <Text style={styles.fieldLabel}>ADDRESS</Text>
                  <ReceiptInput
                    value={merchant.address}
                    onChangeText={(value) => handleMerchantFieldChange('address', value)}
                    placeholder="Address"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.sectionBody}>
                <View style={styles.merchantIdentityRow}>
                  <MerchantBadge />
                  <View style={styles.merchantIdentityText}>
                    <Text style={styles.fieldLabel}>NAME</Text>
                    <Text style={styles.fieldValue}>{merchant.name}</Text>
                  </View>
                </View>

                <View style={styles.twoColumnRow}>
                  <DisplayField label="PHONE" value={merchant.phone} />
                  <DisplayField label="DATE" value={merchant.date} />
                </View>

                <DisplayField label="ADDRESS" value={merchant.address} />
              </View>
            )}
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={ShoppingBag01Icon}
              title="Items"
              trailing={<SectionEditButton label="Edit" onPress={() => {}} />}
            />

            <View style={styles.sectionBody}>
              <View style={styles.itemsHeaderRow}>
                <Text style={[styles.tableHeaderText, styles.itemNameColumn]}>NAME</Text>
                <Text style={[styles.tableHeaderText, styles.itemQuantityColumn]}>QUANTITY</Text>
                <Text style={[styles.tableHeaderText, styles.itemPriceColumn]}>PRICE</Text>
                <Text style={[styles.tableHeaderText, styles.itemTotalColumn]}>TOTAL</Text>
                <View style={styles.itemActionColumn} />
              </View>

              <View style={styles.itemsList}>
                {receiptItemsSeed.map((item) => {
                  const total = item.quantity * item.price;

                  return (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={[styles.itemValueText, styles.itemNameColumn]}>{item.name}</Text>

                      <View style={[styles.valuePill, styles.itemQuantityColumn]}>
                        <Text style={styles.valuePillText}>{item.quantity}</Text>
                      </View>

                      <View style={[styles.valuePill, styles.itemPriceColumn]}>
                        <Text style={styles.valuePillText}>{formatCurrency(item.price)}</Text>
                      </View>

                      <View style={[styles.valuePill, styles.itemTotalColumn]}>
                        <Text style={styles.valuePillText}>{formatCurrency(total)}</Text>
                      </View>

                      <View style={styles.itemActionColumn}>
                        <View style={styles.dragHandleBadge}>
                          <HugeiconsIcon
                            icon={Drag04Icon}
                            color={theme.colors.textSecondary}
                            size={18}
                            strokeWidth={1.8}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={Payment01Icon}
              title="Payment Method"
              trailing={
                <View style={styles.segmentedControl}>
                  <SegmentTab
                    icon={Cash01Icon}
                    isActive={paymentMethod === 'cash'}
                    label="Cash"
                    onPress={() => setPaymentMethod('cash')}
                  />
                  <SegmentTab
                    icon={CreditCardIcon}
                    isActive={paymentMethod === 'card'}
                    label="Card"
                    onPress={() => setPaymentMethod('card')}
                  />
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
                    placeholder="Card placeholder"
                  />
                </View>

                <View style={styles.columnField}>
                  <Text style={styles.fieldLabel}>Last 4 Digits</Text>
                  <ReceiptInput
                    value={cardForm.lastFourDigits}
                    onChangeText={(value) => handleCardFieldChange('lastFourDigits', value)}
                    placeholder="Last 4 digits"
                  />
                </View>
              </View>
            ) : null}
          </SectionCard>

          <SectionCard>
            <SectionHeader icon={Note01Icon} title="Note" />

            <View style={styles.sectionBody}>
              <ReceiptInput
                value={note}
                onChangeText={setNote}
                placeholder="Write a note"
                multiline
              />
            </View>
          </SectionCard>

          <SectionCard>
            <View style={styles.totalsRows}>
              <EditableTotalRow
                isEditing={editableTotals.tax}
                label="Tax"
                value={totals.tax}
                onChangeText={(value) => handleTotalFieldChange('tax', value)}
                onEdit={() => handleEnableTotalEdit('tax')}
              />
              <EditableTotalRow
                isEditing={editableTotals.tips}
                label="Tips"
                value={totals.tips}
                onChangeText={(value) => handleTotalFieldChange('tips', value)}
                onEdit={() => handleEnableTotalEdit('tips')}
              />
              <EditableTotalRow
                isEditing={editableTotals.discount}
                label="Discount"
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
          <Pressable onPress={() => router.back()} style={styles.footerSecondaryPressable}>
            {({ pressed }) => (
              <View
                style={[
                  styles.footerSecondaryButton,
                  pressed ? styles.footerSecondaryButtonPressed : null,
                ]}>
                <Text style={styles.footerSecondaryLabel}>Cancel</Text>
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => {}} style={styles.footerPrimaryPressable}>
            {({ pressed }) => (
              <View
                style={[
                  styles.footerPrimaryButton,
                  pressed ? styles.footerPrimaryButtonPressed : null,
                ]}>
                <Text style={styles.footerPrimaryLabel}>Confirm & Add</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </>
  );
}

type HeaderIconButtonProps = {
  icon: HugeIcon;
  onPress: () => void;
};

function HeaderIconButton({ icon, onPress }: HeaderIconButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable onPress={onPress} style={styles.headerIconPressable}>
      {({ pressed }) => (
        <View style={[styles.headerIconButton, pressed ? styles.headerIconButtonPressed : null]}>
          <HugeiconsIcon icon={icon} color={theme.colors.primary} size={22} strokeWidth={2.1} />
        </View>
      )}
    </Pressable>
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

function SectionEditButton({
  disabled = false,
  label,
  onPress,
}: SectionEditButtonProps) {
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
          ]}>
          <HugeiconsIcon
            icon={Edit02Icon}
            color={disabled ? theme.colors.textHint : theme.colors.secondary}
            size={14}
            strokeWidth={1.9}
          />
          <Text
            style={[
              styles.sectionEditLabel,
              disabled ? styles.sectionEditLabelDisabled : null,
            ]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function MerchantBadge() {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.merchantBadge}>
      <View style={styles.merchantBadgeAccentPrimary} />
      <View style={styles.merchantBadgeAccentSecondary} />
      <HugeiconsIcon icon={Store04Icon} color={theme.colors.secondary} size={20} strokeWidth={1.9} />
    </View>
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
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function ReceiptInput({
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
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textHint}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[styles.receiptInput, multiline ? styles.receiptInputMultiline : null]}
    />
  );
}

type SegmentTabProps = {
  icon: HugeIcon;
  isActive: boolean;
  label: string;
  onPress: () => void;
};

function SegmentTab({ icon, isActive, label, onPress }: SegmentTabProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable onPress={onPress} style={styles.segmentTabPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.segmentTab,
            isActive ? styles.segmentTabActive : null,
            pressed ? styles.segmentTabPressed : null,
          ]}>
          <HugeiconsIcon
            icon={icon}
            color={isActive ? '#FFFFFF' : theme.colors.textSecondary}
            size={15}
            strokeWidth={1.8}
          />
          <Text style={[styles.segmentTabLabel, isActive ? styles.segmentTabLabelActive : null]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
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
            keyboardType="decimal-pad"
            textAlign="right"
            placeholder="0.00"
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
                <HugeiconsIcon
                  icon={PencilEdit02Icon}
                  color={theme.colors.secondary}
                  size={16}
                  strokeWidth={1.9}
                />
              </View>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseCurrencyValue(value: string) {
  const normalizedValue = Number.parseFloat(value.replace(/[^0-9.]/g, ''));

  return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

function sanitizeCurrencyInput(value: string) {
  const sanitizedValue = value.replace(/[^0-9.]/g, '');
  const firstDotIndex = sanitizedValue.indexOf('.');

  if (firstDotIndex === -1) {
    return sanitizedValue;
  }

  const head = sanitizedValue.slice(0, firstDotIndex + 1);
  const tail = sanitizedValue.slice(firstDotIndex + 1).replace(/\./g, '');

  return `${head}${tail}`;
}

function createStyles(
  theme: ReturnType<typeof useAppTheme>,
  topInset: number,
  bottomInset: number
) {
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
      paddingTop: topInset > 0 ? spacing.sm : spacing.xl,
      paddingRight: spacing.lg,
      paddingBottom: footerHeight + bottomInset + spacing.xl,
      paddingLeft: spacing.lg,
      gap: spacing.md,
    },
    headerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.md,
      borderRadius: radius.xxxl,
      borderCurve: 'continuous',
      backgroundColor: '#FFFDF9',
      boxShadow: '0 12px 28px rgba(17, 24, 39, 0.10)',
    },
    headerIconPressable: {
      borderRadius: radius.pill,
    },
    headerIconButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: theme.colors.surface,
      boxShadow: `0 4px 8px ${theme.colors.shadow}`,
    },
    headerIconButtonPressed: {
      opacity: 0.9,
    },
    headerTitleBlock: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    headerTitle: {
      ...typography.headlineMedium,
      color: theme.colors.primary,
      textAlign: 'center',
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
    merchantNameInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    merchantNameInputColumn: {
      flex: 1,
      gap: spacing.xxs,
    },
    merchantBadge: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: '#FFF3DB',
      borderWidth: 1,
      borderColor: 'rgba(87, 66, 53, 0.10)',
      overflow: 'hidden',
    },
    merchantBadgeAccentPrimary: {
      position: 'absolute',
      top: 6,
      left: 8,
      width: 14,
      height: 24,
      borderRadius: radius.sm,
      backgroundColor: '#F99AA6',
    },
    merchantBadgeAccentSecondary: {
      position: 'absolute',
      right: 8,
      bottom: 10,
      width: 8,
      height: 14,
      borderRadius: radius.sm,
      backgroundColor: '#FFCC73',
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
      minHeight: 82,
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
    itemsList: {
      gap: spacing.sm,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    itemNameColumn: {
      flex: 1.6,
    },
    itemQuantityColumn: {
      flex: 0.7,
    },
    itemPriceColumn: {
      flex: 0.9,
    },
    itemTotalColumn: {
      flex: 0.95,
    },
    itemActionColumn: {
      width: 34,
      alignItems: 'flex-end',
    },
    itemValueText: {
      ...typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    valuePill: {
      minHeight: 30,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
    },
    valuePillText: {
      ...typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    dragHandleBadge: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
    },
    segmentedControl: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 4,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: 'rgba(225, 227, 228, 0.9)',
      backgroundColor: theme.colors.surface,
      gap: 4,
    },
    segmentTabPressable: {
      borderRadius: radius.pill,
    },
    segmentTab: {
      minWidth: 58,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.xxs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
    },
    segmentTabActive: {
      backgroundColor: theme.colors.primary,
    },
    segmentTabPressed: {
      opacity: 0.88,
    },
    segmentTabLabel: {
      ...typography.labelLarge,
      color: theme.colors.textSecondary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    segmentTabLabelActive: {
      color: '#FFFFFF',
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
