import {
  ArrowLeft01Icon,
  CameraRotated01Icon,
  Cancel01Icon,
  CropIcon,
  Download01Icon,
  Edit02Icon,
  FlashIcon,
  FlashOffIcon,
  Image01Icon,
  MailSend02Icon,
  MinusSignIcon,
  PlusSignIcon,
  Rotate01Icon,
  RotateCcwSquareIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { createAssetAsync, requestPermissionsAsync } from 'expo-media-library/legacy';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Linking,
  PanResponder,
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
const minCropSize = 88;

type ScreenMode = 'capture' | 'crop' | 'preview';

type PreviewImageState = {
  height: number;
  uri: string;
  width: number;
};

type StageLayout = {
  height: number;
  width: number;
};

type CropRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type ImageFrame = CropRect;

type CropHandlePosition = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

export function ScanScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const [isRetryingCamera, setIsRetryingCamera] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [mode, setMode] = useState<ScreenMode>('capture');
  const [previewImage, setPreviewImage] = useState<PreviewImageState | null>(null);
  const [stageLayout, setStageLayout] = useState<StageLayout>({ width: 0, height: 0 });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const normalizedZoom = (zoomLevel - minZoomLevel) / (maxZoomLevel - minZoomLevel);
  const hasCameraPermission = cameraPermission?.granted === true;
  const shouldShowCameraOverlay =
    mode === 'capture' && (!hasCameraPermission || !isCameraReady || isRetryingCamera);
  const imageFrame = previewImage ? getContainedFrame(stageLayout, previewImage) : null;

  useEffect(() => {
    requestCameraPermission().catch(() => {
      setStatusMessage('Unable to request camera permission right now.');
    });
  }, [requestCameraPermission]);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setStatusMessage((currentValue) => (currentValue === statusMessage ? null : currentValue));
    }, 2600);

    return () => clearTimeout(timeoutId);
  }, [statusMessage]);

  useEffect(() => {
    if (mode !== 'crop' || !imageFrame || cropRect) {
      return;
    }

    setCropRect(createDefaultCropRect(imageFrame));
  }, [cropRect, imageFrame, mode]);

  function showMessage(message: string) {
    setStatusMessage(message);
  }

  function handleBackToHome() {
    router.replace('/home');
  }

  function handleClosePreview() {
    setCropRect(null);
    setIsCameraReady(false);
    setMode('capture');
    setPreviewImage(null);
    setStatusMessage(null);
  }

  function handleToggleFlash() {
    setIsFlashEnabled((currentValue) => !currentValue);
  }

  function handleSwitchCamera() {
    setIsCameraReady(false);
    setCameraFacing((currentValue) => (currentValue === 'back' ? 'front' : 'back'));
  }

  function handleZoomStep(direction: 'in' | 'out') {
    setZoomLevel((currentValue) => {
      const nextValue =
        direction === 'in' ? currentValue + zoomStep : currentValue - zoomStep;

      return Math.max(minZoomLevel, Math.min(maxZoomLevel, Number(nextValue.toFixed(2))));
    });
  }

  function handleStageLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setStageLayout((currentValue) => {
      if (currentValue.width === width && currentValue.height === height) {
        return currentValue;
      }

      return { width, height };
    });
  }

  async function handleOpenGallery() {
    if (isWorking) {
      return;
    }

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
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const selectedAsset = result.assets[0];
      setCropRect(null);
      setMode('preview');
      setPreviewImage({
        uri: selectedAsset.uri,
        width: selectedAsset.width ?? stageLayout.width ?? 1,
        height: selectedAsset.height ?? stageLayout.height ?? 1,
      });
    } catch {
      showMessage('Unable to open the photo library right now.');
    }
  }

  async function handleCaptureImage() {
    if (!cameraRef.current || !isCameraReady || isCapturing || isWorking) {
      return;
    }

    setIsCapturing(true);

    try {
      const capturedPhoto = await cameraRef.current.takePictureAsync({
        quality: 1,
      });

      if (!capturedPhoto?.uri) {
        showMessage('Unable to capture image right now.');
        return;
      }

      setCropRect(null);
      setMode('preview');
      setPreviewImage({
        uri: capturedPhoto.uri,
        width: capturedPhoto.width ?? stageLayout.width ?? 1,
        height: capturedPhoto.height ?? stageLayout.height ?? 1,
      });
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

  function handleEnterCropMode() {
    if (!previewImage) {
      return;
    }

    setCropRect(null);
    setMode('crop');
  }

  async function updatePreviewImage(transform: (uri: string) => Promise<PreviewImageState>) {
    if (!previewImage || isWorking) {
      return;
    }

    setIsWorking(true);

    try {
      const nextImage = await transform(previewImage.uri);
      setPreviewImage(nextImage);
    } catch {
      showMessage('Unable to update the image right now.');
    } finally {
      setIsWorking(false);
    }
  }

  async function handleRotatePreviewImage() {
    const nextMode = mode === 'crop' ? 'crop' : 'preview';
    setCropRect(null);

    await updatePreviewImage(async (imageUri) => {
      const context = ImageManipulator.manipulate(imageUri);
      context.rotate(90);
      const renderedImage = await context.renderAsync();
      const savedImage = await renderedImage.saveAsync({
        compress: 1,
        format: SaveFormat.JPEG,
      });

      return {
        uri: savedImage.uri,
        width: savedImage.width,
        height: savedImage.height,
      };
    });

    setMode(nextMode);
  }

  async function handleSaveCrop() {
    if (!previewImage || !cropRect || !imageFrame) {
      return;
    }

    const cropInPixels = mapCropRectToImagePixels(cropRect, imageFrame, previewImage);

    setIsWorking(true);

    try {
      const context = ImageManipulator.manipulate(previewImage.uri);
      context.crop(cropInPixels);
      const renderedImage = await context.renderAsync();
      const savedImage = await renderedImage.saveAsync({
        compress: 1,
        format: SaveFormat.JPEG,
      });

      setPreviewImage({
        uri: savedImage.uri,
        width: savedImage.width,
        height: savedImage.height,
      });
      setCropRect(null);
      setMode('preview');
    } catch {
      showMessage('Unable to crop the image right now.');
    } finally {
      setIsWorking(false);
    }
  }

  function handleCancelCrop() {
    setCropRect(null);
    setMode('preview');
  }

  function handlePreviewPlaceholderAction() {
    showMessage('This edit tool is queued for the next step.');
  }

  async function handleDownloadImage() {
    if (!previewImage || isWorking) {
      return;
    }

    setIsWorking(true);

    try {
      const permission = await requestPermissionsAsync(true);

      if (!permission.granted) {
        showMessage(
          permission.canAskAgain === false
            ? 'Photo library permission was denied. Open settings to continue.'
            : 'Photo library permission is required to download receipt images.'
        );
        return;
      }

      await createAssetAsync(previewImage.uri);
      showMessage('Image saved to your photo library.');
    } catch {
      showMessage('Unable to save the image right now.');
    } finally {
      setIsWorking(false);
    }
  }

  function handleSendImage() {
    showMessage('Preview confirmed. Send flow can be connected next.');
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.screen}>
        {mode === 'capture' && hasCameraPermission ? (
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
          {mode !== 'crop' ? (
            <TopBar
              isFlashEnabled={isFlashEnabled}
              isWorking={isWorking}
              mode={mode}
              onBackToHome={handleBackToHome}
              onClosePreview={handleClosePreview}
              onCrop={handleEnterCropMode}
              onOpenGallery={handleOpenGallery}
              onPlaceholderEdit={handlePreviewPlaceholderAction}
              onRotate={handleRotatePreviewImage}
              onSwitchCamera={handleSwitchCamera}
              onToggleFlash={handleToggleFlash}
            />
          ) : null}

          <View style={styles.centerStage} onLayout={handleStageLayout}>
            {previewImage ? (
              <Image
                source={{ uri: previewImage.uri }}
                style={styles.previewImage}
                contentFit="contain"
              />
            ) : null}

            {mode === 'crop' && imageFrame && cropRect ? (
              <CropOverlay imageFrame={imageFrame} cropRect={cropRect} onChangeRect={setCropRect} />
            ) : null}

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

          {mode === 'capture' ? (
            <CaptureFooter
              currentZoomLevel={zoomLevel}
              isBusy={isCapturing}
              message={statusMessage}
              onCapture={handleCaptureImage}
              onZoomIn={() => handleZoomStep('in')}
              onZoomOut={() => handleZoomStep('out')}
            />
          ) : null}

          {mode === 'preview' ? (
            <PreviewFooter
              isWorking={isWorking}
              message={statusMessage}
              onDownload={handleDownloadImage}
              onSend={handleSendImage}
            />
          ) : null}

          {mode === 'crop' ? (
            <CropFooter
              isWorking={isWorking}
              message={statusMessage}
              onCancel={handleCancelCrop}
              onDone={handleSaveCrop}
              onRotate={handleRotatePreviewImage}
            />
          ) : null}
        </View>
      </View>
    </>
  );
}

type TopBarProps = {
  isFlashEnabled: boolean;
  isWorking: boolean;
  mode: ScreenMode;
  onBackToHome: () => void;
  onClosePreview: () => void;
  onCrop: () => void;
  onOpenGallery: () => void;
  onPlaceholderEdit: () => void;
  onRotate: () => void;
  onSwitchCamera: () => void;
  onToggleFlash: () => void;
};

function TopBar({
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
}: TopBarProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

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
          <TopControlButton
            disabled={isWorking}
            icon={CameraRotated01Icon}
            onPress={onSwitchCamera}
          />
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
      {isLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
      <Text style={styles.cameraStatusText}>{errorMessage}</Text>
      <View style={styles.cameraStatusActions}>
        {!isLoading ? <PillActionButton label="Retry" onPress={onRetry} /> : null}
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

type CaptureFooterProps = {
  currentZoomLevel: number;
  isBusy: boolean;
  message: string | null;
  onCapture: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

function CaptureFooter({
  currentZoomLevel,
  isBusy,
  message,
  onCapture,
  onZoomIn,
  onZoomOut,
}: CaptureFooterProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.bottomSection}>
      {message ? (
        <View style={styles.statusMessagePill}>
          <Text style={styles.statusMessageText}>{message}</Text>
        </View>
      ) : null}

      <ZoomControl
        currentZoomLevel={currentZoomLevel}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />

      <CaptureButton isBusy={isBusy} onPress={onCapture} />
    </View>
  );
}

type PreviewFooterProps = {
  isWorking: boolean;
  message: string | null;
  onDownload: () => void;
  onSend: () => void;
};

function PreviewFooter({
  isWorking,
  message,
  onDownload,
  onSend,
}: PreviewFooterProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.previewFooter}>
      {message ? (
        <View style={styles.statusMessagePill}>
          <Text style={styles.statusMessageText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.previewActionsRow}>
        <TextActionButton
          disabled={isWorking}
          icon={Download01Icon}
          label="Download"
          onPress={onDownload}
        />

        <SendActionButton disabled={isWorking} onPress={onSend} />
      </View>
    </View>
  );
}

type CropFooterProps = {
  isWorking: boolean;
  message: string | null;
  onCancel: () => void;
  onDone: () => void;
  onRotate: () => void;
};

function CropFooter({
  isWorking,
  message,
  onCancel,
  onDone,
  onRotate,
}: CropFooterProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.cropFooter}>
      {message ? (
        <View style={styles.statusMessagePill}>
          <Text style={styles.statusMessageText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.cropToolbar}>
        <ToolbarIconButton disabled={isWorking} icon={Cancel01Icon} onPress={onCancel} />
        <ToolbarIconButton
          disabled={isWorking}
          icon={RotateCcwSquareIcon}
          onPress={onRotate}
        />
        <CropDoneButton disabled={isWorking} onPress={onDone} />
      </View>
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
  const progress = (currentZoomLevel - minZoomLevel) / (maxZoomLevel - minZoomLevel);
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
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <Pressable disabled={isBusy} onPress={onPress} style={styles.capturePressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.captureShell,
            isBusy ? styles.captureButtonBusy : null,
            pressed ? styles.captureButtonPressed : null,
          ]}>
          <View style={[styles.captureOuterRing, isBusy ? styles.captureOuterRingBusy : null]}>
            <View style={[styles.captureMiddleRing, isBusy ? styles.captureMiddleRingBusy : null]}>
              <View style={[styles.captureCore, isBusy ? styles.captureCoreBusy : null]} />
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

type FloatingSurfaceButtonProps = {
  accent?: boolean;
  disabled?: boolean;
  icon: typeof ArrowLeft01Icon;
  onPress: () => void;
};

function FloatingSurfaceButton({
  accent = false,
  disabled = false,
  icon,
  onPress,
}: FloatingSurfaceButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.surfaceButtonPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.surfaceButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}>
          <HugeiconsIcon
            icon={icon}
            size={22}
            color={accent ? theme.colors.primary : theme.colors.textSecondary}
            strokeWidth={2.1}
          />
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

function TopControlButton({
  disabled = false,
  icon,
  isActive = false,
  onPress,
}: TopControlButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.topControlPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.topControlButton,
            isActive ? styles.topControlButtonActive : null,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}>
          <HugeiconsIcon
            icon={icon}
            size={22}
            color={isActive ? theme.colors.primary : '#FFFFFF'}
            strokeWidth={1.95}
          />
        </View>
      )}
    </Pressable>
  );
}

