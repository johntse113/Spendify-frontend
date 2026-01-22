import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  FileText,
  Bell
} from 'lucide-react-native';
import { COLORS } from '../constant';
import { useAuth } from '../context/AuthContext';

interface MenuItemProps {
  icon: React.ElementType;
  title: string;
  onPress?: () => void;
  color?: string;
  disabled?: boolean;
}

const MenuItem = ({ icon: Icon, title, onPress, color = COLORS.text.primary, disabled = false }: MenuItemProps) => (
  <TouchableOpacity 
    onPress={onPress} 
    activeOpacity={disabled ? 1 : 0.7}
    disabled={disabled}
  >
    <Card 
      style={[
        styles.menuCard, 
        disabled && styles.disabledCard
      ]} 
      mode="outlined"
    >
      <View style={styles.menuItem}>
        <Icon color={disabled ? COLORS.disabled : color} size={24} />
        <Text style={[
          styles.menuText,
          disabled && styles.disabledText
        ]}>
          {title}
        </Text>
      </View>
    </Card>
  </TouchableOpacity>
);

export default function MenuScreen() {
  const { signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Menu</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem 
            icon={User} 
            title="Profile" 
            onPress={() => {}} 
            disabled={loggingOut}
          />
          <MenuItem 
            icon={Bell} 
            title="Notifications" 
            onPress={() => {}} 
            disabled={loggingOut}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <MenuItem 
            icon={Settings} 
            title="App Settings" 
            onPress={() => {}} 
            disabled={loggingOut}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem 
            icon={FileText} 
            title="Terms & Privacy" 
            onPress={() => {}} 
            disabled={loggingOut}
          />
          <MenuItem 
            icon={HelpCircle} 
            title="Help & Support" 
            onPress={() => {}} 
            disabled={loggingOut}
          />
        </View>

        <View style={styles.section}>
          <MenuItem 
            icon={LogOut} 
            title={loggingOut ? "Logging Out..." : "Log Out"} 
            onPress={handleLogout}
            color="#EF4444"
            disabled={loggingOut}
          />
        </View>

        <Text style={styles.version}>Spendify v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 30,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 10,
    marginLeft: 5,
  },
  menuCard: {
    marginBottom: 10,
    borderRadius: 12,
    borderColor: COLORS.border,
    backgroundColor: 'white',
  },
  disabledCard: {
    opacity: 0.6,
    backgroundColor: COLORS.background.secondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginLeft: 15,
    flex: 1,
  },
  disabledText: {
    color: COLORS.disabled || '#999',
  },
  version: {
    textAlign: 'center',
    color: COLORS.text.secondary,
    fontSize: 14,
    marginTop: 20,
    marginBottom: 40,
  },
});