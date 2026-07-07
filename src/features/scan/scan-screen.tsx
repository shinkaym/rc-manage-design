import {
  ArrowLeft01Icon,
  CameraRotated01Icon,
  FlashIcon,
  FlashOffIcon,
  Image01Icon,
  MinusSignIcon,
  PlusSignIcon,
  ScanImageIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';
import { radius } from '@/theme/tokens/radius';
import { spacing } from '@/theme/tokens/spacing';
import { typography } from '@/theme/tokens/typography';

const minZoomLevel = 1;
const maxZoomLevel = 3;
const zoomStep = 0.25;

export function ScanScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRetryingCamera, setIsRetryingCamera] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const normalizedZoom = (zoomLevel - minZoomLevel) / (maxZoomLevel - minZoomLevel);

  useEffect(() => {
    requestCameraPermission().catch(() => {
      setStatusMessage('Unable to request camera permission right now.');
    });
  }, [requestCameraPermission]);

  function showMessage(message: string) {
    setStatusMessage(message);
  }

  function handleBack() {
    router.replace('/home');
  }

  function handleToggleFlash() {
    setIsFlashEnabled((value) => !value);
  }

  function handleSwitchCamera() {
    setIsCameraReady(false);
    setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function handleZoomStep(direction: 'in' | 'out') {
    setZoomLevel((current) => {
      const nextValue =
        direction === 'in' ? current + zoomStep : current - zoomStep;

      return Math.max(minZoomLevel, Math.min(maxZoomLevel, Number(nextValue.toFixed(2))));
    });
  }

  async function handleOpenGallery() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showMessage(
          permission.canAskAgain === false
            ? 'Photo library permission was denied. Open settings to continue.'
            : 'Photo library permission is required to pick receipt images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        showMessage('Image selected. Next step is connecting this to preview/edit.');
      }
    } catch {
      showMessage('Unable to open the photo library right now.');
    }
  }

  async function handleCaptureImage() {
    if (!cameraRef.current || !isCameraReady || isCapturing) {
      return;
    }

    setIsCapturing(true);

    try {
      await cameraRef.current.takePictureAsync({
        quality: 1,
      });
      showMessage('Photo captured. Next step is connecting this to preview/edit.');
    } catch {
      showMessage('Unable to capture image right now.');
    } finally {
      setIsCapturing(false);
    }
  }

  async function handleRetryCamera() {
    setIsRetryingCamera(true);

    try {
      await requestCameraPermission();
      setIsCameraReady(false);
    } catch {
      showMessage('Unable to request camera permission right now.');
    } finally {
      setIsRetryingCamera(false);
    }
  }

  const hasCameraPermission = cameraPermission?.granted === true;
  const shouldShowCameraOverlay = !hasCameraPermission || !isCameraReady;

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.screen}>
        {hasCameraPermission ? (
          <CameraView
            ref={cameraRef}
            style={styles.cameraPreview}
            facing={cameraFacing}
            flash={isFlashEnabled ? 'on' : 'off'}
            enableTorch={isFlashEnabled}
            zoom={normalizedZoom}
            mirror={cameraFacing === 'front'}
            animateShutter={false}
            onCameraReady={() => setIsCameraReady(true)}
          />
        ) : (
          <View style={styles.previewBackdrop}>
            <View style={styles.previewGlowTop} />
            <View style={styles.previewGlowBottom} />
          </View>
        )}

        <View style={styles.content}>
          <TopBar
            isFlashEnabled={isFlashEnabled}
            onBack={handleBack}
            onOpenGallery={handleOpenGallery}
            onSwitchCamera={handleSwitchCamera}
            onToggleFlash={handleToggleFlash}
          />

          <View style={styles.centerContent}>
            <DocumentGuide />
            {shouldShowCameraOverlay ? (
              <CameraStatusOverlay
                canOpenSettings={cameraPermission?.canAskAgain === false}
                errorMessage={
                  hasCameraPermission
                    ? 'Preparing camera...'
                    : cameraPermission?.canAskAgain === false
                      ? 'Camera permission was denied previously. Open settings to continue.'
                      : 'Camera permission is required to scan receipts.'
                }
                isLoading={hasCameraPermission || isRetryingCamera}
                onOpenSettings={() => Linking.openSettings()}
                onRetry={handleRetryCamera}
              />
            ) : null}
          </View>

          <View style={styles.bottomSection}>
            {statusMessage ? (
              <View style={styles.statusMessagePill}>
                <Text style={styles.statusMessageText}>{statusMessage}</Text>
              </View>
            ) : null}

            <ZoomControl
              currentZoomLevel={zoomLevel}
              onZoomIn={() => handleZoomStep('in')}
              onZoomOut={() => handleZoomStep('out')}
            />

            <CaptureButton
              isBusy={isCapturing}
              onPress={handleCaptureImage}
            />
          </View>
        </View>
      </View>
    </>
  );
}

