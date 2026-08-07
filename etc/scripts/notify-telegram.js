const https = require('https');

const botToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();
const status = process.env.STATUS || 'start';
const repo = process.env.REPO || '';
const branch = process.env.BRANCH || '';
const trigger = process.env.TRIGGER || '';
const actor = process.env.ACTOR || '';
const commitMsg = (process.env.COMMIT_MSG || '').trim() || 'N/A (Daily Cron/Manual Dispatch)';
const runId = process.env.RUN_ID || '';

if (!botToken || !chatId) {
  console.error("Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set.");
  process.exit(1);
}

let statusEmoji = '';
let statusTitle = '';
let linkText = '';

if (status === 'start') {
  statusEmoji = '🚀';
  statusTitle = 'CodeQL Analysis Started';
  linkText = 'View Workflow Run';
} else if (status === 'success') {
  statusEmoji = '✅';
  statusTitle = 'CodeQL Analysis Completed';
  linkText = 'View Run Details';
} else {
  statusEmoji = '❌';
  statusTitle = 'CodeQL Analysis Failed';
  linkText = 'View Failed Run Logs';
}

const message = `${statusEmoji} <b>${statusTitle}</b>

📦 <b>Repository:</b> ${repo}
🌿 <b>Branch:</b> ${branch}
🔄 <b>Trigger:</b> ${trigger}
👤 <b>Actor:</b> ${actor}
📝 <b>Commit:</b> ${commitMsg}

🔗 <a href="https://github.com/${repo}/actions/runs/${runId}">${linkText}</a>`;

const data = JSON.stringify({
  chat_id: chatId,
  parse_mode: 'HTML',
  text: message,
});

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${botToken}/sendMessage`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log(`Telegram API response status: ${res.statusCode}`);
    console.log(`Response body: ${body}`);
    if (res.statusCode >= 400) {
      console.error('Error: Telegram API returned an error status.');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
  process.exit(1);
});

req.write(data);
req.end();
