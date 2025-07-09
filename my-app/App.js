import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OpeningAnimation from './src/screens/opening_animation';
import MainScreen from './src/screens/MainScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Playfair Display': PlayfairDisplay_700Bold,
        'Poppins_600SemiBold': Poppins_600SemiBold,
      });
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    }
    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Loading fonts...</Text>
    </View>
    );
  }


  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="OpeningAnimation"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="OpeningAnimation" component={OpeningAnimation} />
          <Stack.Screen name="MainScreen" component={MainScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
