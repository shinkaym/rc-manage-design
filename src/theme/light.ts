import { palette } from './tokens/colors';

export const lightTheme = {
  colors: {
    primary: palette.primary,
    primarySoft: palette.primarySoft,
    secondary: palette.secondary,
    tertiary: palette.tertiary,
    background: palette.background,
    surface: palette.surface,
    surfaceAlt: palette.surfaceAlt,
    border: palette.border,
    borderAlt: palette.borderAlt,
    shadow: palette.shadow,
    text: palette.textSecondary,
    textPrimary: palette.textPrimary,
    textSecondary: palette.textSecondary,
    textTertiary: palette.textTertiary,
    textTertiarySoft: palette.textTertiarySoft,
    textHint: palette.textHint,
    chartGrid: palette.chartGrid,
    danger: palette.danger,
  },
} as const;
