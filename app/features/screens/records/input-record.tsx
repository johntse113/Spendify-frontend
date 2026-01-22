import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  TextInput,
  Button,
  HelperText,
  RadioButton,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { COLORS, FONTS } from '../../../constant';
import { API_CONFIG, getFullUrl } from '../../../config/api';
import { useRouter } from 'expo-router';
import TransactionFormFields from '../../../components/TransactionForm';

const { width } = Dimensions.get('window');

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

export default function InputRecordScreen() {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<TransactionFormData | null>(null);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: yupResolver(transactionSchema),
    defaultValues: {
      amount: '',
      transactionDate: new Date(),
      description: '',
      categoryId: '',
      merchant: '',
    },
  });
  const poppins = FONTS.secondary.family;
  const robotoBold = FONTS.primaryBold.family;
  React.useEffect(() => {
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
      Alert.alert('Error', 'Failed to load categories');
    }
  };
  const onSubmit: SubmitHandler<TransactionFormData> = (data) => {
    setFormDataToSubmit(data);
    setShowConfirmDialog(true);
  };
  const handleCancel = () => {
    reset();
    router.back();
  };
  const confirmTransaction = async () => {
    if (!formDataToSubmit) return;
    setLoading(true);
    setShowConfirmDialog(false);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const transactionData = {
        amount: parseFloat(formDataToSubmit.amount),
        transactionDate: formDataToSubmit.transactionDate.toISOString().split('T')[0],
        description: formDataToSubmit.description || undefined,
        categoryId: parseInt(formDataToSubmit.categoryId),
        merchant: formDataToSubmit.merchant || undefined,
      };
      await axios.post(getFullUrl(API_CONFIG.endpoints.transactions), transactionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Transaction added successfully!', [
        { text: 'OK', onPress: () => reset() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add transaction');
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { fontFamily: robotoBold }]}>New Transaction</Text>
        <TransactionFormFields
          control={control}
          errors={errors}
          categories={categories}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          handleDateChange={handleDateChange}
        />
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={[styles.actionButton, styles.cancelButton]}
            labelStyle={{ color: COLORS.primary, fontFamily: robotoBold }}
            contentStyle={styles.buttonContent}
            disabled={loading}
          >
            CANCEL
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            style={[styles.actionButton, styles.confirmButton]}
            labelStyle={{ color: COLORS.text.light, fontFamily: robotoBold }}
            contentStyle={styles.buttonContent}
          >
            CONFIRM
          </Button>
        </View>
      </ScrollView>
      <Portal>
        <Dialog visible={showConfirmDialog} onDismiss={() => setShowConfirmDialog(false)}>
          <Dialog.Title>Confirm Transaction</Dialog.Title>
          <Dialog.Content>
            {formDataToSubmit && (
              <View>
                <Text>Amount: ${parseFloat(formDataToSubmit.amount).toFixed(2)}</Text>
                <Text>Date: {formDataToSubmit.transactionDate.toLocaleDateString()}</Text>
                <Text>Merchant: {formDataToSubmit.merchant || '—'}</Text>
                <Text>
                  Category:{' '}
                  {categories.find((c) => c.id.toString() === formDataToSubmit.categoryId)?.name ||
                    '—'}
                </Text>
                {formDataToSubmit.description && (
                  <Text>Description: {formDataToSubmit.description}</Text>
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onPress={confirmTransaction} textColor={COLORS.primary}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: COLORS.text.primary,
    marginBottom: 16,
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  buttonContent: {
    paddingVertical: 6,
  },
});