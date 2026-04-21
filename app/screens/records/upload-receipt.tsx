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
  Modal,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { COLORS } from '../../constant';
import TransactionFormFields from '../../components/TransactionForm';
import { API_CONFIG, getFullUrl } from '../../config/api';
import { File } from 'expo-file-system';


interface OCRResponse {
  merchant: string;
  date: string;
  amount: number;
  items: null;
  confidence: number;
  warnings: string[];
  requiresManualReview: boolean;
}

interface TransactionFormData {
  amount: string;
  transactionDate: Date;
  description: string;
  categoryId: string;
  merchant: string;
}

interface Category {
  id: number;
  name: string;
}

const transactionSchema = yup.object({
  amount: yup
    .string()
    .required('Amount is required')
    .test('is-non-zero', 'Amount must be non-zero', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num !== 0;
    }),
  transactionDate: yup.date().required('Date is required').max(new Date(), 'Date cannot be in the future'),
  description: yup.string().default(''),
  categoryId: yup.string().required('Category is required'),
  merchant: yup.string().default(''),
});

export default function UploadReceiptScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: yupResolver(transactionSchema),
    defaultValues: {
      amount: '',
      transactionDate: new Date(),
      description: '',
      categoryId: '',
      merchant: '',
    },
  });

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
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const response = await axios.get(getFullUrl(API_CONFIG.endpoints.categories), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  };

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
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
      router.back();
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

  const handleConfirm = async () => {
    if (!imageUri) return;
    
    setLoading(true);
    try {
      const file = new File(imageUri);
      const base64 = await file.base64();
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const formData = new FormData();
      const imageFilename = imageUri.split('/').pop() || 'receipt.jpg';
      const extension = imageFilename.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        heic: 'image/heic',
        webp: 'image/webp',
      };
      const imageType = mimeTypes[extension ?? ''] ?? 'image/jpeg';
      
      //formData.append("file", base64.toString()); ;
      console.log('imageUri', imageUri);
      console.log('imageFilename', imageFilename);
      console.log('imageType', imageType);
      console.log(`Making request to ${getFullUrl(API_CONFIG.endpoints.ocr)} with data:`, formData, 'and headers:', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      });
      formData.append("file", {
        uri: imageUri,
        name: imageFilename,
        type: imageType,
      } as any);
      console.log('OCR api:', API_CONFIG.endpoints.ocr);
      console.log('OCR token:', token);
      const response = await axios.post<OCRResponse>(
        getFullUrl(API_CONFIG.endpoints.ocr),
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const ocrData = response.data;
      
      setValue('merchant', ocrData.merchant || '');
      setValue('amount', ocrData.amount ? ocrData.amount.toString() : '');
      if (ocrData.date) {
        setValue('transactionDate', new Date(ocrData.date));
      }
      
      setShowFormModal(true);
      
      if (ocrData.warnings && ocrData.warnings.length > 0) {
        Alert.alert('Warning', ocrData.warnings.join('\n'));
      }
      
    } catch (error: any) {
      console.error('OCR processing error:', error);
      console.error('OCR processing error:', error.response);
      console.error('OCR processing error:', error.response?.data);
      console.error('OCR processing error:', error.response?.data?.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to process receipt. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleFormSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const transactionData = {
        amount: parseFloat(data.amount),
        transactionDate: data.transactionDate.toISOString().split('T')[0],
        description: data.description || undefined,
        categoryId: parseInt(data.categoryId),
        merchant: data.merchant || undefined,
      };

      await axios.post(
        getFullUrl(API_CONFIG.endpoints.transactions),
        transactionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        'Success',
        'Transaction added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowFormModal(false);
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue('transactionDate', selectedDate, { shouldValidate: true });
    }
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
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chooseAnotherButton}
                onPress={handleChooseAnother}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.chooseAnotherText}>Choose Another Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.85}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Processing...' : 'Confirm'}
                </Text>
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

      <Modal
        visible={showFormModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFormModal(false)}
      >
        <ScrollView style={styles.modalContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>Add Transaction</Text>
          
          <TransactionFormFields
            control={control}
            errors={errors}
            categories={categories}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            handleDateChange={handleDateChange}
          />
          
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowFormModal(false)}
              disabled={loading}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit(handleFormSubmit)}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : 'Save Transaction'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 40,
    gap: 16,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});