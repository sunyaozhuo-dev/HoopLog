import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Fonts, FontSizes, Spacing } from "../constants/theme";
import type { ThemeColors } from "../constants/theme";
import { t } from "../constants/i18n";

interface Props {
  current: number;
  goal: number;
  colors: ThemeColors;
}

export function WeeklyGoalRing({ current, goal, colors }: Props) {
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / goal, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.barBackground}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.textWrap}>
        <Text style={[styles.count, { color: colors.text, fontFamily: Fonts.bold }]}>
          {current}/{goal}
        </Text>
        <Text
          style={[
            styles.label,
            { color: colors.textSecondary, fontFamily: Fonts.regular },
          ]}
        >
          {t.weeklyGoalLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  textWrap: {
    position: "absolute",
    alignItems: "center",
  },
  count: { fontSize: FontSizes.xl },
  label: { fontSize: FontSizes.xs, marginTop: 2 },
});
