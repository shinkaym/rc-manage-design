import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCurrency, formatMonthDay, getWeekdayLabel } from '@/features/home/home-data';
import { SectionCollapse } from '@/features/home/components/section-collapse';
import { SectionViewMore } from '@/features/home/components/section-view-more';
import { SummaryCard } from '@/features/home/components/summary-card';
import { TransactionCard } from '@/features/home/components/transaction-card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { shellMetrics } from '@/features/shell/shell-config';
import type { TransactionGroup } from '@/features/home/home-data';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import { BarChart } from './components/bar-chart';
import { DonutChart } from './components/donut-chart';
import { LineChart } from './components/line-chart';
import { SegmentTabs } from './components/segment-tabs';
import { TransactionProgressCard } from './components/transaction-progress-card';
import { buildReportData } from './report-data';
import type { ProgressItem, ReportChartType } from './report-data';

const chartTabs = [
  { label: 'Column', value: 'column' as const },
  { label: 'Line', value: 'line' as const },
];

export function ReportScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const now = useMemo(() => new Date(), []);
  const reportData = useMemo(() => buildReportData(now), [now]);
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [selectedChartType, setSelectedChartType] = useState<ReportChartType>('column');
  const floatingAnim = useRef(new Animated.Value(1)).current;
  const chartFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    chartFadeAnim.setValue(0);

    Animated.timing(chartFadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [chartFadeAnim, selectedChartType]);

  function handleScroll(offsetY: number) {
    const shouldShow = offsetY <= 12;

    if (shouldShow === showFloatingButton) {
      return;
    }

    setShowFloatingButton(shouldShow);

    Animated.timing(floatingAnim, {
      toValue: shouldShow ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
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
            amount={formatCurrency(reportData.summaryTotal)}
          />

          <View style={styles.sectionSpacer}>
            <SectionCollapse
              title="Chart"
              child={
                <View style={styles.chartSection}>
                  <SegmentTabs
                    items={chartTabs}
                    selectedValue={selectedChartType}
                    onChange={setSelectedChartType}
                  />

                  <Animated.View style={[styles.chartWrapper, { opacity: chartFadeAnim }]}>
                    {selectedChartType === 'column' ? (
                      <BarChart points={reportData.chartPoints} maxY={200} />
                    ) : (
                      <LineChart points={reportData.chartPoints} maxY={200} />
                    )}
                  </Animated.View>
                </View>
              }
            />
          </View>

          <View style={styles.sectionSpacer}>
            <SectionCollapse
              title="Overview"
              child={
                <OverviewSection
                  progressItems={reportData.progressItems}
                  summaryItems={reportData.overviewItems}
                />
              }
            />
          </View>

          <SectionCollapse
            title="Transactions"
            child={<TransactionsSection groups={reportData.groups} />}
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

type OverviewSectionProps = {
  progressItems: ProgressItem[];
  summaryItems: ReturnType<typeof buildReportData>['overviewItems'];
};

function OverviewSection({ progressItems, summaryItems }: OverviewSectionProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View>
      <DonutChart items={summaryItems} />
      <View style={styles.overviewProgressList}>
        <OverviewProgressList items={progressItems} />
      </View>
    </View>
  );
}

type OverviewProgressListProps = {
  items: ProgressItem[];
};

function OverviewProgressList({ items }: OverviewProgressListProps) {
  const styles = createStyles(useAppTheme());
  const [expanded, setExpanded] = useState(false);
  const collapsedItemLimit = 10;
  const hasMore = items.length > collapsedItemLimit;
  const visibleItems = expanded || !hasMore ? items : items.slice(0, collapsedItemLimit);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <View>
      {visibleItems.map((item, index) => (
        <View
          key={`${item.title}-${index}`}
          style={index === visibleItems.length - 1 ? undefined : styles.progressCardSpacer}>
          <TransactionProgressCard {...item} />
        </View>
      ))}

      {!expanded && hiddenCount > 0 ? (
        <SectionViewMore hiddenCount={hiddenCount} onPress={() => setExpanded(true)} />
      ) : null}
    </View>
  );
}

type TransactionsSectionProps = {
  groups: TransactionGroup[];
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
  group: TransactionGroup;
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
    },
    chartSection: {
      gap: spacing.sm,
    },
    chartWrapper: {
      width: '100%',
    },
    overviewProgressList: {
      marginTop: spacing.md,
    },
    progressCardSpacer: {
      marginBottom: spacing.sm,
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
