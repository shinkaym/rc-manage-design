import { Stack } from 'expo-router/stack';

export default function ScanShellLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