type TextActionButtonProps = {
  disabled?: boolean;
  icon: typeof Download01Icon;
  label: string;
  onPress: () => void;
};

function TextActionButton({
  disabled = false,
  icon,
  label,
  onPress,
}: TextActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.textActionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.textActionButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}>
          <HugeiconsIcon icon={icon} size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.textActionLabel}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

type SendActionButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

function SendActionButton({ disabled = false, onPress }: SendActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.sendActionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.sendActionButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}>
          <HugeiconsIcon icon={MailSend02Icon} size={30} color="#1D8BFF" strokeWidth={1.8} />
        </View>
      )}
    </Pressable>
  );
}

type ToolbarIconButtonProps = {
  disabled?: boolean;
  icon: typeof Cancel01Icon;
  onPress: () => void;
};

function ToolbarIconButton({
  disabled = false,
  icon,
  onPress,
}: ToolbarIconButtonProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.cropToolbarButtonPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.cropToolbarButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}>
          <HugeiconsIcon icon={icon} size={28} color="#FFFFFF" strokeWidth={1.85} />
        </View>
      )}
    </Pressable>
  );
}

type CropDoneButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

function CropDoneButton({ disabled = false, onPress }: CropDoneButtonProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.cropDonePressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.cropDoneButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}>
          <Text style={styles.cropDoneLabel}>Done</Text>
        </View>
      )}
    </Pressable>
  );
}

