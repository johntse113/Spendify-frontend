import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS } from '../constant';
import { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';

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

interface TransactionFormFieldsProps {
  control: Control<TransactionFormData>;
  errors: FieldErrors<TransactionFormData>;
  categories: Category[];
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  handleDateChange: (event: any, selectedDate?: Date) => void;
}

export default function TransactionFormFields({
  control,
  errors,
  categories,
  showDatePicker,
  setShowDatePicker,
  handleDateChange,
}: TransactionFormFieldsProps) {
  const poppins = FONTS.secondary.family;

  return (
    <View>
      <Text style={[styles.fieldLabel, { fontFamily: FONTS.primaryBold.family }]}>Amount *</Text>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            mode="outlined"
            style={styles.input}
            outlineColor={COLORS.secondary}
            activeOutlineColor={COLORS.primary}
            textColor={COLORS.text.primary}
            theme={{ colors: { onSurfaceVariant: COLORS.text.secondary }, roundness: 10 }}
            keyboardType="decimal-pad"
            left={<TextInput.Affix text="$" />}
            error={!!errors.amount}
            placeholder="0.00"
          />
        )}
      />
      <HelperText type="error" visible={!!errors.amount} style={styles.helperText}>
        {errors.amount?.message}
      </HelperText>
      <Text style={[styles.fieldLabel, { fontFamily: FONTS.primaryBold.family }]}>Date *</Text>
      <Controller
        control={control}
        name="transactionDate"
        render={({ field: { value } }) => (
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            labelStyle={{ color: COLORS.text.primary, fontFamily: poppins }}
            contentStyle={{ paddingVertical: 4 }}
          >
            {value.toLocaleDateString()}
          </Button>
        )}
      />
      {showDatePicker && (
        <DateTimePicker
          value={control._formValues.transactionDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      <HelperText type="error" visible={!!errors.transactionDate} style={styles.helperText}>
        {errors.transactionDate?.message}
      </HelperText>
      <Text style={[styles.fieldLabel, { fontFamily: FONTS.primaryBold.family }]}>Merchant</Text>
      <Controller
        control={control}
        name="merchant"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            mode="outlined"
            style={styles.input}
            outlineColor={COLORS.secondary}
            activeOutlineColor={COLORS.primary}
            textColor={COLORS.text.primary}
            theme={{ colors: { onSurfaceVariant: COLORS.text.secondary }, roundness: 10 }}
            placeholder="Where did you spend?"
          />
        )}
      />
      <Text style={[styles.fieldLabel, { fontFamily: FONTS.primaryBold.family, marginTop: 16 }]}>
        Category *
      </Text>
      <Controller
        control={control}
        name="categoryId"
        render={({ field: { onChange, value } }) => (
          <RadioButton.Group onValueChange={onChange} value={value}>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <View key={cat.id} style={styles.radioItem}>
                  <RadioButton value={cat.id.toString()} color={COLORS.primary} />
                  <Text style={{ color: COLORS.text.primary, fontFamily: poppins }}>
                    {cat.name}
                  </Text>
                </View>
              ))}
            </View>
          </RadioButton.Group>
        )}
      />
      <HelperText type="error" visible={!!errors.categoryId} style={styles.helperText}>
        {errors.categoryId?.message}
      </HelperText>
      <Text style={[styles.fieldLabel, { fontFamily: FONTS.primaryBold.family }]}>Description</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            mode="outlined"
            style={[styles.input, styles.textArea]}
            outlineColor={COLORS.secondary}
            activeOutlineColor={COLORS.primary}
            textColor={COLORS.text.primary}
            theme={{ colors: { onSurfaceVariant: COLORS.text.secondary }, roundness: 10 }}
            multiline
            numberOfLines={3}
            placeholder="Optional notes..."
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
    fontSize: 14,
    height: 45,
  },
  textArea: {
    minHeight: 90,
  },
  dateButton: {
    borderRadius: 10,
    borderColor: COLORS.secondary,
    marginBottom: 4,
    justifyContent: 'flex-start',
    height: 45,
  },
  helperText: {
    color: '#ff6b6b',
    marginBottom: 12,
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 8,
  },
});