import { getBreakpoint } from '@/theme/tokens/breakpoints';
import { useWindowDimensions } from 'react-native';

export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);

  return {
    width,
    height,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isWide: breakpoint === 'wide',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
    isDesktopOrWide: breakpoint === 'desktop' || breakpoint === 'wide',
  };
}
