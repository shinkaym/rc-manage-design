import { darkTheme } from './dark';
import { lightTheme } from './light';
import { spacing } from './tokens/spacing';
import { radius } from './tokens/radius';
import { typography } from './tokens/typography';

export const themes = {
  light: { ...lightTheme, spacing, radius, typography },
  dark: { ...darkTheme, spacing, radius, typography },
} as const;

export type AppTheme = (typeof themes)['light'];