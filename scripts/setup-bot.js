#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const https = require("https");
require("dotenv").config({ path: ".env.local" });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN not found in .env.local");
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error("❌ WEBHOOK_URL not found in .env.local");
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: data ? "POST" : "GET",
      headers: data ? { "Content-Type": "application/json" } : {},
    };

    const req = https.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function setupBot() {
  console.log("🚀 Setting up 'Guess the Song' Telegram bot...\n");

  try {
    console.log("📋 Getting bot information...");
    const botInfo = await makeRequest(`${TELEGRAM_API}/getMe`);

    if (botInfo.ok) {
      console.log(`✅ Bot connected: @${botInfo.result.username}`);
      console.log(`   Name: ${botInfo.result.first_name}`);
      console.log(`   ID: ${botInfo.result.id}\n`);
    } else {
      throw new Error(`Failed to get bot info: ${botInfo.description}`);
    }

    console.log("🔗 Setting webhook...");
    const webhookResult = await makeRequest(`${TELEGRAM_API}/setWebhook`, {
      url: `${WEBHOOK_URL}/api/webhook`,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true,
    });

    if (webhookResult.ok) {
      console.log(`✅ Webhook set to: ${WEBHOOK_URL}/api/webhook\n`);
    } else {
      throw new Error(`Failed to set webhook: ${webhookResult.description}`);
    }

    console.log("📝 Setting bot commands...");
    const commandsResult = await makeRequest(`${TELEGRAM_API}/setMyCommands`, {
      commands: [
        { command: "start", description: "شروع و معرفی بات" },
        { command: "games", description: "نمایش لیست بازی‌های فعال" },
        { command: "help", description: "راهنمای کامل بازی" },
      ],
      scope: { type: "default" },
    });

    if (commandsResult.ok) {
      console.log(
        "✅ Bot commands set successfully for 'Guess the Song' game.\n"
      );
    } else {
      console.log("⚠️ Warning: Could not set bot commands.");
      console.log(`   Error: ${commandsResult.description}\n`);
    }

    console.log("📄 Setting bot description...");
    const descriptionResult = await makeRequest(
      `${TELEGRAM_API}/setMyDescription`,
      {
        description: "🎵 با حدس نام خواننده و آهنگ، دوستانت را به چالش بکش!",
        language_code: "fa",
      }
    );

    if (descriptionResult.ok) {
      console.log("✅ Bot description set successfully.\n");
    } else {
      console.log("⚠️ Warning: Could not set bot description.");
      console.log(`   Error: ${descriptionResult.description}\n`);
    }
    
    console.log("⚙️ Setting main menu button...");
    const menuButtonResult = await makeRequest(`${TELEGRAM_API}/setChatMenuButton`, {
      menu_button: {
        type: 'web_app',
        text: 'لیست بازی‌ها',
        web_app: { url: WEBHOOK_URL }
      }
    });

    if (menuButtonResult.ok) {
        console.log("✅ Main menu button set to open the Web App.\n");
    } else {
        console.log("⚠️ Warning: Could not set the main menu button.");
        console.log(`   Error: ${menuButtonResult.description}\n`);
    }

    console.log("🔍 Checking webhook status...");
    const webhookInfo = await makeRequest(`${TELEGRAM_API}/getWebhookInfo`);

    if (webhookInfo.ok) {
      console.log("✅ Webhook status:");
      console.log(`   URL: ${webhookInfo.result.url}`);
      console.log(
        `   Pending updates: ${webhookInfo.result.pending_update_count}`
      );
      if (webhookInfo.result.last_error_date) {
        console.log(
          `   ⚠️ Last error (${new Date(
            webhookInfo.result.last_error_date * 1000
          ).toLocaleString()}): ${webhookInfo.result.last_error_message}`
        );
      } else {
        console.log("   ✅ No recent errors.");
      }
    }

    console.log("\n🎉 Bot setup completed successfully!");
    console.log("\n📋 Next steps:");
    console.log(`1. Open a chat with your bot: @${botInfo.result.username}`);
    console.log("2. Send the /start command or click the main menu button.");
    console.log(
      "3. To manage games, navigate to the admin panel at /admin in your browser."
    );

    console.log("\n🔧 Final Configuration:");
    console.log(`   • Username: @${botInfo.result.username}`);
    console.log(`   • Webhook: ${WEBHOOK_URL}/api/webhook`);
    console.log(`   • Web App URL: ${WEBHOOK_URL}`);
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

setupBot();
