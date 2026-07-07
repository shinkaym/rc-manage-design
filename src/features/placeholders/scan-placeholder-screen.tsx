import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';
import { shellNavRoutes } from '@/features/shell/shell-config';

export function ScanPlaceholderScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <HugeiconsIcon icon={shellNavRoutes[2].icon} size={40} color="#FFFFFF" strokeWidth={2.2} />
        <Text style={styles.title}>Scan Image</Text>
        <Text style={styles.description}>
          Scan will stay as a dedicated full-screen route, just like the Flutter app.
        </Text>
        <Pressable onPress={() => router.replace('/home')} style={styles.buttonPressable}>
          {({ pressed }) => (
            <View style={[styles.button, pressed ? styles.buttonPressed : null]}>
              <Text style={styles.buttonLabel}>Back to Home</Text>
            </View>
          )}
        </Pressable>
      </View>
    </>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000',
      paddingHorizontal: spacing.xl,
      gap: spacing.md,
    },
    title: {
      ...typography.headlineMedium,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    description: {
      ...typography.bodyLarge,
      color: '#FFFFFF',
      textAlign: 'center',
      opacity: 0.78,
      maxWidth: 360,
    },
    buttonPressable: {
      borderRadius: radius.lg,
      marginTop: spacing.sm,
    },
    button: {
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    buttonPressed: {
      opacity: 0.9,
    },
    buttonLabel: {
      ...typography.titleMedium,
      color: '#FFFFFF',
    },
  });
}