type CropOverlayProps = {
  cropRect: CropRect;
  imageFrame: ImageFrame;
  onChangeRect: (rect: CropRect) => void;
};

function CropOverlay({
  cropRect,
  imageFrame,
  onChangeRect,
}: CropOverlayProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);
  const dragRectRef = useRef(cropRect);

  const moveResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      dragRectRef.current = cropRect;
    },
    onPanResponderMove: (_, gestureState) => {
      onChangeRect(moveCropRect(dragRectRef.current, imageFrame, gestureState.dx, gestureState.dy));
    },
  });

  const topLeftResponder = createHandleResponder(
    cropRect,
    dragRectRef,
    imageFrame,
    onChangeRect,
    'topLeft'
  );
  const topRightResponder = createHandleResponder(
    cropRect,
    dragRectRef,
    imageFrame,
    onChangeRect,
    'topRight'
  );
  const bottomLeftResponder = createHandleResponder(
    cropRect,
    dragRectRef,
    imageFrame,
    onChangeRect,
    'bottomLeft'
  );
  const bottomRightResponder = createHandleResponder(
    cropRect,
    dragRectRef,
    imageFrame,
    onChangeRect,
    'bottomRight'
  );

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        pointerEvents="none"
        style={[
          styles.cropShade,
          {
            top: imageFrame.y,
            left: imageFrame.x,
            width: imageFrame.width,
            height: Math.max(cropRect.y - imageFrame.y, 0),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.cropShade,
          {
            top: cropRect.y,
            left: imageFrame.x,
            width: Math.max(cropRect.x - imageFrame.x, 0),
            height: cropRect.height,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.cropShade,
          {
            top: cropRect.y,
            left: cropRect.x + cropRect.width,
            width: Math.max(imageFrame.x + imageFrame.width - (cropRect.x + cropRect.width), 0),
            height: cropRect.height,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.cropShade,
          {
            top: cropRect.y + cropRect.height,
            left: imageFrame.x,
            width: imageFrame.width,
            height: Math.max(imageFrame.y + imageFrame.height - (cropRect.y + cropRect.height), 0),
          },
        ]}
      />

      <View
        style={[
          styles.cropRect,
          {
            left: cropRect.x,
            top: cropRect.y,
            width: cropRect.width,
            height: cropRect.height,
          },
        ]}
        {...moveResponder.panHandlers}>
        <View style={styles.cropRectBorder} />

        <CropHandle position="topLeft" {...topLeftResponder.panHandlers} />
        <CropHandle position="topRight" {...topRightResponder.panHandlers} />
        <CropHandle position="bottomLeft" {...bottomLeftResponder.panHandlers} />
        <CropHandle position="bottomRight" {...bottomRightResponder.panHandlers} />
      </View>
    </View>
  );
}

type CropHandleProps = {
  position: CropHandlePosition;
} & ReturnType<typeof PanResponder.create>['panHandlers'];

function CropHandle({ position, ...panHandlers }: CropHandleProps) {
  const styles = createStyles(useAppTheme(), 0, 0);
  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('Left');

  return (
    <View
      style={[
        styles.cropHandleTouchArea,
        isTop ? styles.cropHandleTop : styles.cropHandleBottom,
        isLeft ? styles.cropHandleLeft : styles.cropHandleRight,
      ]}
      {...panHandlers}>
      <View
        style={[
          styles.cropHandleHorizontal,
          isLeft ? styles.cropHandleHorizontalLeft : styles.cropHandleHorizontalRight,
          isTop ? styles.cropHandleHorizontalTop : styles.cropHandleHorizontalBottom,
        ]}
      />
      <View
        style={[
          styles.cropHandleVertical,
          isLeft ? styles.cropHandleVerticalLeft : styles.cropHandleVerticalRight,
          isTop ? styles.cropHandleVerticalTop : styles.cropHandleVerticalBottom,
        ]}
      />
    </View>
  );
}

function createHandleResponder(
  cropRect: CropRect,
  dragRectRef: MutableRefObject<CropRect>,
  imageFrame: ImageFrame,
  onChangeRect: (rect: CropRect) => void,
  position: CropHandlePosition
) {
  return PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      dragRectRef.current = cropRect;
    },
    onPanResponderMove: (_, gestureState) => {
      onChangeRect(
        resizeCropRect(dragRectRef.current, imageFrame, gestureState.dx, gestureState.dy, position)
      );
    },
  });
}

