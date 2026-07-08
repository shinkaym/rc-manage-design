import { Stack } from 'expo-router/stack';

import { MainShell } from '@/features/shell/main-shell';

export default function MainLayout() {
  return (
    <MainShell>
      <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="report" />
        <Stack.Screen name="category" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="employee" />
        <Stack.Screen name="setting" />
        <Stack.Screen name="account" />
        <Stack.Screen name="map" />
        <Stack.Screen name="help" />
        <Stack.Screen name="about" />
      </Stack>
    </MainShell>
  );
}
