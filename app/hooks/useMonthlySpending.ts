import { useState, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getFullUrl, API_CONFIG } from '../config/api';

export const useMonthlySpending = () => {
  const [monthlySpending, setMonthlySpending] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentMonthSpending = async () => {
  try {
    setLoading(true);
    setError(null);

    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    const today = new Date();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const response = await axios.get(getFullUrl(API_CONFIG.endpoints.transactions), {
      params: {
        startDate: startDateStr,
        endDate: endDateStr,
        size: 1000,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const transactions = response.data.content || [];
    console.log('API REQUEST SENT → startDate:', startDateStr);
    console.log('API REQUEST SENT → endDate:', endDateStr);
      const total = transactions.reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

      setMonthlySpending(total);
    } catch (err: any) {
      console.error('Failed to fetch current month spending:', err);
      setError(err.response?.data?.message || 'Failed to load monthly spending');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentMonthSpending();
  }, []);

  return {
    monthlySpending,
    loading,
    error,
    refresh: fetchCurrentMonthSpending,
  };
};