import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      title?: string;
      type: string;
    };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number;
        title?: string;
        type: string;
      };
    };
    inline_message_id?: string;
    chat_instance: string;
    data?: string;
    game_short_name?: string;
  };
}

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_markup: replyMarkup,
        parse_mode: "HTML",
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

async function sendGame(chatId: number) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendGame`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        game_short_name: "guess_tone",
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error sending game:", error);
    return null;
  }
}

async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  url?: string
) {
  try {
    const response = await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        url: url,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error answering callback query:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TelegramUpdate = await request.json();
    console.log("Received webhook:", JSON.stringify(body, null, 2));

    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data;
      const gameShortName = callbackQuery.game_short_name;

      let chatId: number | null = null;

      if (callbackQuery.message?.chat?.id) {
        chatId = callbackQuery.message.chat.id;
        console.log(`Regular callback query from chat ${chatId}`);
      } else if (callbackQuery.inline_message_id) {
        console.log(
          `Inline callback query: ${callbackQuery.inline_message_id}`
        );
      }

      console.log(
        `Callback query received: data="${data}", game_short_name="${gameShortName}", inline_message_id="${callbackQuery.inline_message_id}"`
      );

      if (data === "start_game" && chatId) {
        await sendGame(chatId);
        await answerCallbackQuery(callbackQuery.id, "بازی ارسال شد! 🎮");
      } else if (gameShortName) {
        console.log(`Game launch requested: ${gameShortName}`);

        let gameUrl = `${WEBHOOK_URL}?user_id=${callbackQuery.from.id}&query_id=${callbackQuery.id}`;

        if (chatId) {
          gameUrl += `&chat_id=${chatId}`;
        }

        if (callbackQuery.inline_message_id) {
          gameUrl += `&inline_message_id=${encodeURIComponent(
            callbackQuery.inline_message_id
          )}`;
        }

        if (callbackQuery.chat_instance) {
          gameUrl += `&chat_instance=${encodeURIComponent(
            callbackQuery.chat_instance
          )}`;
        }

        await answerCallbackQuery(callbackQuery.id, undefined, gameUrl);
        console.log(`Game URL sent: ${gameUrl}`);
      } else {
        await answerCallbackQuery(callbackQuery.id);
      }

      return NextResponse.json({ ok: true });
    }

    if (body.message) {
      const { message } = body;
      const chatId = message.chat.id;
      const text = message.text || "";

      console.log(`Message received: "${text}" from chat ${chatId}`);

      if (text.startsWith("/start")) {
        const welcomeText = `🎯 سلام! به بازی چالش کلیک سریع خوش اومدی!

🎮 این بازی چطور کار می‌کنه:
• 30 ثانیه زمان داری
• باید 100 بار کلیک کنی
• اگر زودتر تموم کنی، زمان باقیمونده امتیاز توه!

👥 این بازی در گروه‌ها بهتر کار می‌کنه. منو به یه گروه اضافه کن و با دوستات رقابت کن!

برای شروع بازی از دکمه زیر استفاده کن:`;

        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "🎮 شروع بازی",
                callback_data: "start_game",
              },
            ],
          ],
        };

        await sendMessage(chatId, welcomeText, keyboard);
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith("/game")) {
        await sendGame(chatId);
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith("/help")) {
        const helpText = `🆘 راهنمای بازی چالش کلیک سریع:

🎯 هدف بازی:
در 30 ثانیه باید 100 بار روی دکمه کلیک کنی

🏆 نحوه امتیازدهی:
اگر زودتر از 30 ثانیه به 100 کلیک برسی، زمان باقیمونده (به ثانیه) امتیاز توه

📊 رتبه‌بندی:
در گروه‌ها می‌تونی رتبه‌ات رو با بقیه مقایسه کنی

🎮 دستورات:
/start - شروع و معرفی بات
/game - ارسال بازی
/help - نمایش این راهنما`;

        await sendMessage(chatId, helpText);
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Telegram webhook is active",
    timestamp: new Date().toISOString(),
    bot_token_configured: !!BOT_TOKEN,
    webhook_url_configured: !!WEBHOOK_URL,
  });
}