type CameraStatusOverlayProps = {
  canOpenSettings: boolean;
  errorMessage: string;
  isLoading: boolean;
  onOpenSettings: () => void;
  onRetry: () => void;
};

function CameraStatusOverlay({
  canOpenSettings,
  errorMessage,
  isLoading,
  onOpenSettings,
  onRetry,
}: CameraStatusOverlayProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.cameraStatusOverlay}>
      <Text style={styles.cameraStatusText}>{errorMessage}</Text>
      <View style={styles.cameraStatusActions}>
        {!isLoading ? (
          <PillActionButton label="Retry" onPress={onRetry} />
        ) : null}
        {canOpenSettings ? (
          <PillActionButton label="Open settings" onPress={onOpenSettings} outlined />
        ) : null}
      </View>
    </View>
  );
}

type PillActionButtonProps = {
  label: string;
  onPress: () => void;
  outlined?: boolean;
};

function PillActionButton({
  label,
  onPress,
  outlined = false,
}: PillActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable onPress={onPress} style={styles.pillActionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.pillActionButton,
            outlined ? styles.pillActionButtonOutlined : styles.pillActionButtonFilled,
            pressed ? styles.controlPressed : null,
          ]}>
          <Text
            style={[
              styles.pillActionLabel,
              outlined ? styles.pillActionLabelOutlined : styles.pillActionLabelFilled,
            ]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

type TopBarProps = {
  isFlashEnabled: boolean;
  onBack: () => void;
  onOpenGallery: () => void;
  onSwitchCamera: () => void;
  onToggleFlash: () => void;
};

function TopBar({
  isFlashEnabled,
  onBack,
  onOpenGallery,
  onSwitchCamera,
  onToggleFlash,
}: TopBarProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.topBar}>
      <View style={styles.topBarBackSlot}>
        <FloatingCircleButton
          icon={ArrowLeft01Icon}
          accent
          onPress={onBack}
        />
      </View>

      <View style={styles.topControlsContainer}>
        <FloatingSquareButton icon={Image01Icon} onPress={onOpenGallery} />
        <View style={styles.topControlsSpacer} />
        <FloatingSquareButton
          icon={isFlashEnabled ? FlashIcon : FlashOffIcon}
          isActive={isFlashEnabled}
          onPress={onToggleFlash}
        />
        <View style={styles.topControlsSpacer} />
        <FloatingSquareButton icon={CameraRotated01Icon} onPress={onSwitchCamera} />
      </View>
    </View>
  );
}

function DocumentGuide() {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <View style={styles.documentGuide}>
      <GuideCorner position="topLeft" />
      <GuideCorner position="topRight" />
      <GuideCorner position="bottomLeft" />
      <GuideCorner position="bottomRight" />

      <View style={styles.documentGuideLabelContainer}>
        <Text style={styles.documentGuideLabel}>Align receipt inside frame</Text>
      </View>
    </View>
  );
}

type GuideCornerProps = {
  position: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
};

function GuideCorner({ position }: GuideCornerProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);
  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('Left');

  return (
    <View
      style={[
        styles.guideCorner,
        isTop ? styles.guideCornerTop : styles.guideCornerBottom,
        isLeft ? styles.guideCornerLeft : styles.guideCornerRight,
      ]}>
      <View
        style={[
          styles.guideCornerHorizontal,
          isLeft ? styles.guideCornerHorizontalLeft : styles.guideCornerHorizontalRight,
          isTop ? styles.guideCornerHorizontalTop : styles.guideCornerHorizontalBottom,
        ]}
      />
      <View
        style={[
          styles.guideCornerVertical,
          isLeft ? styles.guideCornerVerticalLeft : styles.guideCornerVerticalRight,
          isTop ? styles.guideCornerVerticalTop : styles.guideCornerVerticalBottom,
        ]}
      />
    </View>
  );
}

