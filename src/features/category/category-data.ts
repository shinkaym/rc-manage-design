import {
  Airplane01Icon,
  Book01Icon,
  Car01Icon,
  Coffee02Icon,
  GiftIcon,
  HealthIcon,
  House01Icon,
  MoneyReceive01Icon,
  Restaurant01Icon,
  ShoppingBag02Icon,
  TShirtIcon,
  Wallet02Icon,
} from '@hugeicons/core-free-icons';

export const categoryIconCatalog = {
  food: {
    icon: Restaurant01Icon,
  },
  transport: {
    icon: Car01Icon,
  },
  shopping: {
    icon: ShoppingBag02Icon,
  },
  housing: {
    icon: House01Icon,
  },
  travel: {
    icon: Airplane01Icon,
  },
  salary: {
    icon: MoneyReceive01Icon,
  },
  coffee: {
    icon: Coffee02Icon,
  },
  books: {
    icon: Book01Icon,
  },
  freelance: {
    icon: Wallet02Icon,
  },
  clothes: {
    icon: TShirtIcon,
  },
  gifts: {
    icon: GiftIcon,
  },
  health: {
    icon: HealthIcon,
  },
} as const;

export const categoryColorPresets = [
  '#F57C00',
  '#2F80ED',
  '#27AE60',
  '#D63384',
  '#7C4DFF',
  '#EB5757',
  '#0EA5B7',
  '#A16207',
] as const;

export type CategoryIconKey = keyof typeof categoryIconCatalog;

export type CategoryItem = {
  colorValue: string;
  id: string;
  iconKey: CategoryIconKey;
  label: string;
};

export const defaultCategorySeed: CategoryItem[] = [
  { id: 'default-food', iconKey: 'food', colorValue: '#F57C00', label: 'Thuc an' },
  { id: 'default-transport', iconKey: 'transport', colorValue: '#2F80ED', label: 'Xang xe' },
  { id: 'default-shopping', iconKey: 'shopping', colorValue: '#A16207', label: 'Mua sam' },
  { id: 'default-housing', iconKey: 'housing', colorValue: '#27AE60', label: 'Nha cua' },
  { id: 'default-travel', iconKey: 'travel', colorValue: '#0EA5B7', label: 'Du lich' },
  { id: 'default-salary', iconKey: 'salary', colorValue: '#7C4DFF', label: 'Luong' },
];

export const customCategorySeed: CategoryItem[] = [
  { id: 'custom-coffee', iconKey: 'coffee', colorValue: '#F57C00', label: 'Cafe' },
  { id: 'custom-books', iconKey: 'books', colorValue: '#2F80ED', label: 'Sach' },
  { id: 'custom-freelance', iconKey: 'freelance', colorValue: '#27AE60', label: 'Freelance' },
];

export const categoryIconGroups = [
  {
    title: 'Daily',
    iconKeys: ['food', 'transport', 'shopping', 'housing', 'travel', 'coffee'] as CategoryIconKey[],
  },
  {
    title: 'Money & Other',
    iconKeys: ['salary', 'freelance', 'books', 'clothes', 'gifts', 'health'] as CategoryIconKey[],
  },
] as const;
