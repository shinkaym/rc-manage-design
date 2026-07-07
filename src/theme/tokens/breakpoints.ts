export const breakpoints = {
  mobile: 600,
  tablet: 900,
  desktop: 1200,
  wide: 1536,
} as const;

export type BreakpointName = 'mobile' | 'tablet' | 'desktop' | 'wide';

export function getBreakpoint(width: number): BreakpointName {
  if (width < breakpoints.mobile) return 'mobile';
  if (width < breakpoints.tablet) return 'tablet';
  if (width < breakpoints.wide) return 'desktop';
  return 'wide';
}