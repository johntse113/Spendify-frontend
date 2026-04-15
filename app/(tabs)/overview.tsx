import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Text, Card, Title, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  LinearGradient,
  vec,
  Text as SkiaText,
  useFont,
} from '@shopify/react-native-skia';
import { CartesianChart } from 'victory-native';
import { PolarChart, Pie } from 'victory-native';
import { Bar } from 'victory-native';
import { useChartPressState } from 'victory-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { format, subMonths } from 'date-fns';
import { API_CONFIG, getFullUrl } from '../config/api';
import { COLORS, FONTS } from '../constant';
import { useMonthlySpending } from '../hooks/useMonthlySpending';

const ROBOTO_MONO_BOLD = require('../../assets/fonts/Roboto_Mono/static/RobotoMono-Bold.ttf');
const ROBOTO_MONO_REGULAR = require('../../assets/fonts/Roboto_Mono/static/RobotoMono-Regular.ttf');

const { width } = Dimensions.get('window');

interface Transaction {
  id: number;
  amount: number;
  transactionDate: string;
  categoryId: number;
  categoryName: string;
  merchant: string;
}

interface CategorySummary {
  categoryId: number;
  categoryName: string;
  total: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  total: number;
  monthNumber: number;
  year: number;
  [key: string]: unknown;
}

