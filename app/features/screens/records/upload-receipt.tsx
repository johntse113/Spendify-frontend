import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../constant';

export default function UploadReceiptScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload receipts.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  useEffect(() => {
    if (!imageUri) {
      pickImage();
    }
  }, []);

  const handleChooseAnother = () => {
    setImageUri(null);
    setTimeout(pickImage, 300);
  };

  const handleConfirm = () => {
    if (!imageUri) return;
    Alert.alert('Receipt Confirmed', 'Photo will be processed (placeholder)', [
      { text: 'OK', onPress: () => {} },
    ]);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.container}>
        <Text style={styles.title}>
          {imageUri ? 'Receipt Preview' : 'Upload Receipt'}
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
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chooseAnotherButton}
                onPress={handleChooseAnother}
                activeOpacity={0.8}
              >
                <Text style={styles.chooseAnotherText}>Choose Another Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.hintText}>Opening gallery...</Text>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingBottom: 80,
  },
  imageWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '70%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border || '#E0E0E0',
    backgroundColor: '#F9F9F9',
  },

  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
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
  chooseAnotherButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
    minWidth: 280,
    alignItems: 'center',
  },
  chooseAnotherText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 16,
    color: COLORS.text?.secondary || '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});