type ZoomControlProps = {
  currentZoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

function ZoomControl({
  currentZoomLevel,
  onZoomIn,
  onZoomOut,
}: ZoomControlProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);
  const trackWidth = 220;
  const thumbSize = 18;
  const progress =
    (currentZoomLevel - minZoomLevel) / (maxZoomLevel - minZoomLevel);
  const thumbLeft = progress * (trackWidth - thumbSize);

  return (
    <View style={styles.zoomControl}>
      <View style={styles.zoomControlRow}>
        <Pressable onPress={onZoomOut} style={styles.zoomStepPressable}>
          {({ pressed }) => (
            <View style={[styles.zoomStepButton, pressed ? styles.controlPressed : null]}>
              <HugeiconsIcon icon={MinusSignIcon} size={18} color="#FFFFFF" strokeWidth={2.1} />
            </View>
          )}
        </Pressable>

        <View style={styles.zoomTrackWrapper}>
          <View style={styles.zoomTrack}>
            <View style={styles.zoomTrackFill} />
            <View style={[styles.zoomThumb, { left: thumbLeft }]} />
          </View>
        </View>

        <Pressable onPress={onZoomIn} style={styles.zoomStepPressable}>
          {({ pressed }) => (
            <View style={[styles.zoomStepButton, pressed ? styles.controlPressed : null]}>
              <HugeiconsIcon icon={PlusSignIcon} size={18} color="#FFFFFF" strokeWidth={2.1} />
            </View>
          )}
        </Pressable>
      </View>

      <Text style={styles.zoomValueLabel}>{currentZoomLevel.toFixed(2)}x</Text>
    </View>
  );
}

type CaptureButtonProps = {
  isBusy: boolean;
  onPress: () => void;
};

function CaptureButton({ isBusy, onPress }: CaptureButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable onPress={onPress} style={styles.capturePressable}>
      {({ pressed }) => (
        <View style={[styles.captureButton, pressed ? styles.captureButtonPressed : null]}>
          <HugeiconsIcon
            icon={isBusy ? FlashOffIcon : ScanImageIcon}
            size={38}
            color="#FFFFFF"
            strokeWidth={1.9}
          />
        </View>
      )}
    </Pressable>
  );
}

type FloatingCircleButtonProps = {
  accent?: boolean;
  icon: typeof ArrowLeft01Icon;
  onPress: () => void;
};

function FloatingCircleButton({
  accent = false,
  icon,
  onPress,
}: FloatingCircleButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable onPress={onPress} style={styles.floatingCirclePressable}>
      {({ pressed }) => (
        <View style={[styles.floatingCircleButton, pressed ? styles.controlPressed : null]}>
          <HugeiconsIcon
            icon={icon}
            size={20}
            color={accent ? theme.colors.primary : '#FFFFFF'}
            strokeWidth={2}
          />
        </View>
      )}
    </Pressable>
  );
}

type FloatingSquareButtonProps = {
  icon: typeof Image01Icon;
  isActive?: boolean;
  onPress: () => void;
};

function FloatingSquareButton({
  icon,
  isActive = false,
  onPress,
}: FloatingSquareButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable onPress={onPress} style={styles.floatingSquarePressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.floatingSquareButton,
            isActive ? styles.floatingSquareButtonActive : null,
            pressed ? styles.controlPressed : null,
          ]}>
          <HugeiconsIcon
            icon={icon}
            size={23}
            color={isActive ? theme.colors.primary : '#FFFFFF'}
            strokeWidth={1.9}
          />
        </View>
      )}
    </Pressable>
  );
}

