import { usePathname } from 'expo-router';
import { Stack } from 'expo-router/stack';

import { MonthSelectorChip } from '@/shared/shell/components/month-selector-chip';
import { MainShell } from '@/shared/shell/main-shell';
import { mainShellTitles, shellCenterWidgetRoutes } from '@/shared/shell/shell-config';

export default function MainTabsLayout() {
  const pathname = usePathname();
  const headerCenterChild = shellCenterWidgetRoutes.includes(pathname as (typeof shellCenterWidgetRoutes)[number]) ? (
    <MonthSelectorChip label={getMonthLabel()} onPress={() => {}} />
  ) : undefined;

  return (
    <MainShell headerCenterChild={headerCenterChild} headerTitle={mainShellTitles[pathname] ?? 'Home'}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </MainShell>
  );
}

function getMonthLabel() {
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `Monthly: ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}
