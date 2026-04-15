import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Text, Card, ActivityIndicator, Button, Portal, Modal, Dialog } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { format, subDays, parseISO, isAfter, isBefore } from 'date-fns';
import { COLORS, FONTS } from '../constant';
import { API_CONFIG, getFullUrl } from '../config/api';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import TransactionFormFields from '../components/TransactionForm';

const { width } = Dimensions.get('window');
const poppins = FONTS?.secondary?.family || 'System';
const robotoBold = FONTS?.primaryBold?.family || 'System';

interface Transaction {
  id: number;
  amount: number;
  transactionDate: string;
  categoryId: number;
  categoryName: string;
  merchant: string;
  description?: string;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
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

export default function History() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set([-1]));
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [animation] = useState(new Animated.Value(0));
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editCategories, setEditCategories] = useState<Category[]>([]);
  const [showEditConfirmDialog, setShowEditConfirmDialog] = useState(false);
  const [editFormDataToSubmit, setEditFormDataToSubmit] = useState<(TransactionFormData & { id: number }) | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { control: editControl, handleSubmit: editHandleSubmit, formState: { errors: editErrors }, reset: editReset, setValue: setEditValue } = useForm<TransactionFormData>({
    resolver: yupResolver(transactionSchema),
    defaultValues: {
      amount: '',
      transactionDate: new Date(),
      description: '',
      categoryId: '',
      merchant: '',
    },
  });

  const availableCategories = useMemo(() => {
    const catMap = new Map<number, string>();
    transactions.forEach((t) => {
      if (!catMap.has(t.categoryId)) {
        catMap.set(t.categoryId, t.categoryName);
      }
    });
    return Array.from(catMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [transactions]);

  const getMaxStartDate = () => {
    return subDays(dateRange.endDate, 90);
  };

  const validateDateRange = (start: Date, end: Date): boolean => {
    const diffInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 90;
  };

  useEffect(() => {
    loadTransactionHistory();
    loadCategories();
  }, [dateRange]);

  useEffect(() => {
    if (selectedCategories.has(-1)) {
      setFilteredTransactions([...transactions]);
      return;
    }
    const filtered = transactions.filter((t) => selectedCategories.has(t.categoryId));
    setFilteredTransactions(filtered);
  }, [transactions, selectedCategories]);

  useEffect(() => {
    if (editingTransaction) {
      editReset({
        amount: editingTransaction.amount.toString(),
        transactionDate: parseISO(editingTransaction.transactionDate),
        description: editingTransaction.description || '',
        categoryId: editingTransaction.categoryId.toString(),
        merchant: editingTransaction.merchant || '',
      });
    }
  }, [editingTransaction, editReset]);

  const loadCategories = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const response = await axios.get(getFullUrl(API_CONFIG.endpoints.categories), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditCategories(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  const loadTransactionHistory = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        console.error('No access token found');
        Alert.alert('Error', 'Authentication token not found');
        return;
      }
      const startDateStr = format(dateRange.startDate, 'yyyy-MM-dd');
      const endDateStr = format(dateRange.endDate, 'yyyy-MM-dd');
      const response = await axios.get(getFullUrl(API_CONFIG.endpoints.transactions), {
        params: {
          startDate: startDateStr,
          endDate: endDateStr,
          size: 1000,
          sort: 'transactionDate,desc',
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const allTransactions: Transaction[] = response.data.content || [];
      const sortedTransactions = [...allTransactions].sort((a, b) => {
        return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
      });
      setTransactions(sortedTransactions);
      setSelectedCategories(new Set([-1]));
    } catch (error: any) {
      console.error('Error loading transaction history:', error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactionHistory();
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const maxDate = dateRange.endDate;
      const newDate = isAfter(selectedDate, maxDate) ? maxDate : selectedDate;
      if (!validateDateRange(newDate, dateRange.endDate)) {
        Alert.alert('Error', 'Date range cannot exceed 90 days');
        return;
      }
      setDateRange((prev) => ({ ...prev, startDate: newDate }));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const minDate = dateRange.startDate;
      const newDate = isBefore(selectedDate, minDate) ? minDate : selectedDate;
      if (!validateDateRange(dateRange.startDate, newDate)) {
        Alert.alert('Error', 'Date range cannot exceed 90 days');
        return;
      }
      setDateRange((prev) => ({ ...prev, endDate: newDate }));
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (categoryId === -1) {
        newSet.clear();
        newSet.add(-1);
      } else {
        if (newSet.has(-1)) newSet.delete(-1);
        if (newSet.has(categoryId)) {
          newSet.delete(categoryId);
          if (newSet.size === 0) newSet.add(-1);
        } else {
          newSet.add(categoryId);
        }
      }
      return newSet;
    });
  };

  const toggleCardExpansion = (transactionId: number) => {
    if (expandedCardId === transactionId) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setExpandedCardId(null));
    } else {
      setExpandedCardId(transactionId);
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yy');
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.merchant}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => performDelete(transaction.id),
        },
      ]
    );
  };

  const performDelete = async (transactionId: number) => {
    setDeleteLoading(true);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      await axios.delete(`${getFullUrl(API_CONFIG.endpoints.transactions)}/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
      setFilteredTransactions((prev) => prev.filter((t) => t.id !== transactionId));

      Alert.alert('Success', 'Transaction deleted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryColor = (categoryId: number): string => {
    const colors = [
      '#4A6FA5', '#6B8E23', '#FF6B6B', '#FFD166', '#06D6A0',
      '#118AB2', '#EF476F', '#9D4EDD', '#FB5607', '#8338EC',
      '#3A86FF', '#FF006E', '#FFBE0B', '#FB5607', '#8338EC',
    ];
    return colors[categoryId % colors.length];
  };

  const onEditSubmit = (data: TransactionFormData) => {
    setEditFormDataToSubmit({ ...data, id: editingTransaction!.id });
    setShowEditConfirmDialog(true);
  };

  const confirmEditTransaction = async () => {
    if (!editFormDataToSubmit) return;
    setEditLoading(true);
    setShowEditConfirmDialog(false);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const transactionData = {
        amount: parseFloat(editFormDataToSubmit.amount),
        transactionDate: format(editFormDataToSubmit.transactionDate, 'yyyy-MM-dd'),
        description: editFormDataToSubmit.description || undefined,
        categoryId: parseInt(editFormDataToSubmit.categoryId),
        merchant: editFormDataToSubmit.merchant || undefined,
      };
      const response = await axios.put(
        `${getFullUrl(API_CONFIG.endpoints.transactions)}/${editFormDataToSubmit.id}`,
        transactionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedTransaction: Transaction = response.data;
      setTransactions((prev) =>
        prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
      );
      setEditingTransaction(null);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update transaction');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditDateChange = (event: any, selectedDate?: Date) => {
    setShowEditDatePicker(false);
    if (selectedDate) {
      setEditValue('transactionDate', selectedDate, { shouldValidate: true });
    }
  };

  const renderTransactionCard = (transaction: Transaction) => {
    const isExpanded = expandedCardId === transaction.id;
    return (
      <TouchableOpacity
        key={transaction.id}
        activeOpacity={0.9}
        onPress={() => toggleCardExpansion(transaction.id)}
        style={styles.cardContainer}
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardTopRow}>
              <Text
                style={[
                  styles.amountText,
                  transaction.amount < 0 ? styles.negativeAmount : styles.positiveAmount,
                ]}
              >
                {formatCurrency(transaction.amount)}
              </Text>
              <Text style={styles.dateText}>{formatDate(transaction.transactionDate)}</Text>
            </View>
            <View style={styles.cardBottomRow}>
              <Text style={styles.descriptionText} numberOfLines={1}>
                {transaction.description || transaction.merchant}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(transaction.categoryId) },
                ]}
              >
                <Text style={styles.categoryBadgeText}>{transaction.categoryName}</Text>
              </View>
            </View>
            {isExpanded && (
              <Animated.View
                style={[
                  styles.expandedSection,
                  {
                    height: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 80],
                    }),
                    opacity: animation,
                  },
                ]}
              >
                <View style={styles.expandedButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(transaction)}
                    activeOpacity={0.7}
                    disabled={deleteLoading}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(transaction)}
                    activeOpacity={0.7}
                    disabled={deleteLoading}
                  >
                    <Text style={styles.actionButtonText}>
                      {deleteLoading ? 'Deleting...' : 'Delete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderCategoryTag = (cat: { id: number; name: string }) => {
    const isSelected = selectedCategories.has(cat.id);
    const color = getCategoryColor(cat.id);
    return (
      <TouchableOpacity
        key={cat.id}
        style={[
          styles.categoryTag,
          isSelected
            ? { backgroundColor: color, borderColor: color }
            : { backgroundColor: 'transparent', borderColor: COLORS.primary },
        ]}
        onPress={() => toggleCategory(cat.id)}
      >
        <Text
          style={[
            styles.categoryTagText,
            isSelected ? { color: COLORS.text.light } : { color: COLORS.text.primary },
          ]}
        >
          {cat.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.filterCard}>
        <Card.Content>
          <View style={styles.dateRangeInfo}>
            <Text style={styles.dateRangeSubtext}>Maximum range: 90 days</Text>
          </View>
          <View style={styles.dateFilterContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={[styles.dateLabel, { fontFamily: robotoBold }]}>From</Text>
              <Button
                mode="outlined"
                onPress={() => setShowStartDatePicker(true)}
                style={styles.dateButton}
                labelStyle={styles.dateButtonLabel}
                contentStyle={styles.dateButtonContent}
              >
                {format(dateRange.startDate, 'dd/MM/yyyy')}
              </Button>
              {showStartDatePicker && (
                <DateTimePicker
                  value={dateRange.startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartDateChange}
                  maximumDate={dateRange.endDate}
                  minimumDate={getMaxStartDate()}
                  {...Platform.select({
                    android: {
                      textColor: COLORS.text.light,
                      accentColor: COLORS.text.light,
                    },
                  })}
                  style={styles.datePickerAndroidContainer}
                />
              )}
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={[styles.dateLabel, { fontFamily: robotoBold }]}>To</Text>
              <Button
                mode="outlined"
                onPress={() => setShowEndDatePicker(true)}
                style={styles.dateButton}
                labelStyle={styles.dateButtonLabel}
                contentStyle={styles.dateButtonContent}
              >
                {format(dateRange.endDate, 'dd/MM/yyyy')}
              </Button>
              {showEndDatePicker && (
                <DateTimePicker
                  value={dateRange.endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                  maximumDate={new Date()}
                  minimumDate={dateRange.startDate}
                  {...Platform.select({
                    android: {
                      textColor: COLORS.text.light,
                      accentColor: COLORS.text.light,
                    },
                  })}
                  style={styles.datePickerAndroidContainer}
                />
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.categoryFilterToggle}
            onPress={() => setShowCategoryFilter(!showCategoryFilter)}
          >
            <Text style={styles.categoryFilterToggleText}>
              Category Filter {showCategoryFilter ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {showCategoryFilter && (
            <View style={styles.categoryTagsContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryTag,
                  selectedCategories.has(-1)
                    ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                    : { backgroundColor: 'transparent', borderColor: COLORS.primary },
                ]}
                onPress={() => toggleCategory(-1)}
              >
                <Text
                  style={[
                    styles.categoryTagText,
                    selectedCategories.has(-1)
                      ? { color: COLORS.text.light }
                      : { color: COLORS.text.primary },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {availableCategories.map(renderCategoryTag)}
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.sectionSeparator} />
      <Text style={styles.transactionCount}>
        {filteredTransactions.length} transactions found
      </Text>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Transactions Found</Text>
            <Text style={styles.emptyStateText}>
              No transactions match the selected filters.
            </Text>
            <Button
              mode="contained"
              onPress={handleRefresh}
              style={styles.refreshButton}
              buttonColor={COLORS.primary}
              labelStyle={{ fontFamily: robotoBold }}
            >
              Refresh
            </Button>
          </View>
        ) : (
          filteredTransactions.map(renderTransactionCard)
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={!!editingTransaction}
          onDismiss={() => setEditingTransaction(null)}
          contentContainerStyle={styles.editModalContent}
          dismissable={!editLoading}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={[styles.title, { fontFamily: robotoBold }]}>Edit Transaction</Text>
            <TransactionFormFields
              control={editControl}
              errors={editErrors}
              categories={editCategories}
              showDatePicker={showEditDatePicker}
              setShowDatePicker={setShowEditDatePicker}
              handleDateChange={handleEditDateChange}
            />
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setEditingTransaction(null)}
                style={[styles.cancelButton]}
                labelStyle={{ color: COLORS.primary, fontFamily: robotoBold }}
                contentStyle={styles.buttonContent}
                disabled={editLoading}
              >
                CANCEL
              </Button>
              <Button
                mode="contained"
                onPress={editHandleSubmit(onEditSubmit)}
                loading={editLoading}
                disabled={editLoading}
                style={[styles.confirmButton]}
                labelStyle={{ color: COLORS.text.light, fontFamily: robotoBold }}
                contentStyle={styles.buttonContent}
              >
                CONFIRM
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <Portal>
        <Dialog visible={showEditConfirmDialog} onDismiss={() => setShowEditConfirmDialog(false)}>
          <Dialog.Title>Confirm Edit</Dialog.Title>
          <Dialog.Content>
            {editFormDataToSubmit && (
              <View>
                <Text>Amount: ${parseFloat(editFormDataToSubmit.amount).toFixed(2)}</Text>
                <Text>Date: {editFormDataToSubmit.transactionDate.toLocaleDateString()}</Text>
                <Text>Merchant: {editFormDataToSubmit.merchant || '—'}</Text>
                <Text>
                  Category:{' '}
                  {editCategories.find((c) => c.id.toString() === editFormDataToSubmit.categoryId)?.name || '—'}
                </Text>
                {editFormDataToSubmit.description && (
                  <Text>Description: {editFormDataToSubmit.description}</Text>
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditConfirmDialog(false)}>Cancel</Button>
            <Button onPress={confirmEditTransaction} textColor={COLORS.primary}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterCard: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 0,
    borderWidth: 1,
    borderColor: COLORS.secondary + '40',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 8,
    marginLeft: 4,
  },
  dateButtonContent: {
    paddingVertical: 4,
    justifyContent: 'center',
  },
  dateRangeInfo: {
    marginTop: 0,
  },
  dateRangeSubtext: {
    fontSize: 12,
    fontFamily: poppins,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingBottom: 8,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 24,
    marginVertical: 12,
  },
  transactionCount: {
    fontSize: 14,
    fontFamily: poppins,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.primaryBold.family,
  },
  positiveAmount: {
    color: COLORS.text.info,
  },
  negativeAmount: {
    color: COLORS.text.info,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
    fontFamily: FONTS.secondary.family,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 12,
    fontFamily: FONTS.secondary.family,
  },
  expandedSection: {
    overflow: 'hidden',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  expandedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: poppins,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: poppins,
    color: COLORS.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  refreshButton: {
    borderRadius: 10,
  },
  dateButton: {
    borderRadius: 10,
    borderColor: COLORS.secondary,
    height: 48,
    backgroundColor: COLORS.primary,
  },
  dateButtonLabel: {
    color: COLORS.text.light,
    fontFamily: poppins,
  },
  datePickerAndroidContainer: {
    ...Platform.select({
      android: {
        backgroundColor: COLORS.primary,
      },
    }),
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.light,
    fontFamily: poppins,
  },
  categoryFilterToggle: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 12,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 10,
    alignItems: 'center',
  },
  categoryFilterToggleText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: poppins,
    color: COLORS.primary,
  },
  categoryTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: poppins,
  },
  title: {
    paddingTop: 16,
    fontSize: 28,
    color: COLORS.text.primary,
    marginBottom: 16,
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
    borderRadius: 16,
  },
  cancelButton: {
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
    flex: 1,
    borderRadius: 16,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  editModalContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
});