function createStyles(
  theme: ReturnType<typeof useAppTheme>,
  topInset: number,
  bottomInset: number
) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#000000',
    },
    cameraPreview: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    previewBackdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: '#08090A',
    },
    previewGlowTop: {
      position: 'absolute',
      top: '8%',
      left: '-10%',
      width: 260,
      height: 260,
      borderRadius: radius.xxxl,
      backgroundColor: 'rgba(245, 124, 0, 0.10)',
      transform: [{ rotate: '18deg' }],
    },
    previewGlowBottom: {
      position: 'absolute',
      right: '-18%',
      bottom: '10%',
      width: 300,
      height: 300,
      borderRadius: radius.xxxl,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      transform: [{ rotate: '-12deg' }],
    },
    content: {
      flex: 1,
      paddingTop: topInset > 0 ? topInset + spacing.sm : spacing.xl,
      paddingRight: spacing.lg,
      paddingBottom: bottomInset > 0 ? bottomInset + spacing.lg : spacing.xl,
      paddingLeft: spacing.lg,
      justifyContent: 'space-between',
    },
    topBar: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      minHeight: 48,
    },
    topBarBackSlot: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    topControlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
      boxShadow: `0 10px 20px ${theme.colors.shadow}`,
    },
    topControlsSpacer: {
      width: spacing.xs,
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    documentGuide: {
      width: '82%',
      maxWidth: 360,
      aspectRatio: 0.7,
      justifyContent: 'flex-end',
    },
    cameraStatusOverlay: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    cameraStatusText: {
      ...typography.bodyMedium,
      maxWidth: 360,
      color: '#FFFFFF',
      textAlign: 'center',
      opacity: 0.9,
    },
    cameraStatusActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    pillActionPressable: {
      borderRadius: radius.lg,
    },
    pillActionButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
    },
    pillActionButtonFilled: {
      backgroundColor: theme.colors.primary,
    },
    pillActionButtonOutlined: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.24)',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    pillActionLabel: {
      ...typography.labelLarge,
      fontFamily: typography.titleMedium.fontFamily,
    },
    pillActionLabelFilled: {
      color: '#FFFFFF',
    },
    pillActionLabelOutlined: {
      color: '#FFFFFF',
    },
    guideCorner: {
      position: 'absolute',
      width: 32,
      height: 32,
    },
    guideCornerTop: {
      top: spacing.md,
    },
    guideCornerBottom: {
      bottom: spacing.md,
    },
    guideCornerLeft: {
      left: spacing.md,
    },
    guideCornerRight: {
      right: spacing.md,
    },
    guideCornerHorizontal: {
      position: 'absolute',
      width: 20,
      height: 3,
      borderRadius: radius.pill,
      backgroundColor: theme.colors.primary,
    },
    guideCornerHorizontalLeft: {
      left: 0,
    },
    guideCornerHorizontalRight: {
      right: 0,
    },
    guideCornerHorizontalTop: {
      top: 0,
    },
    guideCornerHorizontalBottom: {
      bottom: 0,
    },
    guideCornerVertical: {
      position: 'absolute',
      width: 3,
      height: 20,
      borderRadius: radius.pill,
      backgroundColor: theme.colors.primary,
    },
    guideCornerVerticalLeft: {
      left: 0,
    },
    guideCornerVerticalRight: {
      right: 0,
    },
    guideCornerVerticalTop: {
      top: 0,
    },
    guideCornerVerticalBottom: {
      bottom: 0,
    },
    documentGuideLabelContainer: {
      marginRight: spacing.lg,
      marginBottom: spacing.lg,
      marginLeft: spacing.lg,
    },
    documentGuideLabel: {
      ...typography.labelLarge,
      color: 'rgba(255, 255, 255, 0.84)',
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    bottomSection: {
      alignItems: 'center',
      paddingBottom: spacing.lg,
      gap: spacing.lg,
    },
    statusMessagePill: {
      maxWidth: 360,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.78)',
    },
    statusMessageText: {
      ...typography.bodyMedium,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    zoomControl: {
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
    },
    zoomControlRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    zoomStepPressable: {
      borderRadius: radius.pill,
    },
    zoomStepButton: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderCurve: 'continuous',
    },
    zoomTrackWrapper: {
      width: 220,
      marginHorizontal: spacing.xs,
      justifyContent: 'center',
    },
    zoomTrack: {
      width: '100%',
      height: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.42)',
      borderRadius: radius.pill,
      overflow: 'visible',
      justifyContent: 'center',
    },
    zoomTrackFill: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: radius.pill,
      opacity: 0.35,
    },
    zoomThumb: {
      position: 'absolute',
      top: -8,
      width: 18,
      height: 18,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
    },
    zoomValueLabel: {
      ...typography.labelLarge,
      marginTop: spacing.xxs,
      color: 'rgba(255, 255, 255, 0.84)',
      textAlign: 'center',
    },
    capturePressable: {
      borderRadius: radius.pill,
    },
    captureButton: {
      width: 82,
      height: 82,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: theme.colors.primary,
      boxShadow: `0 10px 24px rgba(245, 124, 0, 0.38)`,
    },
    captureButtonPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    floatingCirclePressable: {
      borderRadius: radius.pill,
    },
    floatingCircleButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
      boxShadow: `0 8px 16px ${theme.colors.shadow}`,
    },
    floatingSquarePressable: {
      borderRadius: radius.md,
    },
    floatingSquareButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: 'transparent',
    },
    floatingSquareButtonActive: {
      backgroundColor: 'rgba(245, 124, 0, 0.18)',
    },
    controlPressed: {
      opacity: 0.88,
    },
  });
}
