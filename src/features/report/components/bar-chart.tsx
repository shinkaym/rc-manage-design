import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';
import type { ChartPoint } from '@/features/report/report-data';

import { formatChartValue, resolveChartInterval, resolveChartMaxY } from './chart-utils';

type BarChartProps = {
  color?: string;
  height?: number;
  interval?: number;
  maxY?: number;
  points: ChartPoint[];
  showValueLabels?: boolean;
  visiblePointCount?: number;
};

const chartLayout = {
  axisLabelWidth: 32,
  bottomAxisHeight: 28,
  canvasRightPadding: 8,
  outerBottomPadding: spacing.sm,
  outerLeftPadding: spacing.sm,
  outerRightPadding: spacing.sm,
  outerTopPadding: spacing.md,
  plotTopPadding: 8,
};

export function BarChart({
  color,
  height = 220,
  interval,
  maxY,
  points,
  showValueLabels = true,
  visiblePointCount = 7,
}: BarChartProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [containerWidth, setContainerWidth] = useState(0);
  const resolvedMaxY = resolveChartMaxY(points, maxY);
  const resolvedInterval = interval ?? resolveChartInterval(resolvedMaxY);
  const baseColor = color ?? theme.colors.primary;
  const svgHeight = height - chartLayout.outerTopPadding - chartLayout.outerBottomPadding;
  const plotHeight = svgHeight - chartLayout.plotTopPadding - chartLayout.bottomAxisHeight;
  const fallbackPlotWidth = visiblePointCount * 44;
  const availablePlotWidth =
    containerWidth > 0
      ? Math.max(
          containerWidth -
            chartLayout.outerLeftPadding -
            chartLayout.outerRightPadding -
            chartLayout.axisLabelWidth -
            chartLayout.canvasRightPadding,
          0
        )
      : fallbackPlotWidth;
  const minimumPlotWidth = points.length <= visiblePointCount
    ? availablePlotWidth
    : Math.max(availablePlotWidth, points.length * 44);
  const svgWidth =
    chartLayout.axisLabelWidth + minimumPlotWidth + chartLayout.canvasRightPadding;
  const plotBottom = chartLayout.plotTopPadding + plotHeight;
  const stepWidth = points.length > 0 ? minimumPlotWidth / points.length : 0;
  const barWidth = Math.min(24, Math.max(stepWidth - 14, 12));

  const yAxisValues = useMemo(() => {
    const values: number[] = [];

    for (let value = 0; value <= resolvedMaxY; value += resolvedInterval) {
      values.push(value);
    }

    if (values[values.length - 1] !== resolvedMaxY) {
      values.push(resolvedMaxY);
    }

    return values;
  }, [resolvedInterval, resolvedMaxY]);

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
      <ScrollView
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Svg width={svgWidth} height={svgHeight}>
          {yAxisValues.map((value) => {
            if (value === 0 || value === resolvedMaxY) {
              return null;
            }

            const y = chartLayout.plotTopPadding + (1 - value / resolvedMaxY) * plotHeight;

            return (
              <G key={`grid-${value}`}>
                <Line
                  x1={chartLayout.axisLabelWidth}
                  y1={y}
                  x2={chartLayout.axisLabelWidth + minimumPlotWidth}
                  y2={y}
                  stroke={theme.colors.chartGrid}
                  strokeWidth={1.25}
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={chartLayout.axisLabelWidth - 6}
                  y={y + 4}
                  fill={theme.colors.textHint}
                  fontFamily={typography.bodyMedium.fontFamily}
                  fontSize={11}
                  textAnchor="end">
                  {Math.round(value)}
                </SvgText>
              </G>
            );
          })}

          {points.map((point, index) => {
            const centerX = chartLayout.axisLabelWidth + stepWidth * index + stepWidth / 2;
            const barHeight = resolvedMaxY === 0 ? 0 : (point.value / resolvedMaxY) * plotHeight;
            const barY = plotBottom - barHeight;

            return (
              <G key={`${point.label}-${index}`}>
                <Rect
                  x={centerX - barWidth / 2}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx={radius.sm}
                  ry={radius.sm}
                  fill={point.color ?? baseColor}
                />

                {showValueLabels && point.value > 0 ? (
                  <SvgText
                    x={centerX}
                    y={Math.max(barY - 6, 12)}
                    fill={theme.colors.textSecondary}
                    fontFamily={typography.labelLarge.fontFamily}
                    fontSize={11}
                    textAnchor="middle">
                    {formatChartValue(point.value)}
                  </SvgText>
                ) : null}

                <SvgText
                  x={centerX}
                  y={plotBottom + 18}
                  fill={theme.colors.textHint}
                  fontFamily={typography.bodyMedium.fontFamily}
                  fontSize={11}
                  textAnchor="middle">
                  {point.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      height: 220,
      paddingTop: chartLayout.outerTopPadding,
      paddingRight: chartLayout.outerRightPadding,
      paddingBottom: chartLayout.outerBottomPadding,
      paddingLeft: chartLayout.outerLeftPadding,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
    },
    scrollContent: {
      minWidth: '100%',
    },
  });
}
