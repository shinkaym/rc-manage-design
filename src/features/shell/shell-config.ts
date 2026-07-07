import type { Href } from 'expo-router';

import {
  Calendar03Icon,
  Cancel01Icon,
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
  { label: 'Scan Image', href: '/scan' as Href, icon: ScanImageIcon },
  { label: 'Employee', href: '/employee' as Href, icon: UserGroupIcon },
  { label: 'Setting', href: '/setting' as Href, icon: Settings02Icon },
] as const;

export const drawerItems = [
  { label: 'Home', href: '/home' as Href, icon: Home01Icon },
  { label: 'Scan Image', href: '/scan' as Href, icon: ScanImageIcon },
  { label: 'Report', href: '/report' as Href, icon: ReceiptTextIcon },
  { label: 'Employee', href: '/employee' as Href, icon: UserGroupIcon },
  { label: 'My Account', href: '/account' as Href, icon: UserAccountIcon },
  { label: 'Setting', href: '/setting' as Href, icon: Settings02Icon },
  { label: 'Map', href: '/map' as Href, icon: MapsIcon },
  { label: 'Help', href: '/help' as Href, icon: HelpCircleIcon },
  { label: 'About Us', href: '/about' as Href, icon: InformationCircleIcon },
] as const;

export const shellIcons = {
  calendar: Calendar03Icon,
  close: Cancel01Icon,
  menu: Menu11Icon,
} as const;

export const shellTitles: Record<string, string> = {
  '/home': 'Home',
  '/report': 'Report',
  '/scan': 'Scan Image',
  '/employee': 'Employee',
  '/setting': 'Setting',
  '/account': 'My Account',
  '/map': 'Map',
  '/help': 'Help',
  '/about': 'About Us',
};
