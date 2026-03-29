# StudyFlow

Windows-first local study tracker built with `Electron + React + TypeScript + SQLite`.

## Run

```bash
npm install
npm run rebuild:native
npm run dev
```

## Project Structure

```text
StudyFlow/
├─ src/
│  ├─ AppShell.tsx                # 4 个主页面：Dashboard / Timeline / Rules / Settings
│  ├─ main.tsx                    # React 入口
│  ├─ index.css                   # 全局样式
│  ├─ copy.ts                     # 中英双语文案
│  ├─ theme.ts                    # 主题与时间格式化工具
│  ├─ global.d.ts                 # window.studyflow 类型声明
│  ├─ lib/
│  │  └─ trackerBridge.ts         # renderer 调用 Electron API 的桥
│  ├─ types/
│  │  └─ study.ts                 # 共享数据模型与 API 类型
│  └─ data/
│     └─ mockStudyData.ts         # 原型期 mock 数据
├─ electron/
│  ├─ main.ts                     # Electron 主进程入口
│  ├─ preload.ts                  # 暴露 window.studyflow
│  ├─ README.md                   # Electron 层说明
│  ├─ services/
│  │  ├─ database.ts              # SQLite schema、查询、规则匹配、活动写入
│  │  ├─ tracking.ts              # 前台窗口采集
│  │  └─ extension-bridge.ts      # 接收 Chrome 扩展活动数据
│  └─ types/
│     └─ better-sqlite3.d.ts      # better-sqlite3 类型补充
├─ chrome-extension/
│  ├─ manifest.json               # Chrome 扩展配置
│  └─ service-worker.js           # 上报当前标签页 URL / 域名 / 标题
├─ scripts/
│  └─ write-electron-package.cjs  # 给 dist-electron 写 CommonJS package.json
├─ package.json                   # 依赖与脚本
├─ tsconfig.electron.json         # Electron 编译配置
├─ tsconfig.app.json              # renderer 编译配置
├─ vite.config.ts                 # Vite 配置
└─ README.md
```

## Main Data Flow

1. `electron/services/tracking.ts` 采集当前前台窗口。
2. `chrome-extension/service-worker.js` 补充浏览器标签页信息。
3. `electron/services/database.ts` 按规则分类并写入 SQLite。
4. `electron/preload.ts` 暴露 `window.studyflow`。
5. `src/lib/trackerBridge.ts` 调用本地 API。
6. `src/AppShell.tsx` 渲染页面。

## SQLite Tables

### `activity_events`

用途：核心真相表，存“合并后的连续活动片段”，不是高频采样点。

字段：

- `id`
- `started_at`
- `ended_at`
  `null` 表示当前片段仍在进行中
- `duration_seconds`
- `source_type`
  `desktop | browser | system`
- `app_name`
- `window_title`
- `domain`
- `url`
- `browser_name`
- `classification`
  `study | distraction | neutral`
- `category`
  `flashcard | note | reading | course | video_course | coding | general`
- `source_label`
- `matched_rule_id`
- `is_idle`
- `confidence`
- `created_at`

### `study_sessions`

用途：用户视角的学习片段表，由学习类活动聚合而来。

字段：

- `id`
- `started_at`
- `ended_at`
- `duration_seconds`
- `classification`
  首版固定为 `study`
- `category`
- `source_label`
- `primary_app_name`
- `primary_domain`
- `note`
- `session_type`
  `auto | manual`
- `created_at`
- `updated_at`

说明：

- `primary_app_name` / `primary_domain` 只是主来源摘要
- 首版不引入 `session_sources`

### `rules`

用途：规则匹配表，决定某个应用 / 域名 / URL / 标题如何分类。

字段：

- `id`
- `name`
- `type`
  - `app_name_equals`
  - `window_title_contains`
  - `domain_equals`
  - `url_prefix`
  - `url_contains`
- `pattern`
- `classification`
  `study | distraction | neutral | ignore`
- `category`
- `source_label`
- `priority`
- `enabled`
- `preset_key`
- `created_at`
- `updated_at`

规则冲突处理：

1. 先按 `priority` 降序
2. 同优先级按精确度：
   `url_prefix > url_contains > domain_equals > window_title_contains > app_name_equals`

### `settings`

用途：全局本地设置。

字段：

- `id`
- `theme_mode`
  `dark | light | system`
- `locale`
  `zh | en`
- `idle_threshold_minutes`
- `launch_on_startup`
- `minimize_to_tray`
- `allow_local_exports`
- `updated_at`

### `browser_activity_cache`

用途：Chrome 扩展到桌面端的短期缓存表，不是长期真相表。

字段：

- `id`
- `browser`
- `tab_id`
- `window_id`
- `url`
- `domain`
- `title`
- `page_type`
- `is_active`
- `captured_at`

清理策略：

- 保留最近 `3 天`
- 或最多保留最近 `5000 条`
