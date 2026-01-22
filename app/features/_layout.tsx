import { Tabs, Stack, usePathname, router } from 'expo-router';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { Home, PieChart, Scan, Clock, Menu } from 'lucide-react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constant';



const TAB_ROUTES = [
  { name: 'index',    title: 'Home',    icon: Home     },
  { name: 'overview', title: 'Overview', icon: PieChart  },
  { name: 'scan',     title: 'Scan',    icon: Scan, isMiddle: true },
  { name: 'history',  title: 'History', icon: Clock    },
  { name: 'menu',     title: 'Menu',    icon: Menu     },
];

export default function Layout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={MD3LightTheme}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: 'none' },
              animation: 'fade', //
            }}
          >
            {TAB_ROUTES.map((tab) => (
              <Tabs.Screen
                key={tab.name}
                name={tab.name}
                options={{ title: tab.title,  }}
              />
            ))}
          </Tabs>

          <CustomTabBar />
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function CustomTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isTabActive = (tabName: string) => {
    if (tabName === 'index') return pathname === '/' || pathname === '/index';
    return pathname === `/${tabName}`;
  };

  const handleTabPress = (tabName: string) => {
    router.push(tabName === 'index' ? '/' : `/${tabName}`);
  };

  const TAB_BAR_HEIGHT = 78;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          height: TAB_BAR_HEIGHT + insets.bottom,
        },
      ]}
    >
      <View style={styles.tabBarContainer}>
        <View style={styles.selectedBackgroundPlate} />

        <View style={styles.contentRow}>
          {TAB_ROUTES.map((tab, index) => {
            if (index === 2) {
              return (
                <View
                  key="spacer"
                  style={[
                    styles.spacerTabItem,
                    { width: `${100 / 5}%` },
                  ]}
                />
              );
            }

            const adjustedIndex = index > 2 ? index - 1 : index;
            const routeIndex = index > 2 ? index : index;
            const route = TAB_ROUTES[routeIndex];
            
            const active = isTabActive(route.name);
            const isFirst = adjustedIndex === 0;
            const isLast = adjustedIndex === 3;

            const borderRadii = active
              ? isFirst
                ? { borderTopRightRadius: 32, borderBottomRightRadius: 32 }
                : isLast
                ? { borderTopLeftRadius: 32, borderBottomLeftRadius: 32 }
                : { borderRadius: 32 }
              : {};

            return (
              <TouchableOpacity
                key={route.name}
                style={[
                  styles.tabTouchable,
                  { width: `${100 / 5}%` },
                ]}
                onPress={() => handleTabPress(route.name)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.tabContent,
                  active && styles.activeTabItem,
                  borderRadii,
                ]}>
                  <route.icon
                    color={active ? COLORS.background.primary : COLORS.primary}
                    size={24}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      active && styles.activeTabLabel,
                    ]}
                  >
                    {route.title}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      
      <View
        style={[
          styles.floatingButtonContainer,
          {
            bottom: insets.bottom + 38,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.scanButtonContainer}
          onPress={() => handleTabPress('scan')}
          activeOpacity={0.85}
        >
          <View style={styles.scanButton}>
            <Scan color={COLORS.text.light} size={34} strokeWidth={2.1} />
          </View>
          <Text style={styles.scanButtonLabel}>Scan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.primary,
  },

  tabBarContainer: {
    height: 78,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    overflow: 'hidden',
  },

  selectedBackgroundPlate: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background.primary,
    top: -30,
  },

  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 0,
  },

  tabTouchable: {
    height: 78, 
  },

  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  spacerTabItem: {
    height: 78,
    pointerEvents: 'none',
  },

  activeTabItem: {
    backgroundColor: COLORS.primary,
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
  },

  activeTabLabel: {
    color: COLORS.background.primary,
    fontWeight: '700',
  },

  floatingButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },

  scanButtonContainer: {
    alignItems: 'center',
  },

  scanButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  scanButtonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
    position: 'absolute',
    bottom: -20,
  },
});