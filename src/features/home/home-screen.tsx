import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import type { StyleProp, ViewStyle } from 'react-native';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useRef, useState } from 'react';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';
import { shellMetrics } from '@/features/shell/shell-config';

import { SectionCollapse } from './components/section-collapse';
import { SectionViewMore } from './components/section-view-more';
import { SummaryCard } from './components/summary-card';
import { TransactionCard } from './components/transaction-card';
import {
  buildCalendarRows,
  buildHomeData,
  formatCurrency,
  formatMonthDay,
  getWeekdayLabel,
  weekdayLabels,
} from './home-data';

export function HomeScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const now = useMemo(() => new Date(), []);
  const homeData = useMemo(() => buildHomeData(now), [now]);
  const calendarRows = useMemo(
    () => buildCalendarRows(new Date(now.getFullYear(), now.getMonth(), 1)),
    [now]
  );
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const floatingAnim = useRef(new Animated.Value(1)).current;

  function handleScroll(offsetY: number) {
    const shouldShow = offsetY <= 12;

    if (shouldShow === showFloatingButton) {
      return;
    }

    setShowFloatingButton(shouldShow);

    Animated.parallel([
      Animated.timing(floatingAnim, {
        toValue: shouldShow ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }

  const floatingTranslateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
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
          scrollEventThrottle={16}
          onScroll={(event) => handleScroll(event.nativeEvent.contentOffset.y)}>
          <SummaryCard
            label="TOTAL VALUE"
            amount={formatCurrency(homeData.summaryTotal)}
          />

          <View style={styles.sectionSpacer}>
            <SectionCollapse
              title="Calendar"
              child={
                <CalendarSection
                  calendarRows={calendarRows}
                  dayAmounts={homeData.calendarAmounts}
                  today={new Date(now.getFullYear(), now.getMonth(), now.getDate())}
                />
              }
            />
          </View>

          <SectionCollapse
            title="Transactions"
            child={<TransactionsSection groups={homeData.groups} />}
          />
        </ScrollView>

        <Animated.View
          pointerEvents={showFloatingButton ? 'auto' : 'none'}
          style={[
            styles.floatingButtonContainer,
            {
              opacity: floatingAnim,
              transform: [{ translateY: floatingTranslateY }],
            },
          ]}>
          <Pressable onPress={() => {}} style={styles.floatingButtonPressable}>
            {({ pressed }) => (
              <View style={[styles.floatingButton, pressed ? styles.floatingButtonPressed : null]}>
                <Image
                  source={require('../../../assets/images/pen.png')}
                  style={styles.penIcon}
                  contentFit="contain"
                />
              </View>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
}

type CalendarSectionProps = {
  calendarRows: Array<Array<Date | null>>;
  dayAmounts: Record<number, number>;
  today: Date;
};

function CalendarSection({ calendarRows, dayAmounts, today }: CalendarSectionProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarRows}>
        {calendarRows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={styles.calendarRow}>
            {row.map((day, dayIndex) => (
              <View key={`day-${rowIndex}-${dayIndex}`} style={styles.calendarCellSlot}>
                <CalendarDayCell
                  amount={day ? dayAmounts[day.getDate()] : undefined}
                  day={day}
                  today={today}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

type CalendarDayCellProps = {
  amount?: number;
  day: Date | null;
  today: Date;
};

function CalendarDayCell({ amount, day, today }: CalendarDayCellProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  if (!day) {
    return <View style={styles.emptyCalendarCell} />;
  }

  const isToday =
    day.getFullYear() === today.getFullYear() &&
    day.getMonth() === today.getMonth() &&
    day.getDate() === today.getDate();

  return (
    <View style={[styles.calendarDayCell, isToday ? styles.calendarDayCellToday : styles.calendarDayCellDefault]}>
      <Text style={styles.calendarDayNumber}>{day.getDate()}</Text>
      {typeof amount === 'number' ? (
        <Text numberOfLines={1} style={styles.calendarDayAmount}>
          {formatCurrency(amount)}
        </Text>
      ) : null}
    </View>
  );
}

type TransactionsSectionProps = {
  groups: ReturnType<typeof buildHomeData>['groups'];
};

function TransactionsSection({ groups }: TransactionsSectionProps) {
  const styles = createStyles(useAppTheme());

  return (
    <View>
      {groups.map((group, index) => (
        <TransactionGroupSection
          key={`${group.date.toISOString()}-${index}`}
          group={group}
          style={index === groups.length - 1 ? null : styles.transactionGroupSpacer}
        />
      ))}
    </View>
  );
}

type TransactionGroupSectionProps = {
  group: ReturnType<typeof buildHomeData>['groups'][number];
  style?: StyleProp<ViewStyle>;
};

function TransactionGroupSection({ group, style }: TransactionGroupSectionProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [expanded, setExpanded] = useState(false);
  const collapsedItemLimit = 5;
  const total = group.items.reduce((sum, item) => sum + item.total, 0);
  const hasMore = group.items.length > collapsedItemLimit;
  const visibleItems = expanded || !hasMore ? group.items : group.items.slice(0, collapsedItemLimit);
  const hiddenCount = group.items.length - visibleItems.length;

  return (
    <View style={style}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionDate}>{formatMonthDay(group.date)}</Text>
        <View style={styles.transactionWeekdayPill}>
          <Text style={styles.transactionWeekdayText}>{getWeekdayLabel(group.date).toUpperCase()}</Text>
        </View>
        <Text style={styles.transactionTotal}>{formatCurrency(total, 0)}</Text>
      </View>

      <View style={styles.transactionCards}>
        {visibleItems.map((item, index) => (
          <TransactionCard
            key={`${item.time}-${item.title}-${index}`}
            icon={item.icon}
            time={item.time}
            title={item.title}
            note={item.note}
            total={item.total}
            style={index === visibleItems.length - 1 ? undefined : styles.transactionCardSpacer}
          />
        ))}
      </View>

      {!expanded && hiddenCount > 0 ? (
        <SectionViewMore hiddenCount={hiddenCount} onPress={() => setExpanded(true)} />
      ) : null}
    </View>
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
    sectionSpacer: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    calendarContainer: {
      padding: spacing.xs,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surface,
      boxShadow: `0 4px 12px ${theme.colors.shadow}`,
    },
    weekdayRow: {
      flexDirection: 'row',
      gap: 4,
    },
    weekdayCell: {
      flex: 1,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(245, 124, 0, 0.30)',
    },
    weekdayText: {
      ...typography.labelLarge,
      fontFamily: typography.titleMedium.fontFamily,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    calendarRows: {
      marginTop: spacing.xs,
      gap: spacing.xxs,
    },
    calendarRow: {
      flexDirection: 'row',
      gap: 4,
    },
    calendarCellSlot: {
      flex: 1,
    },
    emptyCalendarCell: {
      height: 42,
    },
    calendarDayCell: {
      height: 42,
      paddingHorizontal: spacing.xxs,
      paddingVertical: 3,
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    calendarDayCellDefault: {
      backgroundColor: 'rgba(245, 124, 0, 0.20)',
    },
    calendarDayCellToday: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    calendarDayNumber: {
      ...typography.bodyMedium,
      lineHeight: 16,
      fontFamily: typography.titleMedium.fontFamily,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    calendarDayAmount: {
      ...typography.labelLarge,
      fontSize: 10,
      lineHeight: 11,
      color: theme.colors.primary,
      textAlign: 'center',
      width: '100%',
    },
    transactionGroupSpacer: {
      marginBottom: spacing.md,
    },
    transactionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.xs,
    },
    transactionDate: {
      ...typography.headlineMedium,
      fontSize: 20,
      lineHeight: 26,
      color: theme.colors.textSecondary,
    },
    transactionWeekdayPill: {
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
    },
    transactionWeekdayText: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    transactionTotal: {
      marginLeft: 'auto',
      ...typography.titleLarge,
      color: theme.colors.secondary,
    },
    transactionCards: {
      marginBottom: spacing.xs,
    },
    transactionCardSpacer: {
      marginBottom: spacing.sm,
    },
    floatingButtonContainer: {
      position: 'absolute',
      right: shellMetrics.sideFloatingRight,
      bottom: shellMetrics.sideFloatingBottom,
    },
    floatingButtonPressable: {
      borderRadius: radius.pill,
    },
    floatingButton: {
      width: shellMetrics.sideFloatingButtonSize,
      height: shellMetrics.sideFloatingButtonSize,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      boxShadow: `0 4px 12px ${theme.colors.shadow}`,
    },
    floatingButtonPressed: {
      opacity: 0.9,
    },
    penIcon: {
      width: shellMetrics.sideFloatingButtonSize - 6,
      height: shellMetrics.sideFloatingButtonSize - 6,
    },
  });
}
