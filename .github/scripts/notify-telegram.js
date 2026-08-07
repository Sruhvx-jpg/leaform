const https = require("https");
const fs = require("fs");
const path = require("path");

const botToken = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
const chatId = (process.env.TELEGRAM_CHAT_ID || "").trim();
const status = process.env.STATUS || "start";
const repo = process.env.REPO || "";
const branch = process.env.BRANCH || "";
const trigger = process.env.TRIGGER || "";
const actor = process.env.ACTOR || "";
const commitMsg = (process.env.COMMIT_MSG || "").trim() || "N/A (Daily Cron/Manual Dispatch)";
const runId = process.env.RUN_ID || "";
const githubToken = (process.env.GITHUB_TOKEN || "").trim();

if (!botToken || !chatId) {
  console.error("Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set.");
  process.exit(1);
}

function formatTime(date) {
  const pad = (num) => String(num).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  const mm = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} UTC`;
}

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

async function getAverageCronRuntime() {
  if (!githubToken) {
    console.log("No GITHUB_TOKEN provided, skipping average runtime calculation.");
    return null;
  }

  try {
    const url = `https://api.github.com/repos/${repo}/actions/workflows/codeql.yml/runs?event=schedule&status=completed&per_page=100`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "github-actions-telegram-bot",
        Authorization: `Bearer ${githubToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch workflow runs: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const runs = data.workflow_runs || [];
    if (runs.length === 0) {
      return null;
    }

    let totalMs = 0;
    let count = 0;
    for (const run of runs) {
      const start = new Date(run.run_started_at || run.created_at);
      const end = new Date(run.updated_at);
      const duration = end - start;
      if (duration > 0) {
        totalMs += duration;
        count++;
      }
    }

    if (count === 0) return null;
    return {
      avgMs: totalMs / count,
      count,
    };
  } catch (err) {
    console.error("Error fetching average runtime:", err.message);
    return null;
  }
}

async function run() {
  const startTimeFile = path.join(process.cwd(), ".workflow-start-time");
  let startTimeStr = "";
  let endTimeStr = "";
  let durationStr = "";

  const now = new Date();

  if (status === "start") {
    const startTime = now.getTime();
    try {
      fs.writeFileSync(startTimeFile, startTime.toString(), "utf8");
    } catch (err) {
      console.error("Warning: Could not write start time file:", err.message);
    }
    startTimeStr = formatTime(now);
  } else {
    let startMs = null;
    try {
      if (fs.existsSync(startTimeFile)) {
        const content = fs.readFileSync(startTimeFile, "utf8").trim();
        startMs = parseInt(content, 10);
      }
    } catch (err) {
      console.error("Warning: Could not read start time file:", err.message);
    }

    if (startMs && !isNaN(startMs)) {
      const startDate = new Date(startMs);
      startTimeStr = formatTime(startDate);
      const endMs = now.getTime();
      endTimeStr = formatTime(now);
      durationStr = formatDuration(endMs - startMs);
    } else {
      startTimeStr = "N/A";
      endTimeStr = formatTime(now);
      durationStr = "N/A";
    }

    try {
      if (fs.existsSync(startTimeFile)) {
        fs.unlinkSync(startTimeFile);
      }
    } catch (err) {
      console.error("Warning: Could not delete start time file:", err.message);
    }
  }

  // Get average runtime
  const avgInfo = await getAverageCronRuntime();
  let avgRuntimeStr = "N/A";
  if (avgInfo) {
    avgRuntimeStr = `${formatDuration(avgInfo.avgMs)} (based on last ${avgInfo.count} completed cron jobs)`;
  }

  let statusEmoji = "";
  let statusTitle = "";
  let linkText = "";

  if (status === "start") {
    statusEmoji = "🚀";
    statusTitle = "CodeQL Analysis Started";
    linkText = "View Workflow Run";
  } else if (status === "success") {
    statusEmoji = "✅";
    statusTitle = "CodeQL Analysis Completed";
    linkText = "View Run Details";
  } else {
    statusEmoji = "❌";
    statusTitle = "CodeQL Analysis Failed";
    linkText = "View Failed Run Logs";
  }

  let timeInfo = "";
  if (status === "start") {
    timeInfo = `⏱️ <b>Started At:</b> ${startTimeStr}
📊 <b>Avg Cron Runtime:</b> ${avgRuntimeStr}`;
  } else {
    timeInfo = `⏱️ <b>Started At:</b> ${startTimeStr}
⏳ <b>Ended At:</b> ${endTimeStr}
⏱️ <b>Duration:</b> ${durationStr}
📊 <b>Avg Cron Runtime:</b> ${avgRuntimeStr}`;
  }

  const message = `${statusEmoji} <b>${statusTitle}</b>

📦 <b>Repository:</b> ${repo}
🌿 <b>Branch:</b> ${branch}
🔄 <b>Trigger:</b> ${trigger}
👤 <b>Actor:</b> ${actor}
📝 <b>Commit:</b> ${commitMsg}
${timeInfo}

🔗 <a href="https://github.com/${repo}/actions/runs/${runId}">${linkText}</a>`;

  console.log("Sending Telegram message:\n", message);

  const data = JSON.stringify({
    chat_id: chatId,
    parse_mode: "HTML",
    text: message,
  });

  const options = {
    hostname: "api.telegram.org",
    port: 443,
    path: `/bot${botToken}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
  };

  const req = https.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      console.log(`Telegram API response status: ${res.statusCode}`);
      console.log(`Response body: ${body}`);
      if (res.statusCode >= 400) {
        console.error("Error: Telegram API returned an error status.");
        process.exit(1);
      }
    });
  });

  req.on("error", (error) => {
    console.error("Request error:", error);
    process.exit(1);
  });

  req.write(data);
  req.end();
}

run().catch((err) => {
  console.error("Unhandled error running script:", err);
  process.exit(1);
});
