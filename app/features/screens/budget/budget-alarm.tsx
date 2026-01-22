import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { ArrowLeft, Save } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../constant';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  BUDGET_STORAGE_KEY, 
  MIN_BUDGET, 
  MAX_BUDGET, 
  BUDGET_STEP 
} from '../../../constant';

const { width } = Dimensions.get('window');

export default function SetBudgetScreen() {
  const [budget, setBudget] = useState('2000');
  const [sliderValue, setSliderValue] = useState(2000);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSavedBudget();
  }, []);

  const loadSavedBudget = async () => {
    try {
      const savedBudget = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
      if (savedBudget) {
        const budgetNum = parseInt(savedBudget, 10);
        if (!isNaN(budgetNum)) {
          setBudget(budgetNum.toString());
          setSliderValue(budgetNum);
        }
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    }
  };

  const handleTextInputChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText === '') {
      setBudget('');
      setSliderValue(MIN_BUDGET);
      setError('');
      return;
    }

    const numValue = parseInt(numericText, 10);
    
    if (isNaN(numValue)) {
      setBudget('');
      setSliderValue(MIN_BUDGET);
      setError('');
      return;
    }
    if (numValue < MIN_BUDGET) {
      setError(`Minimum budget is $${MIN_BUDGET}`);
      setBudget(numericText);
      setSliderValue(Math.max(numValue, MIN_BUDGET));
    } else if (numValue > MAX_BUDGET) {
      setError(`Maximum budget is $${MAX_BUDGET}`);
      setBudget(numericText);
      setSliderValue(Math.min(numValue, MAX_BUDGET));
    } else {
      setError('');
      setBudget(numericText);
      setSliderValue(numValue);
    }
  };

  const handleSliderChange = (value: number) => {
    const roundedValue = Math.round(value / BUDGET_STEP) * BUDGET_STEP;
    setSliderValue(roundedValue);
    setBudget(roundedValue.toString());
    setError('');
  };

  const handleSaveBudget = async () => {
    const budgetNum = parseInt(budget, 10);
    
    if (isNaN(budgetNum) || budgetNum < MIN_BUDGET || budgetNum > MAX_BUDGET) {
      setError(`Please enter a valid budget between $${MIN_BUDGET} and $${MAX_BUDGET}`);
      return;
    }

    setIsSaving(true);
    try {
      await AsyncStorage.setItem(BUDGET_STORAGE_KEY, budgetNum.toString());
      setIsSaving(false);
      router.back();
    } catch (error) {
      console.error('Error saving budget:', error);
      setError('Failed to save budget. Please try again.');
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US')}`;
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft color="white" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Set Monthly Budget</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.description}>
          Set your monthly spending limit. You'll receive notifications when approaching or exceeding this amount.
        </Text>

        <Card style={styles.budgetCard} mode="outlined">
          <Card.Content style={styles.cardContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monthly Budget</Text>
              
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  value={budget}
                  onChangeText={handleTextInputChange}
                  keyboardType="numeric"
                  style={styles.amountInput}
                  contentStyle={styles.amountInputContent}
                  mode="outlined"
                  outlineColor={error ? '#EF4444' : COLORS.border}
                  activeOutlineColor={error ? '#EF4444' : COLORS.primary}
                  maxLength={7}
                  disabled={isSaving}
                />
              </View>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <Text style={styles.rangeText}>
                  Range: {formatCurrency(MIN_BUDGET)} - {formatCurrency(MAX_BUDGET)}
                </Text>
              )}

              <View style={styles.sliderContainer}>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>{formatCurrency(MIN_BUDGET)}</Text>
                  <Text style={styles.sliderLabel}>{formatCurrency(MAX_BUDGET)}</Text>
                </View>
                
                <Slider
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  minimumValue={MIN_BUDGET}
                  maximumValue={MAX_BUDGET}
                  step={BUDGET_STEP}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor={COLORS.primary}
                  style={styles.slider}
                  disabled={isSaving}
                />

                <View style={styles.currentValueContainer}>
                  <Text style={styles.currentValueLabel}>Current:</Text>
                  <Text style={styles.currentValue}>
                    {formatCurrency(sliderValue)}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Budget Tips</Text>
          <Text style={styles.infoText}>
            • Review your past 3 months spending to set a realistic budget{'\n'}
            • Consider upcoming expenses like bills and subscriptions{'\n'}
            • Leave some room for unexpected costs{'\n'}
            • You can adjust this anytime based on your needs
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSaveBudget}
            loading={isSaving}
            disabled={isSaving || !!error}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            icon={({ size, color }) => <Save size={size} color={color} />}
          >
            {isSaving ? 'Saving...' : 'Save Budget'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: COLORS.header,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.primaryBold.family,
    color: 'white',
    fontWeight: 'bold',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: 25,
    textAlign: 'center',
  },
  budgetCard: {
    borderRadius: 20,
    backgroundColor: 'white',
    borderColor: COLORS.border,
    marginBottom: 25,
    overflow: 'hidden',
  },
  cardContent: {
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  inputContainer: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 18,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  currencySymbol: {
    fontSize: 36,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    marginRight: 10,
    marginTop: 4,
  },
  amountInput: {
    width: 180,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  amountInputContent: {
    fontSize: 36,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    textAlign: 'center',
    height: 60,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: FONTS.secondary.family,
    textAlign: 'center',
    marginBottom: 10,
  },
  rangeText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontFamily: FONTS.secondary.family,
    textAlign: 'center',
    marginBottom: 30,
  },
  sliderContainer: {
    width: '100%',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  sliderLabel: {
    fontSize: 12,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  currentValueContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  currentValueLabel: {
    fontSize: 16,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
    marginRight: 8,
  },
  currentValue: {
    fontSize: 20,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 10,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButtonContent: {
    paddingVertical: 10,
  },
});