import { usePathname } from 'expo-router';
import { Stack } from 'expo-router/stack';

import { MainShell } from '@/features/shell/main-shell';
import { MonthSelectorChip } from '@/features/shell/month-selector-chip';
import { mainShellTitles, shellCenterWidgetRoutes } from '@/features/shell/shell-config';

export default function MainTabsLayout() {
  const pathname = usePathname();
  const headerCenterChild = shellCenterWidgetRoutes.includes(
    pathname as (typeof shellCenterWidgetRoutes)[number]
  )
    ? <MonthSelectorChip label={getMonthLabel()} onPress={() => {}} />
    : undefined;

  return (
    <MainShell
      headerCenterChild={headerCenterChild}
      headerTitle={mainShellTitles[pathname] ?? 'Home'}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </MainShell>
  );
}

function getMonthLabel() {
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `Monthly: ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}
