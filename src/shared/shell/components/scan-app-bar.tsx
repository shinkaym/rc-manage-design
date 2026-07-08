import {
    ArrowLeft01Icon,
    CameraRotated01Icon,
    Cancel01Icon,
    CropIcon,
    Edit02Icon,
    FlashIcon,
    FlashOffIcon,
    Image01Icon,
    Rotate01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';

type ScanAppBarMode = 'capture' | 'crop' | 'preview';

type ScanAppBarProps = {
  isFlashEnabled: boolean;
  isWorking: boolean;
  mode: ScanAppBarMode;
  onBackToHome: () => void;
  onClosePreview: () => void;
  onCrop: () => void;
  onOpenGallery: () => void;
  onPlaceholderEdit: () => void;
  onRotate: () => void;
  onSwitchCamera: () => void;
  onToggleFlash: () => void;
};

export function ScanAppBar({
  isFlashEnabled,
  isWorking,
  mode,
  onBackToHome,
  onClosePreview,
  onCrop,
  onOpenGallery,
  onPlaceholderEdit,
  onRotate,
  onSwitchCamera,
  onToggleFlash,
}: ScanAppBarProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.topBar}>
      <FloatingSurfaceButton
        accent
        disabled={isWorking}
        icon={mode === 'capture' ? ArrowLeft01Icon : Cancel01Icon}
        onPress={mode === 'capture' ? onBackToHome : onClosePreview}
      />

      {mode === 'capture' ? (
        <View style={styles.topControlsGroup}>
          <TopControlButton disabled={isWorking} icon={Image01Icon} onPress={onOpenGallery} />
          <TopControlButton
            disabled={isWorking}
            icon={isFlashEnabled ? FlashIcon : FlashOffIcon}
            isActive={isFlashEnabled}
            onPress={onToggleFlash}
          />
          <TopControlButton disabled={isWorking} icon={CameraRotated01Icon} onPress={onSwitchCamera} />
        </View>
      ) : null}

      {mode === 'preview' ? (
        <View style={styles.topControlsGroup}>
          <TopControlButton disabled={isWorking} icon={CropIcon} onPress={onCrop} />
          <TopControlButton disabled={isWorking} icon={Rotate01Icon} onPress={onRotate} />
          <TopControlButton disabled={isWorking} icon={Edit02Icon} onPress={onPlaceholderEdit} />
        </View>
      ) : null}
    </View>
  );
}

type FloatingSurfaceButtonProps = {
  accent?: boolean;
  disabled?: boolean;
  icon: typeof ArrowLeft01Icon;
  onPress: () => void;
};

function FloatingSurfaceButton({ accent = false, disabled = false, icon, onPress }: FloatingSurfaceButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.surfaceButtonPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.surfaceButton,
            accent ? styles.surfaceButtonAccent : null,
            disabled ? styles.controlDisabled : null,
            pressed && !disabled ? styles.controlPressed : null,
          ]}
        >
          <HugeiconsIcon icon={icon} color={accent ? '#FFFFFF' : theme.colors.primary} size={22} strokeWidth={2.1} />
        </View>
      )}
    </Pressable>
  );
}

type TopControlButtonProps = {
  disabled?: boolean;
  icon: typeof Image01Icon;
  isActive?: boolean;
  onPress: () => void;
};

function TopControlButton({ disabled = false, icon, isActive = false, onPress }: TopControlButtonProps) {
  const styles = createStyles(useAppTheme());

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.topControlPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.topControlButton,
            isActive ? styles.topControlButtonActive : null,
            disabled ? styles.controlDisabled : null,
            pressed && !disabled ? styles.controlPressed : null,
          ]}
        >
          <HugeiconsIcon icon={icon} color='#FFFFFF' size={20} strokeWidth={1.95} />
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48,
      zIndex: 3,
    },
    topControlsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
      boxShadow: `0 10px 20px ${theme.colors.shadow}`,
    },
    surfaceButtonPressable: {
      borderRadius: radius.pill,
    },
    surfaceButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: theme.colors.surface,
      boxShadow: `0 4px 8px ${theme.colors.shadow}`,
    },
    surfaceButtonAccent: {
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
    },
    topControlPressable: {
      borderRadius: radius.md,
    },
    topControlButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: 'transparent',
    },
    topControlButtonActive: {
      backgroundColor: 'rgba(245, 124, 0, 0.18)',
    },
    controlPressed: {
      opacity: 0.88,
    },
    controlDisabled: {
      opacity: 0.5,
    },
  });
}