function getContainedFrame(
  stageLayout: StageLayout,
  previewImage: PreviewImageState
): ImageFrame | null {
  if (
    stageLayout.width <= 0 ||
    stageLayout.height <= 0 ||
    previewImage.width <= 0 ||
    previewImage.height <= 0
  ) {
    return null;
  }

  const scale = Math.min(
    stageLayout.width / previewImage.width,
    stageLayout.height / previewImage.height
  );
  const width = previewImage.width * scale;
  const height = previewImage.height * scale;

  return {
    x: (stageLayout.width - width) / 2,
    y: (stageLayout.height - height) / 2,
    width,
    height,
  };
}

function createDefaultCropRect(imageFrame: ImageFrame): CropRect {
  const horizontalInset = Math.min(18, imageFrame.width * 0.06);
  const verticalInset = Math.min(22, imageFrame.height * 0.06);
  const width = Math.min(Math.max(imageFrame.width - horizontalInset * 2, minCropSize), imageFrame.width);
  const height = Math.min(
    Math.max(imageFrame.height - verticalInset * 2, minCropSize),
    imageFrame.height
  );

  return {
    x: imageFrame.x + (imageFrame.width - width) / 2,
    y: imageFrame.y + (imageFrame.height - height) / 2,
    width,
    height,
  };
}

