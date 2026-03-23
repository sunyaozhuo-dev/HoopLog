import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogsProvider } from "../contexts/LogsContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { PlansProvider } from "../contexts/PlansContext";
import { TemplatesProvider } from "../contexts/TemplatesContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!fontsLoaded) return;

    const check = async () => {
      try {
        const done = await AsyncStorage.getItem("onboarding_done");
        if (!done) {
          // Skip onboarding for existing users who already have data
          const existing = await AsyncStorage.getItem("hooplog_logs");
          if (existing) {
            await AsyncStorage.setItem("onboarding_done", "1");
          } else {
            router.replace("/onboarding");
          }
        }
      } finally {
        SplashScreen.hideAsync();
        setReady(true);
      }
    };

    check();
  }, [fontsLoaded]);

  if (!fontsLoaded || !ready) return null;

  return (
    <LogsProvider>
      <SettingsProvider>
        <PlansProvider>
          <TemplatesProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
          </TemplatesProvider>
        </PlansProvider>
      </SettingsProvider>
    </LogsProvider>
  );
}
