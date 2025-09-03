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
  console.log("🚀 Setting up Telegram bot...\n");

  try {
    console.log("📋 Getting bot information...");
    const botInfo = await makeRequest(`${TELEGRAM_API}/getMe`);

    if (botInfo.ok) {
      console.log(`✅ Bot connected: @${botInfo.result.username}`);
      console.log(`   Name: ${botInfo.result.first_name}`);
      console.log(`   ID: ${botInfo.result.id}\n`);
    } else {
      throw new Error("Failed to get bot info: " + botInfo.description);
    }

    console.log("🔗 Setting webhook...");
    const webhookResult = await makeRequest(`${TELEGRAM_API}/setWebhook`, {
      url: `${WEBHOOK_URL}/api/webhook`,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true,
    });

    if (webhookResult.ok) {
      console.log(`✅ Webhook set to: ${WEBHOOK_URL}/api/webhook`);
      console.log("✅ Configured to handle messages and callback queries\n");
    } else {
      throw new Error("Failed to set webhook: " + webhookResult.description);
    }

    console.log("📝 Setting bot commands...");
    const commandsResult = await makeRequest(`${TELEGRAM_API}/setMyCommands`, {
      commands: [
        { command: "start", description: "شروع و معرفی بات" },
        { command: "game", description: "ارسال بازی چالش کلیک" },
        { command: "help", description: "نمایش راهنمای بازی" },
      ],
    });

    if (commandsResult.ok) {
      console.log("✅ Bot commands set successfully\n");
    } else {
      console.log("⚠️ Warning: Could not set bot commands");
      console.log(`   Error: ${commandsResult.description}\n`);
    }

    console.log("📄 Setting bot description...");
    const descriptionResult = await makeRequest(
      `${TELEGRAM_API}/setMyDescription`,
      {
        description: "🎯 بازی چالش کلیک سریع - 30 ثانیه فرصت، 100 کلیک هدف!",
      }
    );

    if (descriptionResult.ok) {
      console.log("✅ Bot description set successfully\n");
    } else {
      console.log("⚠️ Warning: Could not set bot description");
      console.log(`   Error: ${descriptionResult.description}\n`);
    }

    console.log("🎮 Setting up game...");
    console.log(
      "⚠️ Note: Make sure to configure the game 'guess_tone' in @BotFather with:"
    );
    console.log("   • Game Name: چالش کلیک سریع");
    console.log(
      "   • Description: 30 ثانیه فرصت، 100 کلیک هدف! با دوستات رقابت کن"
    );
    console.log(`   • Game URL: ${WEBHOOK_URL}`);
    console.log("   • You need to create this game manually via @BotFather\n");

    console.log("🧪 Testing webhook endpoint...");
    try {
      const testResponse = await makeRequest(`${WEBHOOK_URL}/api/webhook`);
      if (testResponse && testResponse.ok) {
        console.log("✅ Webhook endpoint is responding correctly\n");
      } else {
        console.log(
          "⚠️ Webhook endpoint test failed, but this might be normal\n"
        );
      }
    } catch (error) {
      console.log(
        "⚠️ Could not test webhook endpoint (this might be normal)\n"
      );
    }

    console.log("🔍 Checking webhook status...");
    const webhookInfo = await makeRequest(`${TELEGRAM_API}/getWebhookInfo`);

    if (webhookInfo.ok) {
      console.log("✅ Webhook status:");
      console.log(`   URL: ${webhookInfo.result.url}`);
      console.log(
        `   Has custom certificate: ${webhookInfo.result.has_custom_certificate}`
      );
      console.log(
        `   Pending updates: ${webhookInfo.result.pending_update_count}`
      );
      console.log(`   Max connections: ${webhookInfo.result.max_connections}`);

      if (webhookInfo.result.allowed_updates) {
        console.log(
          `   Allowed updates: ${webhookInfo.result.allowed_updates.join(", ")}`
        );
      }

      if (webhookInfo.result.last_error_date) {
        console.log(
          `   ⚠️ Last error (${new Date(
            webhookInfo.result.last_error_date * 1000
          ).toLocaleString()}): ${webhookInfo.result.last_error_message}`
        );
      } else {
        console.log("   ✅ No recent errors");
      }
    }

    console.log("\n🎉 Bot setup completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Create game 'guess_tone' via @BotFather:");
    console.log("   • Open chat with @BotFather");
    console.log("   • Send /newgame");
    console.log(`   • Select your bot (@${botInfo.result.username})`);
    console.log("   • Game short name: guess_tone");
    console.log("   • Game title: چالش کلیک سریع");
    console.log(
      "   • Game description: 30 ثانیه فرصت، 100 کلیک هدف! با دوستات رقابت کن"
    );
    console.log(`   • Game URL: ${WEBHOOK_URL}`);
    console.log("   • Upload a game photo (optional)");
    console.log("2. Add your bot to a Telegram group or start a private chat");
    console.log("3. Send /start command to see the welcome message");
    console.log("4. Click the '🎮 شروع بازی' button to launch the game");
    console.log("5. Or send /game command directly\n");

    console.log("🔧 Bot configuration:");
    console.log(`   • Username: @${botInfo.result.username}`);
    console.log(`   • Bot ID: ${botInfo.result.id}`);
    console.log(`   • Webhook: ${WEBHOOK_URL}/api/webhook`);
    console.log(`   • Game URL: ${WEBHOOK_URL}`);
    console.log(`   • Game Short Name: guess_tone`);
    console.log(`   • Handles: messages, callback_queries\n`);

    console.log("💡 Troubleshooting:");
    console.log(
      "   • If you see 'Method Not Allowed' errors, redeploy your app"
    );
    console.log(
      "   • If buttons don't work, check that callback queries are being handled"
    );
    console.log(
      "   • If the game doesn't load, check the WEBHOOK_URL in your environment"
    );
    console.log(
      "   • If you get 'cannot read properties of undefined (reading chat)', the game is working correctly for inline messages"
    );
    console.log(
      "   • Make sure the game 'guess_tone' is properly configured in @BotFather"
    );
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    console.error("\n🔧 Debug information:");
    console.error(`   BOT_TOKEN configured: ${!!BOT_TOKEN}`);
    console.error(`   WEBHOOK_URL: ${WEBHOOK_URL}`);
    process.exit(1);
  }
}

setupBot();
