/** 返回今天的日期字符串 YYYY-MM-DD */
export function getToday(): string {
  return formatDate(new Date());
}

/** Date -> "YYYY-MM-DD" */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" -> Date (本地时区) */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** 计算连续打卡天数（从今天往回数） */
export function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...dates].sort().reverse(); // 最新的在前
  const today = getToday();

  // 连续必须从今天或昨天开始
  let current = today;
  if (sorted[0] !== today) {
    const yesterday = addDays(new Date(), -1);
    if (sorted[0] !== formatDate(yesterday)) return 0;
    current = sorted[0];
  }

  let streak = 0;
  for (const d of sorted) {
    if (d === current) {
      streak++;
      current = formatDate(addDays(parseDate(d), -1));
    } else if (d < current) {
      break;
    }
  }
  return streak;
}

/** 日期加减天数 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** 获取某月的所有日期字符串 */
export function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const daysCount = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysCount; d++) {
    days.push(formatDate(new Date(year, month, d)));
  }
  return days;
}

/** 获取某月第一天是周几 (0=周日) */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** 获取最近 7 天的日期字符串（含今天） */
export function getLast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    days.push(formatDate(addDays(today, -i)));
  }
  return days;
}

/** 获取星期几的短名称 */
export function getDayName(dateStr: string): string {
  const { t } = require("../constants/i18n");
  return t.dayNames[parseDate(dateStr).getDay()];
}

/** 获取月份名称 */
export function getMonthName(month: number): string {
  const { t } = require("../constants/i18n");
  return t.monthNames[month];
}
