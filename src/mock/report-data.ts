import { BrushIcon, MirrorIcon, PerfumeIcon, SparklesIcon, TreatmentIcon } from '@hugeicons/core-free-icons';

import type { TransactionGroup, TransactionItem } from '@/mock/home-data';
import { palette } from '@/theme/tokens/colors';

export type ReportChartType = 'column' | 'line';

export type ChartPoint = {
  color?: string;
  label: string;
  value: number;
};

export type DonutChartItem = {
  color: string;
  label: string;
  value: number;
};

export type ProgressItem = {
  amount: number;
  color: string;
  icon: TransactionItem['icon'];
  percentage: number;
  progress: number;
  title: string;
  trackColor: string;
};

export type ReportData = {
  chartPoints: ChartPoint[];
  groups: TransactionGroup[];
  overviewItems: DonutChartItem[];
  progressItems: ProgressItem[];
  summaryTotal: number;
};

export function buildReportData(now: Date): ReportData {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const secondDate =
    now.getDate() > 1
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const overviewItems: DonutChartItem[] = [
    {
      label: 'Manicure',
      value: 100,
      color: palette.chartGold,
    },
    {
      label: 'Pedicure',
      value: 100,
      color: palette.chartCoral,
    },
    {
      label: 'Polish',
      value: 100,
      color: palette.chartCyan,
    },
  ];

  const progressItems: ProgressItem[] = [
    {
      icon: BrushIcon,
      title: 'Manicure',
      amount: 100,
      percentage: 33.33,
      progress: 0.33,
      color: palette.chartGold,
      trackColor: 'rgba(255, 197, 110, 0.24)',
    },
    {
      icon: MirrorIcon,
      title: 'Pedicure',
      amount: 100,
      percentage: 33.33,
      progress: 0.33,
      color: palette.chartCoral,
      trackColor: 'rgba(255, 138, 101, 0.24)',
    },
    {
      icon: TreatmentIcon,
      title: 'Polish',
      amount: 100,
      percentage: 33.33,
      progress: 0.33,
      color: palette.chartCyan,
      trackColor: 'rgba(73, 188, 217, 0.24)',
    },
  ];

  const groups: TransactionGroup[] = [
    {
      date: today,
      items: [
        {
          icon: BrushIcon,
          time: '15:44',
          title: 'Manicure Services',
          note: 'Bought a shirt',
          total: 100,
        },
        {
          icon: MirrorIcon,
          time: '16:30',
          title: 'Pedicure Services',
          note: 'Bought a shirt',
          total: 200,
        },
        {
          icon: TreatmentIcon,
          time: '17:30',
          title: 'Nail Treatment Services',
          note: 'Bought a shirt',
          total: 300,
        },
      ],
    },
    {
      date: secondDate,
      items: [
        {
          icon: SparklesIcon,
          time: '10:15',
          title: 'Spa Services',
          note: 'Relaxing package for premium clients',
          total: 300,
        },
        {
          icon: PerfumeIcon,
          time: '13:30',
          title: 'Massage Services',
          note: 'Back and shoulder relaxation',
          total: 180,
        },
      ],
    },
  ];

  return {
    summaryTotal: 12500,
    chartPoints: [
      { label: 'Jan', value: 170 },
      { label: 'Feb', value: 92 },
      { label: 'Mar', value: 134 },
      { label: 'Apr', value: 120 },
      { label: 'May', value: 148 },
      { label: 'Jun', value: 110 },
      { label: 'Jul', value: 156 },
      { label: 'Aug', value: 98 },
      { label: 'Sep', value: 142 },
      { label: 'Oct', value: 118 },
      { label: 'Nov', value: 164 },
      { label: 'Dec', value: 136 },
    ],
    overviewItems,
    progressItems,
    groups,
  };
}
