import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import { API_CONFIG, makeAuthenticatedRequest } from '../../config/api';
import { COLORS, FONTS } from '../../constant';

export default function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const userData = await makeAuthenticatedRequest<{ id: number; email: string }>(
          'get',
          API_CONFIG.endpoints.auth.me,
        );
        setEmail(userData.email);
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError('Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Email</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.cardValue}>{email ?? 'Not available'}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontFamily: FONTS.secondary.family,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    color: COLORS.text.primary,
    fontFamily: FONTS.primaryBold.family,
  },
  loader: {
    marginTop: 8,
  },
  errorText: {
    color: COLORS.text.error,
    fontSize: 14,
    fontFamily: FONTS.secondary.family,
    marginTop: 8,
  },
});