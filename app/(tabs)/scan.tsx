import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constant';

export default function Scan() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const isFocused = useIsFocused();
  const hasRequestedOnce = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!isFocused) return;

    (async () => {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Camera Permission Required', 'Please allow camera access.', [
            { text: 'OK' },
          ]);
          return;
        }

        if (!imageUri && !hasRequestedOnce.current) {
          hasRequestedOnce.current = true;
          takePhoto();
        }
      } catch (e) {
        console.error('Permission/camera error:', e);
      }
    })();
  }, [isFocused, imageUri]);

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.82,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
      } else {
        hasRequestedOnce.current = false;
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleRetake = () => {
    setImageUri(null);
    hasRequestedOnce.current = false;
    setTimeout(takePhoto, 400);
  };

  const handleConfirm = () => {
    Alert.alert('Confirm', 'Photo confirmed! (dummy action)');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      <Text style={styles.title}>
        {imageUri ? 'Photo Captured' : 'Scan Item'}
      </Text>

      {imageUri ? (
        <View style={styles.previewContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUri }}
              style={styles.preview}
              resizeMode="contain"
            />
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Take Another Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.hintText}>Opening camera...</Text>

          <TouchableOpacity
            style={styles.cancelEmptyButton}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelEmptyText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  imageWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '65%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background.secondary,
  },

  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginBottom: 60,
  },

  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#666',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
    minWidth: 280,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },

  cancelEmptyButton: {
    marginTop: 40,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 20,
    minWidth: 240,
    alignItems: 'center',
  },
  cancelEmptyText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  retakeButton: {
    backgroundColor: COLORS.background.secondary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  buttonText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '600',
  },

  confirmButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});