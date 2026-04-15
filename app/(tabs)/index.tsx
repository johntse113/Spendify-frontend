import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
import {
  Wallet,
  Pencil,
  UploadCloud,
  Bell,
  LayoutGrid,
  LucideIcon,
} from 'lucide-react-native';
import { COLORS, FONTS } from '../constant';
import { router, useFocusEffect } from 'expo-router';
import AppIcon from '../../assets/images/icon.png';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { useMonthlySpending } from '../hooks/useMonthlySpending';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUDGET_STORAGE_KEY } from '../constant';

const { width } = Dimensions.get('window');

interface ActionCardProps {
  title: string;
  icon: LucideIcon;
  color: string;
  onPress?: () => void;
}

const ActionCard = ({ title, icon: Icon, color, onPress }: ActionCardProps) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.gridCardTouchable}>
    <Card style={styles.gridCard} mode="outlined">
      <View style={styles.cardInternalLayout}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Icon color={color} size={28} />
      </View>
    </Card>
  </TouchableOpacity>
);

export default function Home() {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [animatedProgress, setAnimatedProgress] = React.useState(0);
  const [monthlyBudget, setMonthlyBudget] = React.useState(2000);

  const { token } = useAuth();
  const { userEmail } = useUser();
  const { monthlySpending, loading: spendingLoading } = useMonthlySpending();

  useFocusEffect(
    React.useCallback(() => {
      loadBudgetFromStorage();
    }, [])
  );

  const loadBudgetFromStorage = async () => {
    try {
      const savedBudget = await AsyncStorage.getItem(BUDGET_STORAGE_KEY);
      if (savedBudget) {
        const budgetNum = parseInt(savedBudget, 10);
        if (!isNaN(budgetNum)) {
          setMonthlyBudget(budgetNum);
        }
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    }
  };


  const progress = monthlyBudget > 0 ? monthlySpending / monthlyBudget : 0;
  const displayProgress = Math.min(progress, 1);

  
  useEffect(() => {
    const listenerId = progressAnim.addListener(({ value }) => {
      setAnimatedProgress(value);
    });

    Animated.timing(progressAnim, {
      toValue: displayProgress,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    return () => {
      progressAnim.removeListener(listenerId);
    };
  }, [monthlySpending, monthlyBudget]);

  useFocusEffect(
    React.useCallback(() => {
      progressAnim.setValue(0);
      
      Animated.timing(progressAnim, {
        toValue: displayProgress,
        duration: 1500,
        useNativeDriver: true,
      }).start();
      
      return () => {
        // Cleanup
      };
    }, [displayProgress])
  );

  const handleNotificationPress = () => {
    router.push('/screens/notifications');
  };

  const handleInputNewRecord = () => {
    router.push('/screens/records/input-record');
  };

  const handleUploadReceipt = () => {
    router.push('/screens/records/upload-receipt');
  };

  const handleSetBudgetAlarm = () => {
    router.push('/screens/budget/budget-alarm');
  };

  const handleManageCategory = () => {
    router.push('/screens/categories/manage-category');
  };

  const isOverBudget = progress > 1;

  return (
    <View style={styles.container}>
      <View style={styles.waveContainer}>
        <Svg height={110} width={width} viewBox={`0 0 ${width} 110`} style={styles.wave}>
          <Path
            fill={COLORS.header}
            d={`
              M ${width},0
              L 0,0
              L 0,90
              Q ${width * 0.25},120 ${width * 0.5},90
              Q ${width * 0.75},60 ${width},90
              Z
            `}
          />
        </Svg>

        <SafeAreaView style={styles.headerContent}>
          <View style={styles.headerIcons}>
            <Image source={AppIcon} style={styles.appIcon} resizeMode="contain" />
            <View>
              <TouchableOpacity
                onPress={handleNotificationPress}
                activeOpacity={0.7}
                style={styles.notificationContainer}
              >
                <IconButton icon="bell" iconColor="white" size={28} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.greeting}>Hi, {userEmail || 'User'}</Text>

        <Card style={styles.progressCard} mode="outlined">
          <View style={styles.progressContainer}>
            <View style={styles.chartContainer}>
              <Progress.Circle
                size={width * 0.35}
                progress={animatedProgress}
                unfilledColor="#F0F2F5"
                color={isOverBudget ? '#EF4444' : '#3B82F6'}
                thickness={12}
                borderWidth={0}
                strokeCap="round"
                showsText={false}
              />
              <View style={styles.chartTextOverlay}>
                  <Text style={[styles.spendingAmount, isOverBudget && { color: '#EF4444' }]}>
                    {spendingLoading
                      ? '...'
                      : `$${Math.round(monthlySpending)} / $${monthlyBudget}`}
                  </Text>
                <Text style={styles.spendingLabel}>Monthly Spending</Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.statusText,
                  { color: isOverBudget ? '#EF4444' : COLORS.green },
                ]}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {isOverBudget ? 'You are overspending!' : 'You are not overspending'}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.grid}>
          <ActionCard
            title="Input New Record"
            icon={Pencil}
            color="#4CAF50"
            onPress={handleInputNewRecord}
          />
          <ActionCard
            title="Upload Receipt Photo"
            icon={UploadCloud}
            color="#3B82F6"
            onPress={handleUploadReceipt}
          />
          <ActionCard
            title="Set Budget Alarm"
            icon={Bell}
            color="#EF4444"
            onPress={handleSetBudgetAlarm}
          />
          <ActionCard
            title="Manage Category"
            icon={LayoutGrid}
            color="#F59E0B"
            onPress={handleManageCategory}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  headerBackground: {
    backgroundColor: COLORS.header,
    height: 150,
    borderBottomLeftRadius: width * 0.4,
    borderBottomRightRadius: width * 0.4,
    width: width * 1.2,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'relative',
    height: 120,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerIcons: {
    width: width,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: 0,
  },
  appIcon: {
    width: 40, 
    height: 40, 
    borderRadius: 8,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#FF5252',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: { 
    color: 'white', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  scrollContent: { 
    paddingLeft: 20,
    paddingRight: 20, 
    paddingTop: 10,
    paddingBottom: 150,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  progressCard: {
    borderRadius: 20,
    backgroundColor: 'white',
    borderColor: COLORS.border,
    marginBottom: 25,
    overflow: 'hidden',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: width * 0.4,
  },
  statusContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
    paddingLeft: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.green,
    flexShrink: 1,
    textAlign: 'left',
    includeFontPadding: false,
    lineHeight: 24, 
  },
  chartTextOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spendingAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  spendingLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontFamily: FONTS.secondary.family,
    marginTop: 4,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  gridCardTouchable: {
    width: '48%',
    marginBottom: 15,
  },
  gridCard: {
    width: '100%',
    height: 100,
    borderRadius: 15,
    backgroundColor: 'white',
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  cardInternalLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.primary,
    marginRight: 5,
  },
});