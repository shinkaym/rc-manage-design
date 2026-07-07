export const fontFamily = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
} as const;

export const typography = {
  displayLarge: { fontFamily: fontFamily.bold, fontSize: 32, lineHeight: 38 },
  headlineMedium: { fontFamily: fontFamily.semibold, fontSize: 24, lineHeight: 30 },
  titleLarge: { fontFamily: fontFamily.semibold, fontSize: 18, lineHeight: 24 },
  titleMedium: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22 },
  bodyLarge: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 21 },
  labelLarge: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 17 },
} as const;
