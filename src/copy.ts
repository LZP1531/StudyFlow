export type Locale = "zh" | "en";
export type ThemeMode = "light" | "dark" | "system";
export type ViewKey = "dashboard" | "timeline" | "rules" | "settings";

export type Copy = {
  appTagline: string;
  loading: string;
  nav: Record<ViewKey, { label: string; hint: string }>;
  localeToggle: string;
  themeToggle: string;
  themeModes: Record<ThemeMode, string>;
  classification: {
    study: string;
    distraction: string;
    neutral: string;
  };
  currentFocus: string;
  localOnly: string;
  heroEyebrow: string;
  heroTitle: string;
  stats: Record<"today" | "focused" | "weekly" | "distraction", { label: string }>;
  weekly: {
    eyebrow: string;
    title: string;
    total: string;
    bestDay: string;
  };
  sources: {
    eyebrow: string;
    title: string;
  };
  timeline: {
    eyebrow: string;
    title: string;
    compactLabel: string;
    fields: {
      title: string;
      source: string;
      classification: string;
    };
  };
  rules: {
    eyebrow: string;
    title: string;
    add: string;
    enabled: string;
    disabled: string;
    hitsToday: string;
    presetsEyebrow: string;
    defaults: Array<{ title: string; description: string; badge: string }>;
    customDescription: string;
  };
  settings: {
    eyebrow: string;
    title: string;
    windows: string;
    sections: {
      general: string;
      tracking: string;
      data: string;
      integrations: string;
      diagnostics: string;
    };
    fields: {
      startup: string;
      tray: string;
      idle: string;
      timerStyle: string;
      export: string;
      lang: string;
      theme: string;
      browserExtension: string;
      trackingStatus: string;
      databaseHealth: string;
      appVersion: string;
      lastSyncAt: string;
      copyDebugInfo: string;
    };
    values: {
      on: string;
      off: string;
      active: string;
      paused: string;
      connected: string;
      disconnected: string;
      healthy: string;
      warning: string;
      error: string;
      unavailable: string;
      exportReady: string;
      exportDisabled: string;
      exportAction: string;
      copyAction: string;
      copied: string;
      exported: string;
      timerDial: string;
      timerFlip: string;
    };
    statusCards: {
      tracking: string;
      browserExtension: string;
      database: string;
    };
    descriptions: {
      general: string;
      tracking: string;
      data: string;
      integrations: string;
      diagnostics: string;
    };
    helpers: {
      idle: string;
      trackingStatus: string;
      browserExtension: string;
      databaseHealth: string;
      appVersion: string;
      export: string;
      language: string;
      theme: string;
      timerStyle: string;
      startup: string;
      tray: string;
      lastSyncAt: string;
    };
  };
};

