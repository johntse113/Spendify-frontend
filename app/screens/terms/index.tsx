import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../../constant';
import { TERMS_AND_CONDITIONS } from '../../constant/text';

export default function TermsAndConditionsScreen() {
  const router = useRouter();

  const formatTermsText = (text: string) => {
    const sections = text.split('\n\n');

    return sections.map((section, index) => {
      const lines = section.split('\n');
      const firstLine = lines[0];

      if (/^\d+\./.test(firstLine)) {
        return (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{firstLine}</Text>
            {lines.slice(1).map((line, lineIndex) => (
              <Text key={lineIndex} style={styles.sectionText}>
                {line}
              </Text>
            ))}
          </View>
        );
      }

      if (firstLine.includes('Last updated:')) {
        return (
          <Text key={index} style={styles.lastUpdated}>
            {firstLine}
          </Text>
        );
      }

      return (
        <Text key={index} style={styles.paragraph}>
          {section}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={COLORS.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.subtitle}>Please read these terms carefully before using our service.</Text>

        <View style={styles.termsContainer}>
          {formatTermsText(TERMS_AND_CONDITIONS)}
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
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  termsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lastUpdated: {
    fontSize: 14,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.primaryBold.family,
    color: COLORS.text.primary,
    marginBottom: 12,
    lineHeight: 24,
  },
  sectionText: {
    fontSize: 15,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: FONTS.secondary.family,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
});