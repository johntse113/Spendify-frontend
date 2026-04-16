import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  TextInput,
  Button,
  Card,
  Portal,
  Dialog,
  ActivityIndicator,
} from 'react-native-paper';
import {
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react-native';
import { API_CONFIG, makeAuthenticatedRequest } from '../../config/api';
import { COLORS, FONTS } from '../../constant';
import { useRouter } from 'expo-router';

const DEFAULT_CATEGORY_NAMES = [
  'Food & Dining',
  'Transport',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Other'
];

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  transactionCount: number;
  system: boolean;
}

type DialogMode = 'add' | 'edit';

export default function ManageCategoryScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await makeAuthenticatedRequest<Category[]>('get', API_CONFIG.endpoints.categories);
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setSelectedCategory(null);
    setName('');
    setIcon('');
    setColor('#4F46E5');
    setDialogVisible(true);
  };

  const openEditDialog = (category: Category) => {
    setDialogMode('edit');
    setSelectedCategory(category);
    setName(category.name);
    setIcon(category.icon);
    setColor(category.color || '#4F46E5');
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setIsSubmitting(false);
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Category name is required.');
      return false;
    }
    if (!icon.trim()) {
      Alert.alert('Validation', 'Category icon is required.');
      return false;
    }
    if (!color.trim()) {
      Alert.alert('Validation', 'Category color is required.');
      return false;
    }
    return true;
  };

  const saveCategory = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      name: name.trim(),
      color: color.trim(),
      icon: icon.trim(),
    };

    setIsSubmitting(true);

    try {
      if (dialogMode === 'edit' && selectedCategory) {
        await makeAuthenticatedRequest<Category>(
          'put',
          `${API_CONFIG.endpoints.categories}/${selectedCategory.id}`,
          payload,
        );
        Alert.alert('Success', 'Category updated successfully.');
      } else {
        await makeAuthenticatedRequest<Category>('post', API_CONFIG.endpoints.categories, payload);
        Alert.alert('Success', 'Category added successfully.');
      }
      await loadCategories();
      closeDialog();
    } catch (error: any) {
      console.error('Error saving category:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save category.');
      setIsSubmitting(false);
    }
  };

  const isProtectedCategory = (categoryName: string) => {
    return DEFAULT_CATEGORY_NAMES.includes(categoryName);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (isProtectedCategory(category.name)) {
      Alert.alert('Cannot Delete', 'This default category cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await makeAuthenticatedRequest('delete', `${API_CONFIG.endpoints.categories}/${category.id}`);
              await loadCategories();
            } catch (error: any) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete category.');
            }
          },
        },
      ],
    );
  };

  const robotoBold = FONTS.primaryBold.family;
  const poppins = FONTS.secondary.family;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <ChevronLeft color={COLORS.text.primary} size={26} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: robotoBold }]}>Manage Categories</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { fontFamily: poppins }]}>Create, edit and remove categories for your transactions.</Text>

        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          categories.map((category, index) => (
            <Card key={category.id} style={styles.categoryCard} mode="outlined">
              <View style={styles.categoryRow}>
                <View style={styles.categoryLabel}>
                  <View style={[styles.categoryIndex, { backgroundColor: COLORS.primary }]}> 
                    <Text style={styles.indexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { fontFamily: robotoBold }]}>{category.name}</Text>
                    <Text style={styles.categoryMeta}>{category.transactionCount} transactions</Text>
                  </View>
                </View>

                <View style={styles.categoryActions}>
                  <TouchableOpacity onPress={() => openEditDialog(category)} style={styles.actionButton}>
                    <Edit2 color={COLORS.primary} size={20} />
                  </TouchableOpacity>
                  {!isProtectedCategory(category.name) && (
                    <TouchableOpacity
                      onPress={() => handleDeleteCategory(category)}
                      style={styles.actionButton}
                    >
                      <Trash2 color={COLORS.error} size={20} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}

        <View style={styles.addButtonWrapper}>
          <Button
            mode="contained"
            icon={() => <Plus color="white" size={16} />}
            onPress={openAddDialog}
            contentStyle={styles.addButtonContent}
            labelStyle={[styles.addButtonLabel, { fontFamily: robotoBold }]}
          >
            Add
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>{dialogMode === 'edit' ? 'Edit Category' : 'Add Category'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              placeholder="e.g. Groceries"
            />
            <TextInput
              label="Icon"
              value={icon}
              onChangeText={setIcon}
              mode="outlined"
              style={styles.input}
              placeholder="Icon name"
            />
            <TextInput
              label="Color"
              value={color}
              onChangeText={setColor}
              mode="outlined"
              style={styles.input}
              placeholder="#4F46E5"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={saveCategory} loading={isSubmitting} disabled={isSubmitting}>
              {dialogMode === 'edit' ? 'Save' : 'Create'}
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
    backgroundColor: 'white',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.text.primary,
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 15,
    color: COLORS.text.secondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  loadingWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  categoryCard: {
    borderRadius: 18,
    marginBottom: 15,
    borderColor: COLORS.border,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndex: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  indexText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  categoryMeta: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 6,
  },
  addButtonWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  addButtonContent: {
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  addButtonLabel: {
    color: 'white',
    fontSize: 15,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
});