import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft, Phone, Mail, Globe, MapPin, Clock, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { COLORS, FONTS } from '../../constant';

export default function HelpSupportScreen() {
  const router = useRouter();

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone Support',
      value: '12345678',
      type: 'phone',
      color: '#4CAF50',
    },
    {
      icon: Mail,
      title: 'Email Us',
      value: 'support@gmail.com',
      type: 'email',
      color: '#2196F3',
    },
    {
      icon: Globe,
      title: 'Website',
      value: 'https://wp2025.cs.hku.hk/fyp25073/',
      type: 'url',
      color: '#9C27B0',
    },
    {
      icon: MapPin,
      title: 'Office Address',
      value: 'The University of Hong Kong, \nPokfulam Road, \nHong Kong',
      type: 'address',
      color: '#FF9800',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 2:00 PM\nSunday: Closed',
      type: 'text',
      color: '#607D8B',
    },
    {
      icon: MessageCircle,
      title: 'Frequently Asked Questions',
      value: 'View FAQs',
      type: 'faq',
      color: '#E91E63',
    },
  ];

  const handlePress = (type: string, value: string) => {
    switch (type) {
      case 'phone':
        Linking.openURL(`tel:${value.replace(/[^0-9]/g, '')}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'url':
        Linking.openURL(`${value}`);
        break;
      case 'faq':
        Linking.openURL(`https://portal.hku.hk/tpg-admissions/applying/faq`);
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={COLORS.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How can we help you?</Text>
        <Text style={styles.subtitle}>
          We're here to assist you. Choose your preferred way to reach us.
        </Text>

        <View style={styles.contactContainer}>
          {contactInfo.map((item, index) => {
            const IconComponent = item.icon;
            const isPressable = item.type !== 'address' && item.type !== 'text';
            
            const ContactContent = () => (
              <View style={styles.contactCard}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                  <IconComponent size={24} color={item.color} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>{item.title}</Text>
                  <Text style={styles.contactValue}>{item.value}</Text>
                </View>
              </View>
            );

            if (isPressable) {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePress(item.type, item.value)}
                  activeOpacity={0.7}
                >
                  <ContactContent />
                </TouchableOpacity>
              );
            }

            return <ContactContent key={index} />;
          })}
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
    fontSize: 20,
    color: COLORS.text.primary,
    fontFamily: FONTS.primaryBold.family,
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  contactContainer: {
    marginBottom: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  faqCard: {
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  faqTitle: {
    fontSize: 18,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  faqText: {
    fontSize: 14,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  faqButton: {
    alignSelf: 'flex-start',
  },
  faqButtonText: {
    fontSize: 14,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.primary,
  },
  responseTimeCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  responseTimeTitle: {
    fontSize: 16,
    fontFamily: FONTS.primaryBold.family,
    color: '#E65100',
    marginBottom: 8,
  },
  responseTimeText: {
    fontSize: 14,
    fontFamily: FONTS.secondary.family,
    color: '#E65100',
    lineHeight: 20,
    opacity: 0.9,
  },
});