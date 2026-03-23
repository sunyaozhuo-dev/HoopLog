import { ScrollView, Text, StyleSheet, Pressable, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors, Fonts, FontSizes, Spacing } from "../constants/theme";
import type { ThemeColors } from "../constants/theme";
import { t } from "../constants/i18n";

export default function PrivacyScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={c.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.text, fontFamily: Fonts.semiBold }]}>
          {t.privacyPolicy}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.updated, { color: c.textSecondary, fontFamily: Fonts.regular }]}>
          {t.privacyUpdated}
        </Text>

        <Section title={t.privacyDataStorage} c={c}>
          {t.privacyDataStorageBody}
        </Section>

        <Section title={t.privacyNotifications} c={c}>
          {t.privacyNotificationsBody}
        </Section>

        <Section title={t.privacyExport} c={c}>
          {t.privacyExportBody}
        </Section>

        <Section title={t.privacyThirdParty} c={c}>
          {t.privacyThirdPartyBody}
        </Section>

        <Section title={t.privacyDeletion} c={c}>
          {t.privacyDeletionBody}
        </Section>

        <Section title={t.privacyContact} c={c}>
          {t.privacyContactBody}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
  c,
}: {
  title: string;
  children: string;
  c: ThemeColors;
}) {
  return (
    <>
      <Text style={[styles.sectionTitle, { color: c.text, fontFamily: Fonts.semiBold }]}>
        {title}
      </Text>
      <Text style={[styles.body, { color: c.textSecondary, fontFamily: Fonts.regular }]}>
        {children}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40 },
  headerTitle: { fontSize: FontSizes.md },
  content: { padding: Spacing.lg, paddingBottom: 60 },
  updated: { fontSize: FontSizes.sm, marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  body: { fontSize: FontSizes.sm, lineHeight: 22 },
});
