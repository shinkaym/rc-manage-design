import type { ChartPoint } from '@/mock/report-data';

export type ChartCoordinate = {
  x: number;
  y: number;
};

export function resolveChartMaxY(points: ChartPoint[], maxY?: number) {
  if (typeof maxY === 'number') {
    return maxY;
  }

  if (points.length === 0) {
    return 100;
  }

  const peak = points.reduce((current, point) => Math.max(current, point.value), 0);
  const padded = peak <= 0 ? 100 : peak * 1.2;

  return Math.ceil(padded / 10) * 10;
}

export function resolveChartInterval(maxY: number) {
  if (maxY <= 100) {
    return 25;
  }

  if (maxY <= 200) {
    return 50;
  }

  return Math.ceil(maxY / 4);
}

export function formatChartValue(value: number) {
  return value % 1 === 0 ? `${value}` : value.toFixed(1);
}

export function buildSmoothPath(points: ChartCoordinate[]) {
  if (points.length === 0) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;

    path += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
  }

  const lastPoint = points[points.length - 1];
  path += ` T ${lastPoint.x} ${lastPoint.y}`;

  return path;
}

export function buildAreaPath(points: ChartCoordinate[], bottomY: number) {
  if (points.length === 0) {
    return '';
  }

  const linePath = buildSmoothPath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
}

export function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function describeDonutArc(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}
