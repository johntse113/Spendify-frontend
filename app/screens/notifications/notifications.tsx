import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from 'react-native-paper';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../../constant';

const placeholderNotifications = [
  {
    id: 1,
    title: 'New app version is released!',
    date: '01/01/2025',
    body:
      'Sample text xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx',
  },
  {
    id: 2,
    title: 'Notification 2',
    date: '01/01/2025',
    body: 'This is a placeholder for the second notification detail. Expand to read more.',
  },
  {
    id: 3,
    title: 'Notification 1',
    date: '01/01/2025',
    body: 'This is a placeholder for the third notification detail. Expand to read more.',
  },
];

export default function NotificationsScreen() {
  const [expandedIds, setExpandedIds] = useState<number[]>([1]);
  const router = useRouter();

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={COLORS.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {placeholderNotifications.map((notification) => {
          const isExpanded = expandedIds.includes(notification.id);
          return (
            <Card key={notification.id} style={styles.card} mode="outlined">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleExpand(notification.id)}
                style={styles.cardHeader}
              >
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{notification.title}</Text>
                  <Text style={styles.cardDate}>{notification.date}</Text>
                </View>
                <View style={styles.iconWrapper}>
                  {isExpanded ? (
                    <ChevronUp color={COLORS.text.primary} size={20} />
                  ) : (
                    <ChevronDown color={COLORS.text.primary} size={20} />
                  )}
                </View>
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.cardBody}>
                  <Text style={styles.cardBodyText}>{notification.body}</Text>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    marginBottom: 16,
    borderColor: COLORS.border,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardHeader: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontFamily: FONTS.secondaryBold.family,
    flex: 1,
    marginRight: 12,
  },
  cardDate: {
    fontSize: 13,
    color: COLORS.text.secondary,
    fontFamily: FONTS.secondary.family,
  },
  iconWrapper: {
    position: 'absolute',
    right: 18,
    top: 18,
  },
  cardBody: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  cardBodyText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text.secondary,
    fontFamily: FONTS.secondary.family,
  },
});