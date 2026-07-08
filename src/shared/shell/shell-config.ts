import type { Href } from 'expo-router';

import {
  ArrowLeft01Icon,
  Calendar03Icon,
  Cancel01Icon,
  GridViewIcon,
  HelpCircleIcon,
  Home01Icon,
  InformationCircleIcon,
  MapsIcon,
  Menu11Icon,
  ReceiptTextIcon,
  ScanImageIcon,
  Settings02Icon,
  UserAccountIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';

export const shellMetrics = {
  bottomNavHeight: 72,
  centerFabSize: 64,
  centerFabLabelHeight: 12,
  centerFabGap: 8,
  sideFloatingButtonSize: 64,
  sideFloatingRight: 20,
  sideFloatingBottom: 88,
  drawerScale: 0.8,
  drawerCornerRadius: 28,
  drawerOffsetY: 20,
  contentBottomInset: 128,
} as const;

export const shellNavRoutes = [
  { label: 'Home', href: '/home' as Href, icon: Home01Icon },
  { label: 'Report', href: '/report' as Href, icon: ReceiptTextIcon },
  { label: 'Capture', href: '/scan' as Href, icon: ScanImageIcon },
  { label: 'Employee', href: '/employee' as Href, icon: UserGroupIcon },
  { label: 'Setting', href: '/setting' as Href, icon: Settings02Icon },
] as const;

export const shellIcons = {
  back: ArrowLeft01Icon,
  calendar: Calendar03Icon,
  close: Cancel01Icon,
  menu: Menu11Icon,
} as const;

export const mainShellTitles: Record<string, string> = {
  '/home': 'Home',
  '/report': 'Report',
  '/category': 'Category',
  '/employee': 'Employee Portal',
  '/setting': 'Setting',
};

export const shellCenterWidgetRoutes = ['/home', '/report'] as const;

export const drawerItems = [
  { label: 'Home', href: '/home' as Href, icon: Home01Icon, navigationMode: 'replace' as const },
  { label: 'Report', href: '/report' as Href, icon: ReceiptTextIcon, navigationMode: 'replace' as const },
  { label: 'Category', href: '/category' as Href, icon: GridViewIcon, navigationMode: 'replace' as const },
  { label: 'Employee', href: '/employee' as Href, icon: UserGroupIcon, navigationMode: 'replace' as const },
  { label: 'My Account', href: '/setting/my-account' as Href, icon: UserAccountIcon, navigationMode: 'push' as const },
  { label: 'Setting', href: '/setting' as Href, icon: Settings02Icon, navigationMode: 'replace' as const },
  { label: 'Map', href: '/setting/map' as Href, icon: MapsIcon, navigationMode: 'push' as const },
  { label: 'Help', href: '/setting/help' as Href, icon: HelpCircleIcon, navigationMode: 'push' as const },
  { label: 'About Us', href: '/setting/about-us' as Href, icon: InformationCircleIcon, navigationMode: 'push' as const },
] as const;

export type DrawerNavigationMode = (typeof drawerItems)[number]['navigationMode'];

export const subShellFallbacks: Partial<Record<string, Href>> = {
  '/setting/my-account': '/setting',
  '/setting/map': '/setting',
  '/setting/help': '/setting',
  '/setting/about-us': '/setting',
  '/employee/create': '/employee',
  '/scan/preview': '/scan',
};

export const subShellTitles: Record<string, string> = {
  '/setting/my-account': 'My Account',
  '/setting/map': 'Map',
  '/setting/help': 'Help',
  '/setting/about-us': 'About Us',
  '/employee/create': 'Create Employee',
  '/scan/preview': 'Preview Scan',
};
