import { useColorScheme } from '@/hooks/use-color-scheme';
import { themes } from '@/theme';

export function useAppTheme() {
  const scheme = useColorScheme();
  // return scheme === 'dark' ? themes.dark : themes.light;
  return themes.light;
}