function moveCropRect(cropRect: CropRect, imageFrame: ImageFrame, dx: number, dy: number): CropRect {
  const nextX = clamp(cropRect.x + dx, imageFrame.x, imageFrame.x + imageFrame.width - cropRect.width);
  const nextY = clamp(cropRect.y + dy, imageFrame.y, imageFrame.y + imageFrame.height - cropRect.height);

  return {
    ...cropRect,
    x: nextX,
    y: nextY,
  };
}

function resizeCropRect(
  cropRect: CropRect,
  imageFrame: ImageFrame,
  dx: number,
  dy: number,
  position: CropHandlePosition
): CropRect {
  const rightEdge = cropRect.x + cropRect.width;
  const bottomEdge = cropRect.y + cropRect.height;
  const minWidth = Math.min(minCropSize, imageFrame.width);
  const minHeight = Math.min(minCropSize, imageFrame.height);

  if (position === 'topLeft') {
    const nextX = clamp(cropRect.x + dx, imageFrame.x, rightEdge - minWidth);
    const nextY = clamp(cropRect.y + dy, imageFrame.y, bottomEdge - minHeight);

    return {
      x: nextX,
      y: nextY,
      width: rightEdge - nextX,
      height: bottomEdge - nextY,
    };
  }

  if (position === 'topRight') {
    const nextRight = clamp(rightEdge + dx, cropRect.x + minWidth, imageFrame.x + imageFrame.width);
    const nextY = clamp(cropRect.y + dy, imageFrame.y, bottomEdge - minHeight);

    return {
      x: cropRect.x,
      y: nextY,
      width: nextRight - cropRect.x,
      height: bottomEdge - nextY,
    };
  }

  if (position === 'bottomLeft') {
    const nextX = clamp(cropRect.x + dx, imageFrame.x, rightEdge - minWidth);
    const nextBottom = clamp(
      bottomEdge + dy,
      cropRect.y + minHeight,
      imageFrame.y + imageFrame.height
    );

    return {
      x: nextX,
      y: cropRect.y,
      width: rightEdge - nextX,
      height: nextBottom - cropRect.y,
    };
  }

  const nextRight = clamp(rightEdge + dx, cropRect.x + minWidth, imageFrame.x + imageFrame.width);
  const nextBottom = clamp(
    bottomEdge + dy,
    cropRect.y + minHeight,
    imageFrame.y + imageFrame.height
  );

  return {
    x: cropRect.x,
    y: cropRect.y,
    width: nextRight - cropRect.x,
    height: nextBottom - cropRect.y,
  };
}