export default function Overview() {
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySummary[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [dateRange, setDateRange] = useState<string>('');

  const { monthlySpending, loading: monthlyLoading } = useMonthlySpending();

  const fontForChart = useFont(ROBOTO_MONO_REGULAR, 9);
  const fontForPie = useFont(ROBOTO_MONO_BOLD, 14);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      const startDateObj = subMonths(today, 12);
      const startDate = startDateObj.toISOString().split('T')[0];

      setDateRange(`${format(startDateObj, 'MMM yyyy')} - ${format(today, 'MMM yyyy')}`);

      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await axios.get(getFullUrl(API_CONFIG.endpoints.transactions), {
        params: {
          startDate,
          endDate,
          size: 1000,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const allTransactions: Transaction[] = response.data.content || [];
      setTransactions(allTransactions);
      calculateMonthlyData(allTransactions);
      calculateCategoryData(allTransactions);
    } catch (error: any) {
      console.error('Error loading overview data:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to load overview data',
      );
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([loadOverviewData()]).finally(() => setRefreshing(false));
  };

  const calculateMonthlyData = (transactions: Transaction[]) => {
    const today = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const last12Months: { month: number; year: number; label: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(today, i);
      const month = date.getMonth();
      const year = date.getFullYear();
      const label = `${monthNames[month]} ${year.toString().slice(-2)}`;
      last12Months.push({ month, year, label });
    }

    const monthlyMap: { [key: string]: number } = {};
    last12Months.forEach((m) => {
      monthlyMap[`${m.year}-${m.month}`] = 0;
    });

    transactions.forEach((t) => {
      const date = new Date(t.transactionDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (monthlyMap.hasOwnProperty(key)) {
        monthlyMap[key] += t.amount;
      }
    });

    const monthlyDataArray: MonthlyData[] = last12Months.map((m) => ({
      month: m.label,
      total: monthlyMap[`${m.year}-${m.month}`] || 0,
      monthNumber: m.month,
      year: m.year,
    }));

    setMonthlyData(monthlyDataArray);

    const periodTotal = monthlyDataArray.reduce((sum, m) => sum + m.total, 0);
    setTotalSpending(periodTotal);
  };

  const calculateCategoryData = (transactions: Transaction[]) => {
    const categoryMap: { [key: string]: { total: number; name: string } } = {};

    transactions.forEach((t) => {
      if (!categoryMap[t.categoryId]) {
        categoryMap[t.categoryId] = { total: 0, name: t.categoryName };
      }
      categoryMap[t.categoryId].total += t.amount;
    });

    const grandTotal = Object.values(categoryMap).reduce((sum, c) => sum + c.total, 0);

    const categoryArray: CategorySummary[] = Object.entries(categoryMap)
      .map(([id, data]) => ({
        categoryId: parseInt(id),
        categoryName: data.name,
        total: data.total,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    setCategoryData(categoryArray);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const robotoBold = FONTS.primaryBold.family;
  const poppins = FONTS.secondary.family;

  const isDataLoaded = monthlyData.length > 0 || categoryData.length > 0;

  if (!isDataLoaded && monthlyLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { fontFamily: poppins, color: COLORS.text.secondary }]}>
          Loading Overview...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.subtitle, { fontFamily: poppins, color: COLORS.text.secondary }]}>
        Last 12 Months: {dateRange}
      </Text>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { fontFamily: robotoBold, color: COLORS.primary }]}>
            {transactions.length}
          </Text>
          <Text style={[styles.statLabel, { fontFamily: poppins, color: COLORS.text.secondary }]}>
            Total Transactions
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { fontFamily: robotoBold, color: COLORS.primary }]}>
            {categoryData.length}
          </Text>
          <Text style={[styles.statLabel, { fontFamily: poppins, color: COLORS.text.secondary }]}>
            Categories Used
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { fontFamily: robotoBold, color: COLORS.primary }]}>
            {transactions.length > 0 ? formatCurrency(totalSpending / transactions.length) : formatCurrency(0)}
          </Text>
          <Text style={[styles.statLabel, { fontFamily: poppins, color: COLORS.text.secondary }]}>
            Avg. per Transaction
          </Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.cardTitle, { fontFamily: robotoBold, color: COLORS.text.primary }]}>
            Current Month Spending
          </Title>

          {monthlyLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ margin: 20 }} />
          ) : (
            <>
              <Text style={[styles.monthlyAmount, { fontFamily: robotoBold, color: COLORS.primary }]}>
                {formatCurrency(monthlySpending)}
              </Text>
              <Text style={[styles.monthLabel, { fontFamily: poppins, color: COLORS.text.secondary }]}>
                {format(new Date(), 'MMMM yyyy')}
              </Text>
            </>
          )}

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { backgroundColor: COLORS.primary }]} />
            </View>
            <Text style={[styles.progressText, { fontFamily: poppins, color: COLORS.text.secondary }]}>
              {totalSpending > 0
                ? `${((monthlySpending / (totalSpending / 12)) * 100).toFixed(1)}% of monthly average`
                : 'No data for comparison'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.cardTitle, { fontFamily: robotoBold, color: COLORS.text.primary }]}>
            Monthly Spending Trend
          </Title>
          <Text style={[styles.totalYearText, { fontFamily: poppins, color: COLORS.text.secondary }]}>
            Total: {formatCurrency(totalSpending)} (12 months)
          </Text>

          {monthlyData.length > 0 ? (
            <MonthlyTrendChart monthlyData={monthlyData} formatCurrency={formatCurrency} font={fontForChart} />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { fontFamily: poppins }]}>No transaction data for this period</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={[styles.cardTitle, { fontFamily: robotoBold, color: COLORS.text.primary }]}>
            Spending by Category
          </Title>
          {categoryData.length > 0 ? (
            <View style={styles.pieChartContainer}>
              {fontForPie ? (
                <View style={styles.pieChartWrapper}>
                  <View style={{ width: 250, height: 250 }}>
                    <PolarChart
                      data={categoryData.map(item => ({
                        value: item.total,
                        color: getCategoryColor(item.categoryId),
                        label: item.categoryName
                      }))}
                      valueKey="value"
                      labelKey="label"
                      colorKey="color"
                    >
                      <Pie.Chart innerRadius={width * 0.20} />
                    </PolarChart>
                  </View>
                  <View style={styles.pieCenter}>
                    <Text style={[styles.pieCenterText, { fontFamily: robotoBold, color: COLORS.primary }]}>
                      {categoryData.length}
                    </Text>
                    <Text style={[styles.pieCenterSubtext, { fontFamily: poppins, color: COLORS.text.secondary }]}>
                      Categories
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ height: 250, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={{ marginTop: 12, color: COLORS.text.secondary, fontFamily: poppins }}>
                    Loading chart...
                  </Text>
                </View>
              )}

              <View style={styles.legendContainer}>
                {categoryData.slice(0, 5).map((category) => (
                  <View key={category.categoryId} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: getCategoryColor(category.categoryId) }]} />
                    <View style={styles.legendTextContainer}>
                      <Text style={[styles.legendName, { fontFamily: poppins, color: COLORS.text.primary }]}>
                        {category.categoryName}
                      </Text>
                      <Text style={[styles.legendPercentage, { fontFamily: poppins, color: COLORS.text.secondary }]}>
                        {category.percentage.toFixed(1)}%
                      </Text>
                    </View>
                    <Text style={[styles.legendAmount, { fontFamily: robotoBold, color: COLORS.text.primary }]}>
                      {formatCurrency(category.total)}
                    </Text>
                  </View>
                ))}
                {categoryData.length > 5 && (
                  <Text style={[styles.moreCategoriesText, { fontFamily: poppins, color: COLORS.text.secondary }]}>
                    + {categoryData.length - 5} more categories
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { fontFamily: poppins }]}>No category data available</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

