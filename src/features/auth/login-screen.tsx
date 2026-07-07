import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppleLogoIcon } from '@/components/icons/apple-logo-icon';
import { GoogleLogoIcon } from '@/components/icons/google-logo-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppTheme } from '@/theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

export function LoginScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { height } = useWindowDimensions();
  const styles = createStyles(theme, Math.max(height - spacing.sm - spacing.lg - 32, 0));

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentShell}>
          <View style={styles.heroSection}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />

            <Text style={styles.heroTitle}>SCAN RECEIPTS</Text>
            <Text style={styles.heroSubtitle}>SIGN IN TO YOUR ACCOUNT</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Welcome Back</Text>
            <Text style={styles.panelDescription}>
              Please choose a sign-in method to continue your financial tracking.
            </Text>

            <View style={styles.socialButtons}>
              <SocialSignInButton
                label="Continue with Google"
                variant="light"
                styles={styles}
                icon={<GoogleLogoIcon size={20} />}
                onPress={() => router.replace('/home')}
              />

              <SocialSignInButton
                label="Continue with Apple"
                variant="dark"
                styles={styles}
                icon={<AppleLogoIcon color="#FFFFFF" size={20} />}
                onPress={() => router.replace('/home')}
              />
            </View>

            <View style={styles.legalSection}>
              <Text style={styles.legalText}>By signing in, you agree to our</Text>

              <Text style={styles.legalLinks}>
                <Text style={styles.legalLinkEmphasis}>Terms of Service</Text>
                <Text> & </Text>
                <Text style={styles.legalLinkEmphasis}>Privacy Policy</Text>
              </Text>
            </View>

            <View style={styles.footerRow}>
              <View style={styles.footerLine} />
              <Text style={styles.footerLabel}>FISCAL CLARITY</Text>
              <View style={styles.footerLine} />
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

type SocialSignInButtonProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  variant: 'light' | 'dark';
};

function SocialSignInButton({
  icon,
  label,
  onPress,
  styles,
  variant,
}: SocialSignInButtonProps) {
  const isDark = variant === 'dark';

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.buttonPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.socialButton,
            isDark ? styles.socialButtonDark : styles.socialButtonLight,
            pressed ? styles.socialButtonPressed : null,
          ]}>
          <View style={styles.socialButtonContent}>
            {icon}
            <Text style={[styles.socialButtonLabel, isDark ? styles.socialButtonLabelDark : null]}>
              {label}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: AppTheme, minHeight: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.secondary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
      justifyContent: 'center',
    },
    contentShell: {
      width: '100%',
      maxWidth: 480,
      minHeight,
      alignSelf: 'center',
      justifyContent: 'space-between',
      gap: spacing.xl,
    },
    heroSection: {
      alignItems: 'center',
      paddingTop: spacing.sm,
    },
    logo: {
      width: 112,
      height: 112,
      borderRadius: radius.xl,
    },
    heroTitle: {
      ...typography.displayLarge,
      marginTop: spacing.lg,
      fontSize: 30,
      lineHeight: 36,
      color: '#FFFFFF',
      fontStyle: 'italic',
      textAlign: 'center',
    },
    heroSubtitle: {
      ...typography.titleMedium,
      marginTop: spacing.sm,
      fontSize: 14,
      lineHeight: 20,
      color: '#FFFFFF',
      fontStyle: 'italic',
      textAlign: 'center',
    },
    panel: {
      flexShrink: 1,
      width: '100%',
      borderRadius: radius.xxl,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.background,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.xl,
      boxShadow: '0 18px 36px rgba(0, 0, 0, 0.16)',
      gap: spacing.md,
    },
    panelTitle: {
      ...typography.titleLarge,
      fontSize: 20,
      lineHeight: 26,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    panelDescription: {
      ...typography.bodyLarge,
      color: theme.colors.textHint,
      textAlign: 'center',
    },
    socialButtons: {
      marginTop: spacing.md,
      gap: spacing.md,
    },
    buttonPressable: {
      width: '100%',
    },
    socialButton: {
      height: 52,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      paddingHorizontal: spacing.lg,
      justifyContent: 'center',
    },
    socialButtonLight: {
      backgroundColor: theme.colors.surface,
      borderColor: '#D8DCE2',
    },
    socialButtonDark: {
      backgroundColor: '#272727',
      borderColor: '#272727',
    },
    socialButtonPressed: {
      opacity: 0.9,
    },
    socialButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    socialButtonLabel: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    socialButtonLabelDark: {
      color: '#FFFFFF',
    },
    legalSection: {
      marginTop: spacing.xl,
      gap: spacing.xxs,
    },
    legalText: {
      ...typography.bodyMedium,
      fontSize: 13,
      color: theme.colors.textHint,
      textAlign: 'center',
    },
    legalLinks: {
      ...typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    legalLinkEmphasis: {
      fontFamily: typography.titleMedium.fontFamily,
    },
    footerRow: {
      marginTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    footerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.borderAlt,
    },
    footerLabel: {
      ...typography.labelLarge,
      color: theme.colors.textHint,
      fontFamily: typography.titleMedium.fontFamily,
      letterSpacing: 1.2,
    },
  });
}
