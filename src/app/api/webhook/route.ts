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

  inline_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    query: string;
    offset: string;
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

async function answerInlineQuery(inlineQueryId: string, results: any[]) {
  try {
    const response = await fetch(`${TELEGRAM_API}/answerInlineQuery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inline_query_id: inlineQueryId,
        results: results,
        cache_time: 10,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error answering inline query:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TelegramUpdate = await request.json();
    console.log("Received webhook:", JSON.stringify(body, null, 2));

    if (body.inline_query) {
      const inlineQuery = body.inline_query;
      const results = [
        {
          type: "game",
          id: "1",
          game_short_name: "guess_tone",
        },
      ];
      await answerInlineQuery(inlineQuery.id, results);
      console.log("Answered inline query with game result.");
      return NextResponse.json({ ok: true });
    }

    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data;
      const gameShortName = callbackQuery.game_short_name;
      const user = callbackQuery.from;

      let chatId: number | null = null;

      if (callbackQuery.message?.chat?.id) {
        chatId = callbackQuery.message.chat.id;
      }

      if (data === "start_game" && chatId) {
        await sendGame(chatId);
        await answerCallbackQuery(callbackQuery.id, "بازی ارسال شد! 🎮");
      } else if (gameShortName) {
        console.log(`Game launch requested: ${gameShortName}`);

        let gameUrl = `${WEBHOOK_URL}?user_id=${user.id}&query_id=${callbackQuery.id}`;
        gameUrl += `&first_name=${encodeURIComponent(user.first_name)}`;
        if (user.last_name) {
          gameUrl += `&last_name=${encodeURIComponent(user.last_name)}`;
        }
        if (user.username) {
          gameUrl += `&username=${encodeURIComponent(user.username)}`;
        }
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
        const welcomeText = `<b>🎵 سلام! به بازی حدس آهنگ خوش اومدی!</b>

🎯 در این بازی، باید نام خواننده و آهنگ رو حدس بزنی.

برای شروع و مشاهده لیست بازی‌های فعال، از دکمه زیر استفاده کن. می‌تونی این بازی رو به گروه‌هات هم اضافه کنی و با دوستات رقابت کنی!`;

        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "🎮 نمایش لیست بازی‌ها",
                web_app: { url: WEBHOOK_URL! },
              },
            ],
            [
              {
                text: "📢 اشتراک‌گذاری بازی",
                switch_inline_query: "",
              },
            ],
          ],
        };

        await sendMessage(chatId, welcomeText, keyboard);
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith("/games")) {
        const gamesText = `برای مشاهده و انتخاب بازی، لطفا روی دکمه زیر کلیک کن.`;
        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "🎮 باز کردن لیست بازی‌ها",
                web_app: { url: WEBHOOK_URL! },
              },
            ],
          ],
        };
        await sendMessage(chatId, gamesText, keyboard);
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith("/help")) {
        const helpText = `<b>🆘 راهنمای بازی حدس آهنگ</b>

<b>🎯 هدف بازی:</b>
حدس زدن کامل نام آهنگ و نام خواننده با انتخاب حروف صحیح.

<b>🏆 نحوه امتیازدهی:</b>
- هر بازی با <b>1000 امتیاز</b> اولیه شروع می‌شود.
- هر حرف اشتباه: <b>-20 امتیاز</b>.
- راهنمایی متنی: <b>-30 امتیاز</b>.
- راهنمایی تصویری: <b>-100 امتیاز</b>.
- حدس کامل نام آهنگ: <b>+100 امتیاز</b>.
- حدس کامل نام خواننده: <b>+100 امتیاز</b>.
- جایزه زمان: اگر بازی را زیر <b>۶۰۰ ثانیه (۱۰ دقیقه)</b> تمام کنید، ثانیه‌های باقی‌مانده به امتیاز شما اضافه می‌شود.

<b>🎮 دستورات:</b>
/start - شروع و معرفی بات
/games - نمایش لیست بازی‌های فعال
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
