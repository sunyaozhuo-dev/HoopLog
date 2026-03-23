export const Colors = {
  light: {
    background: "#FFFFFF",
    surface: "#F5F5F5",
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    accent: "#4ADE80",
    accentDark: "#22C55E",
    card: "#FFFFFF",
    barBackground: "#E5E7EB",
    calendarDot: "#4ADE80",
    tabBar: "#FFFFFF",
    tabBarBorder: "#E5E7EB",
    inactive: "#9CA3AF",
  },
  dark: {
    background: "#0F0F0F",
    surface: "#1A1A1A",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    border: "#2D2D2D",
    accent: "#4ADE80",
    accentDark: "#22C55E",
    card: "#1A1A1A",
    barBackground: "#2D2D2D",
    calendarDot: "#4ADE80",
    tabBar: "#1A1A1A",
    tabBarBorder: "#2D2D2D",
    inactive: "#6B7280",
  },
} as const;

export type ThemeColors = typeof Colors.light | typeof Colors.dark;

export const Fonts = {
  regular: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semiBold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 32,
  hero: 48,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
