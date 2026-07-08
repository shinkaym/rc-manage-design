import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import type { ChartPoint } from '@/mock/report-data';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

import {
    buildAreaPath,
    buildSmoothPath,
    formatChartValue,
    resolveChartInterval,
    resolveChartMaxY,
} from './chart-utils';

type LineChartProps = {
  height?: number;
  interval?: number;
  lineColor?: string;
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

export function LineChart({
  height = 220,
  interval,
  lineColor,
  maxY,
  points,
  showValueLabels = true,
  visiblePointCount = 7,
}: LineChartProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [containerWidth, setContainerWidth] = useState(0);
  const resolvedMaxY = resolveChartMaxY(points, maxY);
  const resolvedInterval = interval ?? resolveChartInterval(resolvedMaxY);
  const strokeColor = lineColor ?? theme.colors.primary;
  const svgHeight = height - chartLayout.outerTopPadding - chartLayout.outerBottomPadding;
  const plotHeight = svgHeight - chartLayout.plotTopPadding - chartLayout.bottomAxisHeight;
  const fallbackPlotWidth = visiblePointCount * 52;
  const availablePlotWidth =
    containerWidth > 0
      ? Math.max(
          containerWidth -
            chartLayout.outerLeftPadding -
            chartLayout.outerRightPadding -
            chartLayout.axisLabelWidth -
            chartLayout.canvasRightPadding,
          0,
        )
      : fallbackPlotWidth;
  const minimumPlotWidth =
    points.length <= visiblePointCount
      ? availablePlotWidth
      : Math.max(availablePlotWidth, Math.max(points.length - 1, 1) * 52);
  const svgWidth = chartLayout.axisLabelWidth + minimumPlotWidth + chartLayout.canvasRightPadding;
  const plotBottom = chartLayout.plotTopPadding + plotHeight;

  const coordinates = useMemo(() => {
    if (points.length === 0) {
      return [];
    }

    if (points.length === 1) {
      return [
        {
          x: chartLayout.axisLabelWidth + minimumPlotWidth / 2,
          y: chartLayout.plotTopPadding + (1 - points[0].value / resolvedMaxY) * plotHeight,
        },
      ];
    }

    return points.map((point, index) => ({
      x: chartLayout.axisLabelWidth + (minimumPlotWidth / (points.length - 1)) * index,
      y: chartLayout.plotTopPadding + (1 - point.value / resolvedMaxY) * plotHeight,
    }));
  }, [minimumPlotWidth, plotHeight, points, resolvedMaxY]);

  const linePath = buildSmoothPath(coordinates);
  const areaPath = buildAreaPath(coordinates, plotBottom);

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
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <ScrollView
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
                  strokeDasharray='4 4'
                />
                <SvgText
                  x={chartLayout.axisLabelWidth - 6}
                  y={y + 4}
                  fill={theme.colors.textHint}
                  fontFamily={typography.bodyMedium.fontFamily}
                  fontSize={11}
                  textAnchor='end'
                >
                  {Math.round(value)}
                </SvgText>
              </G>
            );
          })}

          {areaPath ? <Path d={areaPath} fill='rgba(245, 124, 0, 0.12)' /> : null}
          {linePath ? (
            <Path
              d={linePath}
              fill='none'
              stroke={strokeColor}
              strokeWidth={3}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          ) : null}

          {coordinates.map((coordinate, index) => (
            <G key={`dot-${points[index]?.label ?? index}`}>
              <Circle
                cx={coordinate.x}
                cy={coordinate.y}
                r={4}
                fill={strokeColor}
                stroke={theme.colors.surface}
                strokeWidth={2}
              />
              {showValueLabels ? (
                <SvgText
                  x={coordinate.x}
                  y={Math.max(coordinate.y - 10, 12)}
                  fill={theme.colors.textSecondary}
                  fontFamily={typography.labelLarge.fontFamily}
                  fontSize={11}
                  textAnchor='middle'
                >
                  {formatChartValue(points[index].value)}
                </SvgText>
              ) : null}
              <SvgText
                x={coordinate.x}
                y={plotBottom + 18}
                fill={theme.colors.textHint}
                fontFamily={typography.bodyMedium.fontFamily}
                fontSize={11}
                textAnchor='middle'
              >
                {points[index].label}
              </SvgText>
            </G>
          ))}
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