function mapCropRectToImagePixels(
  cropRect: CropRect,
  imageFrame: ImageFrame,
  previewImage: PreviewImageState
) {
  const scaleX = previewImage.width / imageFrame.width;
  const scaleY = previewImage.height / imageFrame.height;
  const originX = Math.max(0, Math.round((cropRect.x - imageFrame.x) * scaleX));
  const originY = Math.max(0, Math.round((cropRect.y - imageFrame.y) * scaleY));
  const width = Math.max(1, Math.round(cropRect.width * scaleX));
  const height = Math.max(1, Math.round(cropRect.height * scaleY));

  return {
    originX,
    originY,
    width: Math.min(width, previewImage.width - originX),
    height: Math.min(height, previewImage.height - originY),
  };
}

function clamp(value: number, minValue: number, maxValue: number) {
  return Math.min(Math.max(value, minValue), maxValue);
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
      backgroundColor: '#050607',
    },
    previewGlowTop: {
      position: 'absolute',
      top: '10%',
      left: '-10%',
      width: 260,
      height: 260,
      borderRadius: radius.xxxl,
      backgroundColor: 'rgba(245, 124, 0, 0.12)',
      transform: [{ rotate: '18deg' }],
    },
    previewGlowBottom: {
      position: 'absolute',
      right: '-18%',
      bottom: '12%',
      width: 300,
      height: 300,
      borderRadius: radius.xxxl,
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      transform: [{ rotate: '-12deg' }],
    },
    content: {
      flex: 1,
      paddingTop: topInset > 0 ? topInset + spacing.sm : spacing.xl,
      paddingRight: spacing.lg,
      paddingBottom: bottomInset > 0 ? bottomInset + spacing.lg : spacing.xl,
      paddingLeft: spacing.lg,
    },
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
    centerStage: {
      flex: 1,
      justifyContent: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
      overflow: 'hidden',
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    cameraStatusOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.md,
    },
    cameraStatusText: {
      ...typography.bodyMedium,
      maxWidth: 360,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    cameraStatusActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
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
      borderColor: 'rgba(255, 255, 255, 0.28)',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    bottomSection: {
      alignItems: 'center',
      gap: spacing.lg,
    },
    previewFooter: {
      gap: spacing.lg,
    },
    previewActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cropFooter: {
      gap: spacing.md,
    },
    cropToolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
    },
    statusMessagePill: {
      alignSelf: 'center',
      maxWidth: 360,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.82)',
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
    captureShell: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    captureOuterRing: {
      width: 92,
      height: 92,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.72)',
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    captureOuterRingBusy: {
      borderColor: 'rgba(255, 255, 255, 0.52)',
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    captureMiddleRing: {
      width: 80,
      height: 80,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: 'rgba(146, 146, 146, 0.72)',
      backgroundColor: 'rgba(255, 255, 255, 0.20)',
    },
    captureMiddleRingBusy: {
      borderColor: 'rgba(120, 120, 120, 0.84)',
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
    },
    captureCore: {
      width: 68,
      height: 68,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: '#FFFFFF',
    },
    captureButtonPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    captureButtonBusy: {
      opacity: 0.94,
      transform: [{ scale: 0.965 }],
    },
    captureCoreBusy: {
      backgroundColor: '#BEBEBE',
    },
    textActionPressable: {
      borderRadius: radius.pill,
    },
    textActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.16)',
    },
    textActionLabel: {
      ...typography.titleMedium,
      color: '#FFFFFF',
    },
    sendActionPressable: {
      borderRadius: radius.pill,
    },
    sendActionButton: {
      width: 74,
      height: 74,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: '#FFFFFF',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.24)',
    },
    cropToolbarButtonPressable: {
      borderRadius: radius.pill,
    },
    cropToolbarButton: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: 'transparent',
    },
    cropDonePressable: {
      borderRadius: radius.pill,
    },
    cropDoneButton: {
      minWidth: 126,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: '#1396FF',
    },
    cropDoneLabel: {
      ...typography.titleMedium,
      color: '#FFFFFF',
    },
    cropShade: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.54)',
    },
    cropRect: {
      position: 'absolute',
      borderRadius: radius.sm,
    },
    cropRectBorder: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      borderRadius: radius.sm,
    },
    cropHandleTouchArea: {
      position: 'absolute',
      width: 34,
      height: 34,
    },
    cropHandleTop: {
      top: -6,
    },
    cropHandleBottom: {
      bottom: -6,
    },
    cropHandleLeft: {
      left: -6,
    },
    cropHandleRight: {
      right: -6,
    },
    cropHandleHorizontal: {
      position: 'absolute',
      width: 18,
      height: 4,
      borderRadius: radius.pill,
      backgroundColor: '#FFFFFF',
    },
    cropHandleHorizontalLeft: {
      left: 0,
    },
    cropHandleHorizontalRight: {
      right: 0,
    },
    cropHandleHorizontalTop: {
      top: 0,
    },
    cropHandleHorizontalBottom: {
      bottom: 0,
    },
    cropHandleVertical: {
      position: 'absolute',
      width: 4,
      height: 18,
      borderRadius: radius.pill,
      backgroundColor: '#FFFFFF',
    },
    cropHandleVerticalLeft: {
      left: 0,
    },
    cropHandleVerticalRight: {
      right: 0,
    },
    cropHandleVerticalTop: {
      top: 0,
    },
    cropHandleVerticalBottom: {
      bottom: 0,
    },
    controlPressed: {
      opacity: 0.88,
    },
    controlDisabled: {
      opacity: 0.5,
    },
  });
}
