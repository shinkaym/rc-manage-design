import type { ReceiptItemState } from './receipt-types';

export const initialReceiptItems: ReceiptItemState[] = [
  { id: 'fuel', name: 'Fuel', quantity: '1', price: '5.00' },
  { id: 'water', name: 'Sparkling Water', quantity: '2', price: '3.50' },
  { id: 'snack', name: 'Protein Snack', quantity: '1', price: '6.25' },
];

export function getReceiptItemTotal(item: ReceiptItemState) {
  return parseIntegerValue(item.quantity) * parseCurrencyValue(item.price);
}

export function createEmptyReceiptItem(): ReceiptItemState {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    quantity: '1',
    price: '0.00',
  };
}

export function moveItemByDirection(
  items: ReceiptItemState[],
  itemId: string,
  direction: 'down' | 'up'
) {
  const currentIndex = items.findIndex((item) => item.id === itemId);

  if (currentIndex === -1) {
    return items;
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [movingItem] = nextItems.splice(currentIndex, 1);
  nextItems.splice(targetIndex, 0, movingItem);

  return nextItems;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseCurrencyValue(value: string) {
  const normalizedValue = Number.parseFloat(value.replace(/[^0-9.]/g, ''));

  return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

export function parseIntegerValue(value: string) {
  const normalizedValue = Number.parseInt(value.replace(/[^0-9]/g, ''), 10);

  return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

export function sanitizeCurrencyInput(value: string) {
  const sanitizedValue = value.replace(/[^0-9.]/g, '');
  const firstDotIndex = sanitizedValue.indexOf('.');

  if (firstDotIndex === -1) {
    return sanitizedValue;
  }

  const head = sanitizedValue.slice(0, firstDotIndex + 1);
  const tail = sanitizedValue.slice(firstDotIndex + 1).replace(/\./g, '');

  return `${head}${tail}`;
}

export function sanitizeIntegerInput(value: string) {
  return value.replace(/[^0-9]/g, '');
}
