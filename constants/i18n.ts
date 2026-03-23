import { getLocales } from "expo-localization";

const locale = getLocales()[0]?.languageCode ?? "en";
const isZh = locale === "zh";

const zh = {
  // Tabs
  tabToday: "今日",
  tabCalendar: "日历",
  tabProfile: "我的",

  // Home
  today: "今天",
  streakDays: "天连续",
  checkedIn: "今日已打卡",
  checkIn: "开始训练打卡",
  writeNote: "写训练笔记",
  notePlaceholder: "今天练了什么？",
  cancel: "取消",
  save: "保存",
  recentNotes: "最近 7 天笔记",
  emptyCheckedIn: "还没写笔记，点上方按钮记录训练内容",
  emptyNotCheckedIn: "点击上方按钮打卡今日训练吧",

  // History
  calendarTitle: "训练日历",
  monthTitle: (year: number, month: string) => `${year}年${month}`,
  monthTraining: (count: number) => `本月训练 ${count} 天`,
  last7Days: "最近 7 天",
  monthlyTrend: "月度趋势",
  monthNotes: "本月笔记",
  calendarEmpty: "完成第一次打卡后，训练日期会在这里高亮显示",
  weekDays: ["日", "一", "二", "三", "四", "五", "六"],
  dayNames: ["日", "一", "二", "三", "四", "五", "六"],
  monthNames: [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ],

  // Settings
  nickname: "昵称",
  nicknamePlaceholder: "输入你的昵称",
  profileTitle: "个人中心",
  trainingStats: "训练统计",
  totalDays: "总训练天数",
  currentStreak: "当前连续",
  longestStreak: "最长连续",
  totalNotes: "总笔记数",
  streakValue: (n: number) => `${n} 天`,
  weeklyGoal: "每周训练目标",
  goalDays: (n: number) => `${n}天`,
  trainingReminder: "训练提醒",
  dailyReminder: "每日提醒",
  reminderTime: "提醒时间",
  exportData: "导出训练数据",
  privacyPolicy: "隐私政策",
  about: "关于",
  aboutDesc: "篮球训练打卡助手",
  aboutStorage: "数据存储在本地设备",
  notifPermTitle: "需要通知权限",
  notifPermMsg: "请在系统设置中开启 HoopLog 的通知权限",
  notifBody: "该训练了！今天打卡了吗？",
  exportTitle: "HoopLog 训练记录",
  exportTotalDays: "总训练天数",
  exportCurrentStreak: "当前连续",
  exportLongestStreak: "最长连续",

  // Onboarding
  tagline: "你的篮球训练日记",
  welcomeDesc: "每天打卡一次，积累连续天数，记录每次进步。坚持训练，从这里开始。",
  featuresTitle: "三步追踪进步",
  featuresSubtitle: "简单、直观，专为篮球训练设计",
  featureStreak: "连续打卡追踪",
  featureStreakDesc: "每天记录训练，保持连续天数不断涨，激励自己坚持下去",
  featureCalendar: "月度训练日历",
  featureCalendarDesc: "一眼看清哪天练了哪天没练，掌握自己的训练规律",
  featureNotes: "训练笔记",
  featureNotesDesc: "记下今天练了什么，复盘进步轨迹",
  setupTitle: "个性化设置",
  setupSubtitle: "设置好就可以直接用，之后随时可以改",
  setupReminder: "每日训练提醒",
  setupReminderDesc: "到时间提醒你去训练",
  nextStep: "下一步",
  startTraining: "开始训练",

  // Privacy
  privacyUpdated: "最后更新：2026年3月",
  privacyDataStorage: "数据存储",
  privacyDataStorageBody:
    "HoopLog 的所有训练数据（打卡记录、训练笔记等）仅存储在您的本地设备上。我们不收集、不上传、不共享您的任何个人数据。",
  privacyNotifications: "通知权限",
  privacyNotificationsBody:
    "如果您开启了训练提醒，HoopLog 会在您设定的时间发送本地通知。通知内容仅在您的设备本地生成，不经过任何服务器。您可以随时在系统设置中关闭通知权限。",
  privacyExport: "数据导出",
  privacyExportBody:
    "导出功能通过系统分享面板将您的训练记录发送到您选择的目标（如备忘录、邮件等）。HoopLog 不参与数据的传输过程，导出目标完全由您决定。",
  privacyThirdParty: "第三方服务",
  privacyThirdPartyBody:
    "HoopLog 不使用任何第三方分析、广告或用户行为追踪服务。应用不需要网络连接即可正常使用。",
  privacyDeletion: "数据删除",
  privacyDeletionBody:
    '卸载 HoopLog 将永久删除设备上存储的所有训练数据。如需在卸载前备份数据，请使用"导出训练数据"功能。',
  privacyContact: "联系我们",
  privacyContactBody:
    "如有隐私相关问题，请通过 App Store 评论或反馈功能联系我们。",

  // Notes
  notes: "笔记",
  allNotes: "所有笔记",
  noNotes: "还没有笔记",

  // Delete confirmation
  deleteNoteTitle: "删除笔记",
  deleteNoteMsg: "确定要删除这条笔记吗？",
  delete: "删除",

  // Weekly goal ring
  weeklyGoalLabel: "本周目标",

  // Plans
  planTitle: "训练计划",
  planAddItem: "添加计划项",
  planItemPlaceholder: "例：运球练习 30min",
  deletePlanItemTitle: "删除计划项",
  deletePlanItemMsg: "确定要删除这条计划吗？",
  planEmpty: "还没有训练计划",

  // Plan-checkin integration
  allDoneCheckIn: "全部完成！打卡吧",
  planCompleted: "已完成",

  // Upcoming
  upcoming: "即将到来",
  upcomingItems: (count: number) => `${count} 项计划`,

  // Templates
  saveAsTemplate: "保存为模板",
  templateName: "模板名称",
  templateNamePlaceholder: "例：投篮日",
  fromTemplate: "从模板添加",
  noTemplates: "还没有模板",
  deleteTemplateTitle: "删除模板",
  deleteTemplateMsg: "确定要删除这个模板吗？",
  templateSaved: "模板已保存",
  templates: "训练模板",
};

