import { PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { shellMetrics } from '@/features/shell/shell-config';
import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import type { EmployeeItem } from './employee-data';
import { employeeMockData } from './employee-data';

type EmployeeFormMode = 'create' | 'edit';
type EmployeeStatus = 'active' | 'inactive';

type EmployeeFormScreenProps = {
  employeeId?: string;
  mode: EmployeeFormMode;
  onClose: () => void;
};

const statusTabs = [
  { label: 'Active', value: 'active' as const },
  { label: 'Inactive', value: 'inactive' as const },
];

export function EmployeeFormScreen({
  employeeId,
  mode,
  onClose,
}: EmployeeFormScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const employee = useMemo(
    () => employeeMockData.find((item) => item.id === employeeId) ?? employeeMockData[0],
    [employeeId]
  );

  const seed = mode === 'edit' ? employee : buildCreateSeed();
  const [employeeCode, setEmployeeCode] = useState(seed.employeeCode);
  const [fullName, setFullName] = useState(seed.name);
  const [role, setRole] = useState(seed.role);
  const [note, setNote] = useState(seed.bio);
  const [email, setEmail] = useState(seed.email);
  const [phone, setPhone] = useState(seed.phone);
  const [dob, setDob] = useState(seed.dob);
  const [address, setAddress] = useState(seed.address);
  const [startDate, setStartDate] = useState(seed.startDate);
  const [status, setStatus] = useState<EmployeeStatus>(seed.status);

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarShell}>
              <View style={styles.avatarFrame}>
                <Image source={seed.avatarUrl} style={styles.avatarImage} contentFit="cover" />
              </View>

              <Pressable onPress={() => {}} style={styles.avatarEditPressable}>
                {({ pressed }) => (
                  <View style={[styles.avatarEditButton, pressed ? styles.avatarEditButtonPressed : null]}>
                    <HugeiconsIcon icon={PencilEdit02Icon} size={14} color="#FFFFFF" strokeWidth={2.1} />
                  </View>
                )}
              </Pressable>
            </View>

            <Text style={styles.photoHintText}>Tap to change photo</Text>
          </View>

          <FieldStack>
            <LabeledField label="Employee Code">
              <FormTextInput
                value={employeeCode}
                onChangeText={setEmployeeCode}
                placeholder="1234"
                keyboardType="number-pad"
              />
            </LabeledField>

            <LabeledField label="Full name">
              <FormTextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Employee full name"
              />
            </LabeledField>

            <LabeledField label="Role">
              <FormTextInput
                value={role}
                onChangeText={setRole}
                placeholder="Salon Manager"
              />
            </LabeledField>

            <LabeledField label="Note">
              <FormTextInput
                multiline
                value={note}
                onChangeText={setNote}
                placeholder="Short note about this employee"
              />
            </LabeledField>

            <LabeledField label="Email">
              <FormTextInput
                value={email}
                onChangeText={setEmail}
                placeholder="employee@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </LabeledField>

            <LabeledField label="Phone number">
              <FormTextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="(090) 123-4567"
                keyboardType="phone-pad"
              />
            </LabeledField>

            <LabeledField label="DOB">
              <FormTextInput
                value={dob}
                onChangeText={setDob}
                placeholder="06/30/2003"
              />
            </LabeledField>

            <LabeledField label="Address">
              <FormTextInput
                multiline
                value={address}
                onChangeText={setAddress}
                placeholder="Employee address"
              />
            </LabeledField>

            <LabeledField label="Start date">
              <FormTextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="06/30/2003"
              />
            </LabeledField>

            <View style={styles.statusRow}>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.statusTabsWrap}>
                {statusTabs.map((item) => {
                  const isSelected = item.value === status;

                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => setStatus(item.value)}
                      style={styles.statusOptionPressable}>
                      {({ pressed }) => (
                        <View
                          style={[
                            styles.statusOption,
                            isSelected
                              ? item.value === 'active'
                                ? styles.statusOptionActive
                                : styles.statusOptionInactive
                              : styles.statusOptionDefault,
                            pressed ? styles.statusOptionPressed : null,
                          ]}>
                          <Text
                            style={[
                              styles.statusOptionLabel,
                              isSelected
                                ? item.value === 'active'
                                  ? styles.statusOptionLabelActive
                                  : styles.statusOptionLabelInactive
                                : null,
                            ]}>
                            {item.label}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </FieldStack>

          <View style={styles.actionsRow}>
            <Pressable onPress={onClose} style={styles.primaryPressable}>
              {({ pressed }) => (
                <View style={[styles.primaryButton, pressed ? styles.primaryButtonPressed : null]}>
                  <HugeiconsIcon icon={PencilEdit02Icon} size={18} color="#FFFFFF" strokeWidth={2.1} />
                  <Text style={styles.primaryButtonLabel}>
                    {mode === 'edit' ? 'Save' : 'Create'}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

type FieldStackProps = {
  children: ReactNode;
};

function FieldStack({ children }: FieldStackProps) {
  const styles = createStyles(useAppTheme());

  return <View style={styles.fieldStack}>{children}</View>;
}

type LabeledFieldProps = {
  children: ReactNode;
  label: string;
};

function LabeledField({ children, label }: LabeledFieldProps) {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

type FormTextInputProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words';
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function FormTextInput({
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  multiline = false,
  onChangeText,
  placeholder,
  value,
}: FormTextInputProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      multiline={multiline}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textHint}
      style={[styles.input, multiline ? styles.inputMultiline : null]}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  );
}

function buildCreateSeed(): EmployeeItem {
  return {
    ...employeeMockData[6],
    id: 'employee-new',
    employeeCode: '1234',
    name: '',
    role: '',
    bio: '',
    email: '',
    phone: '',
    dob: '06/30/2003',
    address: '',
    startDate: '06/30/2003',
    status: 'active',
  };
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
      gap: spacing.md,
    },
    profileSection: {
      alignItems: 'center',
      paddingTop: spacing.sm,
    },
    avatarShell: {
      position: 'relative',
      width: 124,
      height: 124,
      padding: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarFrame: {
      width: 116,
      height: 116,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.xxl,
      borderCurve: 'continuous',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      boxShadow: `0 8px 20px ${theme.colors.shadow}`,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarEditPressable: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      borderRadius: radius.pill,
    },
    avatarEditButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: theme.colors.primary,
      boxShadow: '0 6px 16px rgba(245, 124, 0, 0.28)',
    },
    avatarEditButtonPressed: {
      opacity: 0.9,
    },
    photoHintText: {
      ...typography.labelLarge,
      marginTop: spacing.sm,
      color: theme.colors.textHint,
      fontFamily: typography.titleMedium.fontFamily,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    fieldStack: {
      gap: spacing.sm,
    },
    fieldBlock: {
      gap: spacing.sm,
    },
    fieldLabel: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    input: {
      height: 48,
      paddingHorizontal: spacing.md,
      paddingVertical: 0,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textSecondary,
      ...typography.bodyLarge,
      lineHeight: 22,
      includeFontPadding: false,
    },
    inputMultiline: {
      minHeight: 84,
      height: undefined,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      includeFontPadding: true,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    statusTabsWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statusOptionPressable: {
      borderRadius: radius.md,
    },
    statusOption: {
      minWidth: 88,
      minHeight: 34,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
    },
    statusOptionDefault: {
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surfaceAlt,
    },
    statusOptionActive: {
      borderColor: '#16A34A',
      backgroundColor: '#16A34A',
    },
    statusOptionInactive: {
      borderColor: theme.colors.danger,
      backgroundColor: theme.colors.danger,
    },
    statusOptionPressed: {
      opacity: 0.88,
    },
    statusOptionLabel: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    statusOptionLabelActive: {
      color: '#FFFFFF',
    },
    statusOptionLabelInactive: {
      color: '#FFFFFF',
    },
    actionsRow: {
      marginTop: spacing.sm,
    },
    primaryPressable: {
      borderRadius: radius.lg,
    },
    primaryButton: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
      boxShadow: '0 10px 24px rgba(245, 124, 0, 0.26)',
    },
    primaryButtonPressed: {
      opacity: 0.92,
    },
    primaryButtonLabel: {
      ...typography.titleMedium,
      color: '#FFFFFF',
    },
  });
}
