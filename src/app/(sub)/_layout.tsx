import { Delete02Icon } from '@hugeicons/core-free-icons';
import type { Href } from 'expo-router';
import { usePathname, useRouter } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { SubAppBar, SubAppBarActionButton } from '@/shared/shell/components/sub-app-bar';
import { subShellFallbacks, subShellTitles } from '@/shared/shell/shell-config';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

export default function SubLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top);
  const isEmployeeDetailRoute = /^\/employee\/[^/]+$/.test(pathname);
  const title = isEmployeeDetailRoute ? 'Employee Detail' : (subShellTitles[pathname] ?? 'Detail');
  const fallbackHref = isEmployeeDetailRoute ? '/employee' : (subShellFallbacks[pathname] ?? '/home');

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref as Href);
  }

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />

      <View style={styles.headerFrame}>
        <SubAppBar title={title} onBackPress={handleBackPress} rightSlot={getRightSlot(pathname, router)} />
      </View>

      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </View>
    </View>
  );
}

function getRightSlot(pathname: string, router: ReturnType<typeof useRouter>) {
  if (/^\/employee\/[^/]+$/.test(pathname)) {
    return (
      <SubAppBarActionButton
        icon={Delete02Icon}
        color='#FFFFFF'
        backgroundColor='#C41E1E'
        onPress={() => router.replace('/employee')}
      />
    );
  }

  if (pathname === '/scan/preview') {
    return (
      <View style={draftBadgeStyles.badge}>
        <Text style={draftBadgeStyles.label}>Draft</Text>
      </View>
    );
  }

  return undefined;
}

function createStyles(theme: ReturnType<typeof useAppTheme>, topInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerFrame: {
      paddingTop: topInset > 0 ? topInset : spacing.md,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });
}

const draftBadgeStyles = StyleSheet.create({
  badge: {
    minWidth: 56,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    backgroundColor: '#F3F3EF',
    alignItems: 'center',
  },
  label: {
    ...typography.labelLarge,
    color: '#4C585B',
    fontFamily: typography.titleMedium.fontFamily,
  },
});