const en: typeof zh = {
  tabToday: "Today",
  tabCalendar: "Calendar",
  tabProfile: "Profile",

  today: "Today",
  streakDays: "day streak",
  checkedIn: "Checked in today",
  checkIn: "Check in",
  writeNote: "Add training note",
  notePlaceholder: "What did you practice today?",
  cancel: "Cancel",
  save: "Save",
  recentNotes: "Recent notes",
  emptyCheckedIn: "No notes yet — tap above to record your training",
  emptyNotCheckedIn: "Tap the button above to check in today",

  calendarTitle: "Training Calendar",
  monthTitle: (year: number, month: string) => `${month} ${year}`,
  monthTraining: (count: number) => `${count} days this month`,
  last7Days: "Last 7 Days",
  monthlyTrend: "Monthly Trend",
  monthNotes: "Notes This Month",
  calendarEmpty:
    "Training days will be highlighted here after your first check-in",
  weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  dayNames: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  monthNames: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ],

  nickname: "Nickname",
  nicknamePlaceholder: "Enter your nickname",
  profileTitle: "Profile",
  trainingStats: "Training Stats",
  totalDays: "Total Days",
  currentStreak: "Current Streak",
  longestStreak: "Longest Streak",
  totalNotes: "Total Notes",
  streakValue: (n: number) => `${n} days`,
  weeklyGoal: "Weekly Goal",
  goalDays: (n: number) => `${n}`,
  trainingReminder: "Reminders",
  dailyReminder: "Daily Reminder",
  reminderTime: "Reminder Time",
  exportData: "Export Training Data",
  privacyPolicy: "Privacy Policy",
  about: "About",
  aboutDesc: "Basketball training tracker",
  aboutStorage: "Data stored locally on device",
  notifPermTitle: "Notification Permission Needed",
  notifPermMsg: "Please enable notifications for HoopLog in system settings",
  notifBody: "Time to train! Have you checked in today?",
  exportTitle: "HoopLog Training Log",
  exportTotalDays: "Total training days",
  exportCurrentStreak: "Current streak",
  exportLongestStreak: "Longest streak",

  tagline: "Your basketball training diary",
  welcomeDesc:
    "Check in daily, build your streak, and track every step of progress. Start here.",
  featuresTitle: "Track Your Progress",
  featuresSubtitle: "Simple and intuitive, designed for basketball training",
  featureStreak: "Streak Tracking",
  featureStreakDesc:
    "Log your training daily, keep your streak going, and stay motivated",
  featureCalendar: "Monthly Calendar",
  featureCalendarDesc:
    "See at a glance which days you trained and spot your patterns",
  featureNotes: "Training Notes",
  featureNotesDesc: "Write down what you practiced and review your progress",
  setupTitle: "Personalize",
  setupSubtitle: "Set up once, change anytime later",
  setupReminder: "Daily Training Reminder",
  setupReminderDesc: "Get reminded when it's time to train",
  nextStep: "Next",
  startTraining: "Start Training",

  privacyUpdated: "Last updated: March 2026",
  privacyDataStorage: "Data Storage",
  privacyDataStorageBody:
    "All training data in HoopLog (check-in records, training notes, etc.) is stored only on your local device. We do not collect, upload, or share any of your personal data.",
  privacyNotifications: "Notification Permission",
  privacyNotificationsBody:
    "If you enable training reminders, HoopLog sends local notifications at your scheduled times. Notification content is generated locally on your device and does not pass through any server. You can disable notification permissions at any time in system settings.",
  privacyExport: "Data Export",
  privacyExportBody:
    "The export feature sends your training records via the system share sheet to a destination of your choice (e.g., Notes, email). HoopLog does not participate in the data transmission process; the export destination is entirely your decision.",
  privacyThirdParty: "Third-Party Services",
  privacyThirdPartyBody:
    "HoopLog does not use any third-party analytics, advertising, or user behavior tracking services. The app does not require an internet connection to function.",
  privacyDeletion: "Data Deletion",
  privacyDeletionBody:
    'Uninstalling HoopLog will permanently delete all training data stored on your device. To back up your data before uninstalling, use the "Export Training Data" feature.',
  privacyContact: "Contact Us",
  privacyContactBody:
    "For privacy-related questions, please contact us through App Store reviews or feedback.",

  notes: "Notes",
  allNotes: "All Notes",
  noNotes: "No notes yet",

  deleteNoteTitle: "Delete Note",
  deleteNoteMsg: "Are you sure you want to delete this note?",
  delete: "Delete",

  weeklyGoalLabel: "Weekly Goal",

  planTitle: "Training Plan",
  planAddItem: "Add item",
  planItemPlaceholder: "e.g. Dribbling drills 30min",
  deletePlanItemTitle: "Delete Plan Item",
  deletePlanItemMsg: "Are you sure you want to delete this item?",
  planEmpty: "No training plan yet",

  allDoneCheckIn: "All done! Check in?",
  planCompleted: "completed",

  upcoming: "Upcoming",
  upcomingItems: (count: number) => `${count} item${count !== 1 ? "s" : ""}`,

  saveAsTemplate: "Save as Template",
  templateName: "Template Name",
  templateNamePlaceholder: "e.g. Shooting Day",
  fromTemplate: "From Template",
  noTemplates: "No templates yet",
  deleteTemplateTitle: "Delete Template",
  deleteTemplateMsg: "Are you sure you want to delete this template?",
  templateSaved: "Template saved",
  templates: "Training Templates",
};

export const t = isZh ? zh : en;
