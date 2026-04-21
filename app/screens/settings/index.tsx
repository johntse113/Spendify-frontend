import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Switch, TouchableRipple, Button, Dialog, Portal, RadioButton, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Bell, Palette, DollarSign, Calendar, Shield, Download, Lock, Trash2 } from 'lucide-react-native';

import { COLORS, FONTS, CURRENCIES } from '../../constant';
import { useSettings } from '../../context/SettingsContext';

export default function Settings() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [showDateFormatDialog, setShowDateFormatDialog] = useState(false);
  const [showLogoutTimeoutDialog, setShowLogoutTimeoutDialog] = useState(false);

  const handleCurrencyChange = async (currency: string) => {
    await updateSetting('currency', currency as any);
    setShowCurrencyDialog(false);
  };

  const handleDateFormatChange = async (format: 'DD/MM/YYYY' | 'MM/DD/YYYY') => {
    await updateSetting('dateFormat', format);
    setShowDateFormatDialog(false);
  };

  const handleLogoutTimeoutChange = async (timeout: number) => {
    await updateSetting('autoLogoutTimeout', timeout);
    setShowLogoutTimeoutDialog(false);
  };

  const handleToggleNotifications = async () => {
    await updateSetting('notificationsEnabled', !settings.notificationsEnabled);
  };

  const handleToggleBiometric = async () => {
    await updateSetting('biometricEnabled', !settings.biometricEnabled);
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This feature is not implemented yet.');
  };

  const handleDataExport = () => {
    Alert.alert('Data Export', 'This feature is not implemented yet.');
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deletion', 'This feature is not implemented yet.') }
      ]
    );
  };

  const getCurrencyName = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency ? `${currency.name} (${currency.symbol})` : code;
  };

  const logoutTimeouts = [
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: 'Never', value: 0 },
  ];

  const getLogoutTimeoutLabel = (minutes: number) => {
    if (minutes === 0) return 'Never';
    if (minutes < 60) return `${minutes} minutes`;
    return `${minutes / 60} hour${minutes > 60 ? 's' : ''}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color={COLORS.text.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Bell size={20} color={COLORS.primary} />
              <Text style={[styles.sectionTitle, { fontFamily: FONTS.primaryBold.family }]}>
                Notifications
              </Text>
            </View>
            <TouchableRipple onPress={handleToggleNotifications}>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { fontFamily: FONTS.secondary.family }]}>
                  Push Notifications
                </Text>
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  color={COLORS.primary}
                />
              </View>
            </TouchableRipple>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Palette size={20} color={COLORS.primary} />
              <Text style={[styles.sectionTitle, { fontFamily: FONTS.primaryBold.family }]}>
                Display & Appearance
              </Text>
            </View>

            <TouchableRipple onPress={() => setShowCurrencyDialog(true)}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <DollarSign size={18} color={COLORS.text.secondary} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { fontFamily: FONTS.secondary.family }]}>
                      Currency
                    </Text>
                    <Text style={[styles.settingValue, { fontFamily: FONTS.secondary.family, color: COLORS.text.secondary }]}>
                      {getCurrencyName(settings.currency)}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={COLORS.text.secondary} />
              </View>
            </TouchableRipple>

            <TouchableRipple onPress={() => setShowDateFormatDialog(true)}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Calendar size={18} color={COLORS.text.secondary} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { fontFamily: FONTS.secondary.family }]}>
                      Date Format
                    </Text>
                    <Text style={[styles.settingValue, { fontFamily: FONTS.secondary.family, color: COLORS.text.secondary }]}>
                      {settings.dateFormat}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={COLORS.text.secondary} />
              </View>
            </TouchableRipple>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={COLORS.primary} />
              <Text style={[styles.sectionTitle, { fontFamily: FONTS.primaryBold.family }]}>
                Data & Privacy
              </Text>
            </View>

            <TouchableRipple onPress={() => setShowLogoutTimeoutDialog(true)}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Lock size={18} color={COLORS.text.secondary} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { fontFamily: FONTS.secondary.family }]}>
                      Auto-logout Timeout
                    </Text>
                    <Text style={[styles.settingValue, { fontFamily: FONTS.secondary.family, color: COLORS.text.secondary }]}>
                      {getLogoutTimeoutLabel(settings.autoLogoutTimeout)}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={COLORS.text.secondary} />
              </View>
            </TouchableRipple>

            <TouchableRipple onPress={handleToggleBiometric}>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { fontFamily: FONTS.secondary.family }]}>
                  Biometric Authentication
                </Text>
                <Switch
                  value={settings.biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  color={COLORS.primary}
                />
              </View>
            </TouchableRipple>

            <TouchableRipple onPress={handleDataExport}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Download size={18} color={COLORS.text.secondary} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { fontFamily: FONTS.secondary.family }]}>
                      Export Data
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={COLORS.text.secondary} />
              </View>
            </TouchableRipple>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Lock size={20} color={COLORS.primary} />
              <Text style={[styles.sectionTitle, { fontFamily: FONTS.primaryBold.family }]}>
                Account
              </Text>
            </View>

            <TouchableRipple onPress={handleChangePassword}>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { fontFamily: FONTS.secondary.family }]}>
                  Change Password
                </Text>
                <ChevronRight size={18} color={COLORS.text.secondary} />
              </View>
            </TouchableRipple>

            <TouchableRipple onPress={handleAccountDeletion}>
              <View style={[styles.settingRow, styles.dangerRow]}>
                <View style={styles.settingLeft}>
                  <Trash2 size={18} color={COLORS.error} />
                  <Text style={[styles.settingLabel, { fontFamily: FONTS.secondary.family, color: COLORS.error }]}>
                    Delete Account
                  </Text>
                </View>
                <ChevronRight size={18} color={COLORS.error} />
              </View>
            </TouchableRipple>
          </Card.Content>
        </Card>

        <Portal>
          <Dialog visible={showCurrencyDialog} onDismiss={() => setShowCurrencyDialog(false)}>
            <Dialog.Title>Select Currency</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group onValueChange={handleCurrencyChange} value={settings.currency}>
                {CURRENCIES.map((currency) => (
                  <TouchableRipple key={currency.code} onPress={() => handleCurrencyChange(currency.code)}>
                    <View style={styles.radioRow}>
                      <RadioButton value={currency.code} />
                      <Text style={[styles.radioLabel, { fontFamily: FONTS.secondary.family }]}>
                        {currency.name} ({currency.symbol})
                      </Text>
                    </View>
                  </TouchableRipple>
                ))}
              </RadioButton.Group>
            </Dialog.Content>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog visible={showDateFormatDialog} onDismiss={() => setShowDateFormatDialog(false)}>
            <Dialog.Title>Select Date Format</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group onValueChange={handleDateFormatChange} value={settings.dateFormat}>
                <TouchableRipple onPress={() => handleDateFormatChange('DD/MM/YYYY')}>
                  <View style={styles.radioRow}>
                    <RadioButton value="DD/MM/YYYY" />
                    <Text style={[styles.radioLabel, { fontFamily: FONTS.secondary.family }]}>
                      DD/MM/YYYY (31/12/2023)
                    </Text>
                  </View>
                </TouchableRipple>
                <TouchableRipple onPress={() => handleDateFormatChange('MM/DD/YYYY')}>
                  <View style={styles.radioRow}>
                    <RadioButton value="MM/DD/YYYY" />
                    <Text style={[styles.radioLabel, { fontFamily: FONTS.secondary.family }]}>
                      MM/DD/YYYY (12/31/2023)
                    </Text>
                  </View>
                </TouchableRipple>
              </RadioButton.Group>
            </Dialog.Content>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog visible={showLogoutTimeoutDialog} onDismiss={() => setShowLogoutTimeoutDialog(false)}>
            <Dialog.Title>Auto-logout Timeout</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group onValueChange={handleLogoutTimeoutChange} value={settings.autoLogoutTimeout}>
                {logoutTimeouts.map((timeout) => (
                  <TouchableRipple key={timeout.value} onPress={() => handleLogoutTimeoutChange(timeout.value)}>
                    <View style={styles.radioRow}>
                      <RadioButton value={timeout.value} />
                      <Text style={[styles.radioLabel, { fontFamily: FONTS.secondary.family }]}>
                        {timeout.label}
                      </Text>
                    </View>
                  </TouchableRipple>
                ))}
              </RadioButton.Group>
            </Dialog.Content>
          </Dialog>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    color: COLORS.text.primary,
    fontFamily: FONTS.primaryBold.family,
  },
  headerPlaceholder: {
    width: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
  },
  dangerRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
    paddingTop: 16,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
});