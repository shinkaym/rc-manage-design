import {
  BrushIcon,
  MirrorIcon,
  PerfumeIcon,
  SparklesIcon,
  TreatmentIcon,
} from '@hugeicons/core-free-icons';

type TransactionIcon = typeof BrushIcon;

export type TransactionItem = {
  icon: TransactionIcon;
  note: string;
  time: string;
  title: string;
  total: number;
};

export type TransactionGroup = {
  date: Date;
  items: TransactionItem[];
};

export type HomeData = {
  calendarAmounts: Record<number, number>;
  groups: TransactionGroup[];
  summaryTotal: number;
};

export const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const weekdayNames = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function buildHomeData(now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const secondDate =
    now.getDate() > 1
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const groups: TransactionGroup[] = [
    {
      date: today,
      items: [
        {
          icon: BrushIcon,
          time: '09:30',
          title: 'Manicure Services',
          note: 'Classic hand care package',
          total: 150,
        },
        {
          icon: MirrorIcon,
          time: '11:00',
          title: 'Pedicure Services',
          note: 'Deep clean and polish refresh',
          total: 220,
        },
        {
          icon: TreatmentIcon,
          time: '12:30',
          title: 'Cuticle Care',
          note: 'Clean up and nourishment treatment',
          total: 90,
        },
        {
          icon: SparklesIcon,
          time: '13:15',
          title: 'Nail Art Details',
          note: 'Minimal sparkle accent design',
          total: 180,
        },
        {
          icon: PerfumeIcon,
          time: '14:00',
          title: 'Premium Polish',
          note: 'Long-lasting glossy finish',
          total: 120,
        },
        {
          icon: TreatmentIcon,
          time: '15:45',
          title: 'Nail Treatment',
          note: 'Repair and strengthening session',
          total: 280,
        },
        {
          icon: BrushIcon,
          time: '17:10',
          title: 'Quick Touch Up',
          note: 'Color correction before checkout',
          total: 70,
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

  const calendarAmounts: Record<number, number> = {
    [today.getDate()]: groups[0].items.reduce((sum, item) => sum + item.total, 0),
    [secondDate.getDate()]: groups[1].items.reduce((sum, item) => sum + item.total, 0),
  };

  const extraDay = today.getDate() + 3 <= getDaysInMonth(now.getFullYear(), now.getMonth())
    ? today.getDate() + 3
    : null;

  if (extraDay !== null) {
    calendarAmounts[extraDay] = 340;
  }

  const data: HomeData = {
    summaryTotal: 12500,
    calendarAmounts,
    groups,
  };

  return data;
}

export function buildCalendarRows(month: Date) {
  const cells = buildCalendarCells(month);
  const rows: Array<Array<Date | null>> = [];

  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7));
  }

  return rows;
}

export function formatCurrency(value: number, fractionDigits = 2) {
  const fixed = value.toFixed(fractionDigits);
  const [digits, decimals] = fixed.split('.');
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (fractionDigits === 0) {
    return formatted;
  }

  return `${formatted}.${decimals}`;
}

export function formatMonthDay(date: Date) {
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}

export function getWeekdayLabel(date: Date) {
  return weekdayNames[(date.getDay() + 6) % 7];
}

function buildCalendarCells(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstDay = new Date(year, monthIndex, 1);
  const leadingEmptyCount = firstDay.getDay();
  const cells: Array<Date | null> = [
    ...Array.from({ length: leadingEmptyCount }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, monthIndex, index + 1)),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
