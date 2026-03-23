import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLogs } from "../contexts/LogsContext";
import { SwipeableNoteItem } from "../components/SwipeableNoteItem";
import { Colors, Fonts, FontSizes, Spacing, Radius } from "../constants/theme";
import { t } from "../constants/i18n";

export default function NotesScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === "dark" ? "dark" : "light"];
  const { logs, deleteNote } = useLogs();

  const allNotes = logs
    .filter((l) => l.notes.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((l) => ({ date: l.date, notes: l.notes }));

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={c.text} />
          </Pressable>
          <Text style={[styles.title, { color: c.text, fontFamily: Fonts.bold }]}>
            {t.allNotes}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {allNotes.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                { color: c.textSecondary, fontFamily: Fonts.regular },
              ]}
            >
              {t.noNotes}
            </Text>
          ) : (
            allNotes.map(({ date, notes }) => (
              <View key={date}>
                <Text
                  style={[
                    styles.dateHeader,
                    { color: c.textSecondary, fontFamily: Fonts.medium },
                  ]}
                >
                  {date}
                </Text>
                {notes.map((note) => (
                  <SwipeableNoteItem
                    key={note.id}
                    text={note.text}
                    time={note.createdAt.split("T")[1]?.slice(0, 5)}
                    colors={c}
                    onDelete={() => deleteNote(date, note.id)}
                  />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSizes.xl },
  content: { padding: Spacing.lg, paddingTop: 0, paddingBottom: 100 },
  dateHeader: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.xxl,
    fontSize: FontSizes.md,
  },
});
