import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './constants';
import * as Screens from './screens';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={MD3LightTheme}>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          \
          <Stack.Screen 
            name="screens/records/input-record" 
            options={{ 
              headerShown: true,
              title: 'Input New Record',
              headerBackTitle: 'Back'
            }} 
          />
          <Stack.Screen 
            name="screens/records/upload-receipt" 
            options={{ 
              headerShown: true,
              title: 'Upload Receipt',
              headerBackTitle: 'Back'
            }} 
          />
          
          <Stack.Screen 
            name="screens/budget/budget-alarm" 
            options={{ 
              headerShown: true,
              title: 'Budget Alarm',
              headerBackTitle: 'Back'
            }} 
          />
          
          <Stack.Screen 
            name="screens/categories/manage-category" 
            options={{ 
              headerShown: true,
              title: 'Manage Category',
              headerBackTitle: 'Back'
            }} 
          />
          
          <Stack.Screen 
            name="screens/notifications/notifications" 
            options={{ 
              headerShown: true,
              title: 'Notifications',
              headerBackTitle: 'Back'
            }} 
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}