export const copy: Record<Locale, Copy> = {
  zh: {
    appTagline: "本地学习追踪",
    loading: "正在加载 StudyFlow...",
    nav: {
      dashboard: { label: "总览", hint: "今天学了多久" },
      timeline: { label: "时间线", hint: "系统记录了什么" },
      rules: { label: "规则", hint: "哪些内容算学习" },
      settings: { label: "设置", hint: "主题、语言与隐私" },
    },
    localeToggle: "切换语言",
    themeToggle: "切换主题",
    themeModes: { light: "浅色", dark: "深色", system: "系统" },
    classification: {
      study: "学习",
      distraction: "娱乐",
      neutral: "中性",
    },
    currentFocus: "当前学习",
    localOnly: "仅本地",
    heroEyebrow: "Automatic local tracking",
    heroTitle: "让学习时间被看见",
    stats: {
      today: { label: "今日学习时长" },
      focused: { label: "学习片段" },
      weekly: { label: "本周累计" },
      distraction: { label: "娱乐时长" },
    },
    weekly: {
      eyebrow: "Weekly trend",
      title: "本周学习节奏",
      total: "本周总学习",
      bestDay: "最佳单日",
    },
    sources: {
      eyebrow: "Study sources",
      title: "今天主要学了什么",
    },
    timeline: {
      eyebrow: "Timeline",
      title: "系统今天记录了什么",
      compactLabel: "按学习片段查看",
      fields: {
        title: "标题",
        source: "来源",
        classification: "分类",
      },
    },
    rules: {
      eyebrow: "Rules",
      title: "哪些内容算学习",
      add: "新增规则",
      enabled: "已启用",
      disabled: "已关闭",
      hitsToday: "今日命中",
      presetsEyebrow: "Starter presets",
      defaults: [
        { title: "编程学习包", description: "LeetCode、Coursera、MDN、GitHub Docs", badge: "编程" },
        { title: "英语学习包", description: "Anki、Cambridge Dictionary、英语课程", badge: "英语" },
        { title: "笔记整理包", description: "Obsidian、Notion、幕布、XMind", badge: "笔记" },
      ],
      customDescription: "按应用名、窗口标题、域名或 URL 添加自定义规则",
    },
    settings: {
      eyebrow: "Settings",
      title: "偏好与隐私",
      windows: "Windows MVP",
      sections: {
        general: "通用",
        tracking: "追踪",
        data: "数据",
        integrations: "集成",
        diagnostics: "诊断",
      },
      fields: {
        startup: "开机自动启动",
        tray: "最小化到托盘",
        idle: "空闲阈值",
        timerStyle: "计时器样式",
        export: "本地数据导出",
        lang: "语言",
        theme: "主题",
        browserExtension: "浏览器扩展连接状态",
        trackingStatus: "当前追踪状态",
        databaseHealth: "数据库健康",
        appVersion: "应用版本",
        lastSyncAt: "最近扩展同步",
        copyDebugInfo: "复制调试信息",
      },
      values: {
        on: "已开启",
        off: "未开启",
        active: "正在追踪",
        paused: "已暂停",
        connected: "已连接",
        disconnected: "未连接",
        healthy: "正常",
        warning: "警告",
        error: "异常",
        unavailable: "暂无",
        exportReady: "可以导出",
        exportDisabled: "已禁用",
        exportAction: "导出数据",
        copyAction: "复制信息",
        copied: "已复制",
        exported: "导出成功",
        timerDial: "表盘",
        timerFlip: "翻页",
      },
      statusCards: {
        tracking: "Tracking status",
        browserExtension: "Browser extension",
        database: "Database health",
      },
      descriptions: {
        general: "界面偏好会立即生效并保存到本地。",
        tracking: "这些选项会影响桌面端追踪行为。",
        data: "只保留必要的数据操作入口。",
        integrations: "查看浏览器扩展是否与桌面端正常联动。",
        diagnostics: "用来快速判断当前运行环境是否正常。",
      },
      helpers: {
        idle: "超过这个时间没有鼠标或键盘操作时，StudyFlow 会暂停累计学习时长。看视频或长时间阅读时，建议设置得更宽松。",
        trackingStatus: "控制桌面端是否继续采集和累计新的学习活动记录。",
        browserExtension: "显示浏览器扩展当前是否正在和桌面端正常通信。",
        databaseHealth: "用于判断本地 SQLite 数据库当前是否可正常读写。",
        appVersion: "当前桌面应用版本，便于排查兼容性和问题反馈。",
        export: "将本地 SQLite 数据导出为单独文件，方便备份或迁移。",
        language: "切换整个应用界面的显示语言。",
        theme: "切换应用外观主题，可选深色、浅色或跟随系统。",
        timerStyle: "切换总览页第三列的计时器显示样式，可在表盘和翻页之间切换。",
        startup: "开启后，Windows 登录后会自动启动 StudyFlow。",
        tray: "关闭主窗口时改为缩到系统托盘，而不是直接退出。",
        lastSyncAt: "显示最近一次收到浏览器扩展活动同步的时间。",
      },
    },
  },
  en: {
    appTagline: "Local study tracking",
    loading: "Loading StudyFlow...",
    nav: {
      dashboard: { label: "Dashboard", hint: "How much you studied today" },
      timeline: { label: "Timeline", hint: "What the system captured" },
      rules: { label: "Rules", hint: "What counts as study" },
      settings: { label: "Settings", hint: "Theme, language, and privacy" },
    },
    localeToggle: "Change language",
    themeToggle: "Change theme",
    themeModes: { light: "Light", dark: "Dark", system: "System" },
    classification: {
      study: "Study",
      distraction: "Distraction",
      neutral: "Neutral",
    },
    currentFocus: "Current focus",
    localOnly: "Local only",
    heroEyebrow: "Automatic local tracking",
    heroTitle: "Make study time visible",
    stats: {
      today: { label: "Study time today" },
      focused: { label: "Study sessions" },
      weekly: { label: "Weekly total" },
      distraction: { label: "Distraction time" },
    },
    weekly: {
      eyebrow: "Weekly trend",
      title: "This week's learning rhythm",
      total: "Weekly total",
      bestDay: "Best day",
    },
    sources: {
      eyebrow: "Study sources",
      title: "What you studied today",
    },
    timeline: {
      eyebrow: "Timeline",
      title: "What the system recorded today",
      compactLabel: "Session view",
      fields: {
        title: "Title",
        source: "Source",
        classification: "Classification",
      },
    },
    rules: {
      eyebrow: "Rules",
      title: "What counts as study",
      add: "Add rule",
      enabled: "Enabled",
      disabled: "Disabled",
      hitsToday: "hits today",
      presetsEyebrow: "Starter presets",
      defaults: [
        { title: "Coding pack", description: "LeetCode, Coursera, MDN, GitHub Docs", badge: "Coding" },
        { title: "Language pack", description: "Anki, Cambridge Dictionary, English courses", badge: "English" },
        { title: "Notes pack", description: "Obsidian, Notion, Mubu, XMind", badge: "Notes" },
      ],
      customDescription: "Create a rule from app name, window title, domain, or URL",
    },
    settings: {
      eyebrow: "Settings",
      title: "Preferences and privacy",
      windows: "Windows MVP",
      sections: {
        general: "General",
        tracking: "Tracking",
        data: "Data",
        integrations: "Integrations",
        diagnostics: "Diagnostics",
      },
      fields: {
        startup: "Launch on startup",
        tray: "Minimize to tray",
        idle: "Idle threshold",
        timerStyle: "Timer style",
        export: "Local export",
        lang: "Language",
        theme: "Theme",
        browserExtension: "Browser extension status",
        trackingStatus: "Tracking status",
        databaseHealth: "Database health",
        appVersion: "App version",
        lastSyncAt: "Last extension sync",
        copyDebugInfo: "Copy debug info",
      },
      values: {
        on: "On",
        off: "Off",
        active: "Active",
        paused: "Paused",
        connected: "Connected",
        disconnected: "Disconnected",
        healthy: "Healthy",
        warning: "Warning",
        error: "Error",
        unavailable: "Unavailable",
        exportReady: "Ready",
        exportDisabled: "Disabled",
        exportAction: "Export data",
        copyAction: "Copy info",
        copied: "Copied",
        exported: "Exported",
        timerDial: "Dial",
        timerFlip: "Flip",
      },
      statusCards: {
        tracking: "Tracking status",
        browserExtension: "Browser extension",
        database: "Database health",
      },
      descriptions: {
        general: "Interface preferences apply immediately and stay local.",
        tracking: "These options control desktop tracking behavior.",
        data: "Only the essential data actions live here for v1.",
        integrations: "Check whether the browser extension is linked to the desktop app.",
        diagnostics: "Quick environment status for support and debugging.",
      },
      helpers: {
        idle: "If there is no mouse or keyboard input longer than this, StudyFlow pauses study time accumulation. Use a looser value for video or reading-heavy study.",
        trackingStatus: "Controls whether the desktop app keeps capturing and accumulating new study activity.",
        browserExtension: "Shows whether the browser extension is currently communicating with the desktop app.",
        databaseHealth: "Indicates whether the local SQLite database is healthy for reads and writes.",
        appVersion: "The current desktop app version for compatibility checks and issue reports.",
        export: "Exports the local SQLite data into a standalone file for backup or migration.",
        language: "Changes the display language across the app interface.",
        theme: "Changes the app appearance theme: dark, light, or system.",
        timerStyle: "Switches the dashboard timer in the third column between dial and flip styles.",
        startup: "When enabled, StudyFlow launches automatically after Windows sign-in.",
        tray: "When enabled, closing the main window sends the app to the system tray instead of quitting.",
        lastSyncAt: "Shows when the latest browser-extension activity sync was received.",
      },
    },
  },
};
