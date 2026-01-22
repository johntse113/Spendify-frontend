import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { COLORS } from './constant';
import { AuthProvider } from './context/AuthContext';
import AuthWrapper from './components/AuthWrapper';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Medium': require('../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'RobotoMono-Bold': require('../assets/fonts/Roboto_Mono/static/RobotoMono-Bold.ttf'),
    'RobotoMono-Regular': require('../assets/fonts/Roboto_Mono/static/RobotoMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (fontError) {
    console.error('Font loading error:', fontError);
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <PaperProvider theme={MD3LightTheme}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}