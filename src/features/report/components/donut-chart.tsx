import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';
import type { DonutChartItem } from '@/features/report/report-data';

import { describeDonutArc } from './chart-utils';

type DonutChartProps = {
  chartSize?: number;
  items: DonutChartItem[];
  legendLimit?: number;
};

export function DonutChart({
  chartSize = 124,
  items,
  legendLimit = 5,
}: DonutChartProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const legendItems = items.slice(0, legendLimit);
  const placeholders = Math.max(0, legendLimit - legendItems.length);
  const center = chartSize / 2;
  const outerRadius = chartSize / 2 - 4;
  const innerRadius = chartSize * 0.27;

  const segments = useMemo(() => {
    if (items.length === 0 || total <= 0) {
      return [];
    }

    let currentAngle = 0;

    return items.map((item) => {
      const startAngle = currentAngle;
      const endAngle = currentAngle + (item.value / total) * 360;
      currentAngle = endAngle;

      return {
        color: item.color,
        path: describeDonutArc(
          center,
          center,
          outerRadius,
          innerRadius,
          startAngle,
          endAngle
        ),
      };
    });
  }, [center, innerRadius, items, outerRadius, total]);

  return (
    <View style={styles.container}>
      <View style={[styles.chartWrapper, { width: chartSize, height: chartSize }]}>
        <Svg width={chartSize} height={chartSize}>
          {segments.length === 0 ? (
            <Circle
              cx={center}
              cy={center}
              r={(outerRadius + innerRadius) / 2}
              stroke={theme.colors.borderAlt}
              strokeWidth={outerRadius - innerRadius}
              fill="none"
            />
          ) : (
            segments.map((segment, index) => (
              <Path key={`segment-${index}`} d={segment.path} fill={segment.color} />
            ))
          )}
        </Svg>
      </View>

      <View style={styles.legend}>
        {legendItems.map((item) => (
          <LegendRow
            key={item.label}
            color={item.color}
            label={item.label}
            percentage={total === 0 ? 0 : (item.value / total) * 100}
          />
        ))}

        {Array.from({ length: placeholders }).map((_, index) => (
          <LegendPlaceholderRow key={`placeholder-${index}`} />
        ))}
      </View>
    </View>
  );
}

type LegendRowProps = {
  color: string;
  label: string;
  percentage: number;
};

function LegendRow({ color, label, percentage }: LegendRowProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text numberOfLines={1} style={styles.legendLabel}>
        {label}
      </Text>
      <Text style={styles.legendValue}>{percentage.toFixed(2)}%</Text>
    </View>
  );
}

function LegendPlaceholderRow() {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.legendRow}>
      <View style={styles.legendPlaceholderSwatch} />
      <Text style={styles.legendPlaceholderLabel}>----</Text>
      <Text style={styles.legendPlaceholderValue}>0.00%</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chartWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    legend: {
      flex: 1,
      marginLeft: spacing.md,
      gap: spacing.xs,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 16,
    },
    legendSwatch: {
      width: 16,
      height: 16,
      borderRadius: radius.sm,
      borderCurve: 'continuous',
    },
    legendLabel: {
      flex: 1,
      marginLeft: spacing.xs,
      ...typography.titleMedium,
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textSecondary,
    },
    legendValue: {
      marginLeft: spacing.sm,
      ...typography.labelLarge,
      color: theme.colors.textSecondary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    legendPlaceholderSwatch: {
      width: 16,
      height: 16,
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(252, 216, 179, 0.35)',
    },
    legendPlaceholderLabel: {
      flex: 1,
      marginLeft: spacing.xs,
      ...typography.titleMedium,
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textHint,
    },
    legendPlaceholderValue: {
      marginLeft: spacing.sm,
      ...typography.labelLarge,
      color: theme.colors.textHint,
      fontFamily: typography.titleMedium.fontFamily,
    },
  });
}
