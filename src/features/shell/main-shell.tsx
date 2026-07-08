import { HugeiconsIcon } from '@hugeicons/react-native';
import { usePathname, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { AppDrawerPanel } from './app-drawer-panel';
import { MainAppBar } from './main-app-bar';
import { MainBottomNav } from './main-bottom-nav';
import { shellMetrics, shellNavRoutes, type DrawerNavigationMode } from './shell-config';

type MainShellProps = {
  children: ReactNode;
  headerCenterChild?: ReactNode;
  headerRightSlot?: ReactNode;
  headerTitle?: string;
  showBottomNav?: boolean;
  showScanFab?: boolean;
};

export function MainShell({
  children,
  headerCenterChild,
  headerRightSlot,
  headerTitle,
  showBottomNav = true,
  showScanFab = true,
}: MainShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const styles = createStyles(theme, insets.top, insets.bottom);
  const drawerWidth = width * 0.72;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isDrawerOpen ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [isDrawerOpen, progress]);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const translateX = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, drawerWidth - 24],
      }),
    [drawerWidth, progress]
  );

  const translateY = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, shellMetrics.drawerOffsetY],
      }),
    [progress]
  );

  const scale = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, shellMetrics.drawerScale],
      }),
    [progress]
  );

  function navigateTo(href: Href, navigationMode: DrawerNavigationMode | 'replace' = 'replace') {
    if (pathname !== href.toString() || navigationMode === 'push') {
      if (navigationMode === 'push') {
        router.push(href);
        return;
      }

      router.replace(href);
    }
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="light" />
      <View style={styles.safeFrame}>
        <AppDrawerPanel
          currentPathname={pathname}
          onClose={() => setIsDrawerOpen(false)}
          onNavigate={navigateTo}
          width={drawerWidth}
        />

        <Animated.View
          pointerEvents={isDrawerOpen ? 'none' : 'auto'}
          style={[
            styles.animatedShell,
            isDrawerOpen ? styles.animatedShellOpen : null,
            {
              transform: [{ translateX }, { translateY }, { scale }],
            },
          ]}>
          <View style={[styles.mainCardShadow, isDrawerOpen ? styles.mainCardShadowOpen : null]}>
            <View
              style={[
                styles.mainCard,
                isDrawerOpen ? styles.mainCardOpen : null,
              ]}>
              <MainAppBar
                title={headerCenterChild ? undefined : headerTitle}
                centerChild={headerCenterChild}
                onMenuPress={() => setIsDrawerOpen((value) => !value)}
                rightSlot={headerRightSlot}
              />

              <View style={styles.screenContent}>{children}</View>

              {showBottomNav ? (
                <>
                  <MainBottomNav currentPathname={pathname} onNavigate={navigateTo} />

                  {showScanFab ? (
                    <View pointerEvents="box-none" style={styles.scanFabOverlay}>
                      <Pressable
                        onPress={() => navigateTo(shellNavRoutes[2].href)}
                        style={styles.scanFabPressable}>
                        {({ pressed }) => (
                            <View style={[styles.scanFabWrapper, pressed ? styles.scanFabPressed : null]}>
                            <View style={styles.scanFab}>
                              <HugeiconsIcon
                                icon={shellNavRoutes[2].icon}
                                color="#FFFFFF"
                                size={30}
                                strokeWidth={2.1}
                              />
                            </View>
                            <Text style={styles.scanFabLabel}>{shellNavRoutes[2].label}</Text>
                          </View>
                        )}
                      </Pressable>
                    </View>
                  ) : null}
                </>
              ) : null}
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function createStyles(
  theme: ReturnType<typeof useAppTheme>,
  topInset: number,
  bottomInset: number
) {
  const fabBottom = bottomInset + spacing.sm;

  return StyleSheet.create({
    outerContainer: {
      flex: 1,
      backgroundColor: theme.colors.secondary,
    },
    safeFrame: {
      flex: 1,
      paddingTop: topInset > 0 ? topInset : spacing.md,
      paddingBottom: bottomInset > 0 ? bottomInset : spacing.sm,
    },
    animatedShell: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    animatedShellOpen: {
      borderRadius: shellMetrics.drawerCornerRadius,
      borderCurve: 'continuous',
    },
    mainCardShadow: {
      flex: 1,
    },
    mainCardShadowOpen: {
      borderRadius: shellMetrics.drawerCornerRadius,
      borderCurve: 'continuous',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    },
    mainCard: {
      flex: 1,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
    },
    mainCardOpen: {
      borderRadius: shellMetrics.drawerCornerRadius,
      borderCurve: 'continuous',
    },
    screenContent: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    scanFabOverlay: {
      position: 'absolute',
      bottom: fabBottom,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    scanFabPressable: {
      borderRadius: radius.pill,
    },
    scanFabWrapper: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    scanFabPressed: {
      opacity: 0.9,
    },
    scanFab: {
      width: shellMetrics.centerFabSize,
      height: shellMetrics.centerFabSize,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)'
    },
    scanFabLabel: {
      ...typography.labelLarge,
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: typography.titleMedium.fontFamily,
      lineHeight: shellMetrics.centerFabLabelHeight,
    },
  });
}
