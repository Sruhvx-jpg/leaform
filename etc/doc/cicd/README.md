# 🌿 LeafForm CI/CD & Automation

This directory documents the CI/CD pipelines, security scanning workflows, and notification integrations for the **LeafForm** project. All future automation configurations, deployment pipelines, and environment validators should be documented here.

---

## 🔒 CodeQL Security Scan (`.github/workflows/codeql.yml`)

LeafForm uses **GitHub CodeQL Analysis** to perform automated static application security testing (SAST). The security scanning is optimized to identify security flaws, dependency issues, and quality defects across the TypeScript and JavaScript codebase.

### 📅 Triggering Strategy

To prevent rate limiting and optimize resource usage, CodeQL execution is configured under three conditions:

1. **Daily Schedule (Cron):** Runs automatically once a day at `03:23 UTC` (which corresponds to `08:53 AM` local IST). This schedule uses a non-standard time to avoid peak runner queue delays.
2. **Pull Requests & Code Pushes:** Automatically scans modifications to the `main` branch.
   - **Path Exclusions:** Ignores documentation updates, configuration directories, and environment setups (`**/*.md`, `etc/**`, `.agents/**`, `.gitignore`, `LICENSE`) to avoid wasting runner minutes.
3. **Manual Trigger (`workflow_dispatch`):** Enables running the scan manually from the GitHub actions tab or programmatically via the GitHub API (e.g. from a Telegram bot webhook).

---

## 📢 Telegram Notification Bot (`.github/scripts/notify-telegram.js`)

A lightweight, dependency-free Node.js notification script integrated directly into the CI/CD pipeline sends real-time status updates when CodeQL jobs **start**, **succeed**, or **fail**.

### 🛠️ Configuration Secrets & Environment Variables

To activate notifications and run statistics, ensure the following are configured in your workflow steps:

| Variable / Secret    | Source / Context                         | Description                                                                                                          |
| :------------------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Repository Secret                        | The unique API token of your bot. Obtainable from [@BotFather](https://t.me/BotFather)                               |
| `TELEGRAM_CHAT_ID`   | Repository Secret                        | The numeric ID of the user or group receiving alerts. Obtainable via [@userinfobot](https://t.me/userinfobot)        |
| `GITHUB_TOKEN`       | Workflow Context (`${{ github.token }}`) | Default runner token. Required to authenticate with the GitHub API to query run history for average execution times. |

### 🔍 Notification Format (HTML)

Messages are structured with rich HTML styling:

- 🚀 **Status Card:** Displays Start, Success, or Failure labels.
- 📦 **Repository & Branch:** Tracks target repository and git branch.
- 🔄 **Trigger Event:** Distinguishes between `push`, manual API dispatch (`workflow_dispatch`), or `schedule` runs.
- 👤 **Actor:** Displays the GitHub username of the person who initiated the event.
- 📝 **Commit Details:** Evaluates the head commit message, falling back cleanly to `N/A` for scheduled runs.
- ⏱️ **Started / Ended At:** Displays timestamps of execution start and completion (in `YYYY-MM-DD HH:MM:SS UTC` format).
- ⏳ **Duration:** Calculates the total elapsed run time for completed executions (e.g., `1m 15s`).
- 📊 **Avg Cron Runtime:** Computes the average execution time of up to the last 100 completed cron runs fetched dynamically via the GitHub API.
- 🔗 **Logs Link:** Direct HTML hyperlink to check the running job or scan failures on GitHub.

### ⚠️ Failures & Error Handling

- **Sanitization:** The `.github/scripts/notify-telegram.js` utility automatically strips leading and trailing newlines, carriage returns, and whitespace from the token and chat ID to prevent malformed URL exceptions.
- **Fail-Safe API Fallbacks:** If `GITHUB_TOKEN` is missing or the GitHub Actions REST API request fails, the average runtime field will display as `N/A` without interrupting or crashing the notification process.
- **Fail-Fast Policy:** The script executes with explicit error verification for Telegram API requests. If the Telegram API returns a `4xx` or `5xx` error (such as `400 chat not found` or `401 Unauthorized`), the step exits with code `1`, causing the GitHub Action job to fail immediately so you can fix credentials.
