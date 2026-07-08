import { usePathname } from 'expo-router';
import { Stack } from 'expo-router/stack';

import { MainShell } from '@/features/shell/main-shell';
import { mainShellTitles } from '@/features/shell/shell-config';

export default function DrawerOnlyLayout() {
  const pathname = usePathname();

  return (
    <MainShell
      headerTitle={mainShellTitles[pathname] ?? 'Category'}
      showBottomNav={false}
      showScanFab={false}>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </MainShell>
  );
}