interface MonthlyTrendChartProps {
  monthlyData: MonthlyData[];
  formatCurrency: (amount: number) => string;
  font?: any;
}

function MonthlyTrendChart({ monthlyData, formatCurrency, font }: MonthlyTrendChartProps) {
  if (!font) {
    return (
      <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 12 }}>Loading chart font...</Text>
      </View>
    );
  }

  type YKey = 'total';

  const { state: pressState, isActive } = useChartPressState<{
    x: string;
    y: Record<YKey, number>;
  }>({
    x: monthlyData[0]?.month ?? '',
    y: { total: 0 },
  });

  const tooltipStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: ((pressState as any).x?.position?.value ?? (pressState as any).x?.value ?? 0) - 60,
    top: ((pressState as any).y?.total?.position?.value ?? (pressState as any).y?.total?.value ?? 0) - 60,
    opacity: isActive ? 1 : 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    borderRadius: 4,
    minWidth: 120,
  }));

  const maxY = Math.max(...monthlyData.map(m => m.total), 1);

  const getPressX = (): string => {
    const px: any = (pressState as any).x;
    if (px == null) return '';
    if (typeof px === 'object' && 'value' in px) return String(px.value);
    return String(px);
  };

  const getPressYTotal = (): number => {
    const py: any = (pressState as any).y?.total;
    if (py == null) return 0;
    if (typeof py === 'object' && 'value' in py) return Number(py.value);
    return Number(py);
  };

  return (
    <View style={styles.chartContainer}>
      <CartesianChart<MonthlyData, 'month', YKey>
        data={monthlyData}
        xKey="month"
        yKeys={['total']}
        padding={{ left: 20, right: 10, top: 10, bottom: 20 }}
        domain={{ y: [0, maxY * 1.2] }}
        domainPadding={{ left: 20, right: 20 }}
        axisOptions={{
          font,
          labelColor: '#333',
          lineColor: '#e0e0e0',
        }}
        chartPressState={pressState}
      >
        {({ points, chartBounds }) => {
          const totalPoints = points.total ?? [];
          return (
            <>
              <Bar
                points={totalPoints}
                chartBounds={chartBounds}
                roundedCorners={{ topLeft: 4, topRight: 4 }}
              >
                <LinearGradient
                  start={vec(0, chartBounds.top)}
                  end={vec(0, chartBounds.bottom)}
                  colors={['#4A6FA5', '#4A6FA550']}
                />
              </Bar>
              {totalPoints.map((pt, i) => {
                const y = pt.y ?? null;
                if (y == null || monthlyData[i].total <= 0) return null;
                return (
                  <SkiaText
                    key={`label-${i}`}
                    x={pt.x - 20}
                    y={y - 8}
                    text={formatCurrency(monthlyData[i].total)}
                    color="#333"
                    font={font}
                  />
                );
              })}
            </>
          );
        }}
      </CartesianChart>
      <Animated.View style={tooltipStyle} pointerEvents="none">
        <Text style={styles.tooltipText}>
          {getPressX()}: {formatCurrency(getPressYTotal())}
        </Text>
      </Animated.View>
    </View>
  );
}

const getCategoryColor = (categoryId: number): string => {
  const colors = [
    '#4A6FA5', '#6B8E23', '#FF6B6B', '#FFD166', '#06D6A0',
    '#118AB2', '#EF476F', '#9D4EDD', '#FB5607', '#8338EC',
    '#3A86FF', '#FF006E', '#FFBE0B', '#FB5607', '#8338EC'
  ];
  return colors[categoryId % colors.length];
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  debugText: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: 'white',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  monthlyAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  monthLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A6FA5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  totalYearText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  chartContainer: {
    height: 220,
    marginTop: 8,
    position: 'relative',
  },
  pieChartContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  pieChartWrapper: {
    position: 'relative',
    height: 250,
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  pieCenterSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  legendContainer: {
    width: '100%',
    marginTop: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    color: '#333',
  },
  legendPercentage: {
    fontSize: 12,
    color: '#666',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  moreCategoriesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  noDataContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});