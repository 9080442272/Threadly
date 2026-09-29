import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, Vibration, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { XCircle, QrCode, Package, Camera, Cpu } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';

interface GarmentScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function GarmentScanner({ onScan, onClose }: GarmentScannerProps) {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [useSimulated, setUseSimulated] = useState(Platform.OS === 'web');
  const [scanned, setScanned] = useState(false);

  // If running on native platform, request permissions
  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(150);
    onScan(data);
  };

  // Simulate scanning a code
  const triggerSimulatedScan = (code: string) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(100);
    
    // Animate a short delay for visual feedback
    setTimeout(() => {
      onScan(code);
    }, 400);
  };

  if (useSimulated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
          <Text style={[styles.title, { color: theme.text }]}>Garment QR Scanner</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <XCircle size={24} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Simulated Scanner Viewport */}
        <View style={styles.viewportContainer}>
          <View style={[styles.simulatedViewport, { borderColor: theme.primary }]}>
            <View style={[styles.laserLine, { backgroundColor: theme.timer }]} />
            <QrCode size={80} color={theme.textSecondary} />
            <Text style={[styles.simTitle, { color: theme.text }]}>Simulator Scanner Mode</Text>
            <Text style={[styles.simDesc, { color: theme.textSecondary }]}>
              Camera is offline. Tap a B2B ticket below to simulate scanning a barcode.
            </Text>
          </View>
        </View>

        {/* Mock QR Slips */}
        <View style={styles.simButtonsContainer}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Scan Packing / QC Slips</Text>
          
          <Pressable 
            style={[styles.simBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}
            onPress={() => triggerSimulatedScan('ord-seed-1')}
          >
            <Package size={16} color={theme.primary} />
            <View style={styles.simBtnTextWrapper}>
              <Text style={[styles.simBtnTitle, { color: theme.text }]}>Scan Men's T-Shirt QC Slip</Text>
              <Text style={[styles.simBtnSub, { color: theme.textSecondary }]}>ID: ord-seed-1 (Set progress to QC/Completed)</Text>
            </View>
          </Pressable>

          <Pressable 
            style={[styles.simBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}
            onPress={() => triggerSimulatedScan('ord-seed-2')}
          >
            <Package size={16} color={theme.success} />
            <View style={styles.simBtnTextWrapper}>
              <Text style={[styles.simBtnTitle, { color: theme.text }]}>Scan Denim Jacket QC Slip</Text>
              <Text style={[styles.simBtnSub, { color: theme.textSecondary }]}>ID: ord-seed-2</Text>
            </View>
          </Pressable>

          {Platform.OS !== 'web' && (
            <Pressable 
              style={[styles.toggleBtn, { backgroundColor: theme.primary }]}
              onPress={() => setUseSimulated(false)}
            >
              <Text style={styles.toggleBtnText}>Switch to Live Camera</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // Camera permissions handling
  if (!permission) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: theme.background, padding: 24 }]}>
        <Camera size={48} color={theme.timer} />
        <Text style={[styles.permissionTitle, { color: theme.text }]}>Camera Access Required</Text>
        <Text style={[styles.permissionDesc, { color: theme.textSecondary }]}>
          Threads needs camera access to scan barcode tags on garment packs and order invoices.
        </Text>
        <Pressable style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={handleRequestPermission}>
          <Text style={styles.primaryBtnText}>Grant Permission</Text>
        </Pressable>
        <Pressable style={[styles.secondaryBtn, { borderColor: theme.cardBorder }]} onPress={() => setUseSimulated(true)}>
          <Text style={[styles.secondaryBtnText, { color: theme.text }]}>Use Simulator Mode</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <Text style={[styles.title, { color: theme.text }]}>Scan Garment Tag</Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <XCircle size={24} color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Live Camera Viewfinder */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'code128'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        {/* Visual Viewport Overlay */}
        <View style={styles.overlayContainer}>
          <View style={[styles.scanFrame, { borderColor: theme.primary }]}>
            <View style={[styles.laserLine, { backgroundColor: theme.timer }]} />
          </View>
          <Text style={styles.scanInstructions}>Align QR code on garment tag inside frame</Text>
        </View>
      </View>

      {/* Bottom Switcher */}
      <View style={styles.cameraFooter}>
        <Pressable 
          style={[styles.fallbackBtn, { backgroundColor: theme.backgroundElement }]} 
          onPress={() => setUseSimulated(true)}
        >
          <Cpu size={14} color={theme.text} />
          <Text style={[styles.fallbackBtnText, { color: theme.text }]}>Switch to Simulator Mode</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  viewportContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  simulatedViewport: {
    width: 260,
    height: 260,
    borderRadius: 24,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
    gap: 10,
    overflow: 'hidden',
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    zIndex: 2,
  },
  simTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  simDesc: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  simButtonsContainer: {
    padding: 24,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  simBtnTextWrapper: {
    flex: 1,
  },
  simBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  simBtnSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  toggleBtn: {
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  toggleBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  permissionDesc: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  primaryBtn: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryBtn: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  scanInstructions: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cameraFooter: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  fallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  fallbackBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
