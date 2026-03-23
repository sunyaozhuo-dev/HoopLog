import { useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Fonts, FontSizes, Spacing, Radius } from "../constants/theme";
import type { ThemeColors } from "../constants/theme";
import { t } from "../constants/i18n";

interface Props {
  text: string;
  time?: string;
  colors: ThemeColors;
  onDelete: () => void;
}

export function SwipeableNoteItem({ text, time, colors, onDelete }: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <Pressable
        onPress={() => {
          swipeableRef.current?.close();
          Alert.alert(t.deleteNoteTitle, t.deleteNoteMsg, [
            { text: t.cancel, style: "cancel" },
            { text: t.delete, style: "destructive", onPress: onDelete },
          ]);
        }}
        style={styles.deleteBtn}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <View style={[styles.noteItem, { backgroundColor: colors.background }]}>
        <Text
          style={[styles.noteText, { color: colors.text, fontFamily: Fonts.regular }]}
        >
          {text}
        </Text>
        {time && (
          <Text
            style={[
              styles.noteTime,
              { color: colors.textSecondary, fontFamily: Fonts.regular },
            ]}
          >
            {time}
          </Text>
        )}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  noteItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  noteText: { fontSize: FontSizes.md },
  noteTime: { fontSize: FontSizes.xs, marginTop: 4 },
  deleteBtn: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: Radius.sm,
    marginLeft: Spacing.xs,
  },
});
