import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface ScoreSubmission {
  userId: number;
  userName: string;
  chatId?: number;
  messageId?: number;
  inlineMessageId?: string;
  score: number;
  clicks: number;
}

async function setTelegramGameScore(
  userId: number,
  score: number,
  chatId?: number,
  messageId?: number,
  inlineMessageId?: string
) {
  try {
    const body: any = {
      user_id: userId,
      score: score,
      force: false,
    };

    if (inlineMessageId) {
      body.inline_message_id = inlineMessageId;
    } else if (chatId && messageId) {
      body.chat_id = chatId;
      body.message_id = messageId;
    } else {
      throw new Error("Either inlineMessageId or chatId+messageId is required");
    }

    const response = await fetch(`${TELEGRAM_API}/setGameScore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Failed to set game score:", result);
      throw new Error(result.description || "Failed to set game score");
    }

    return result.result;
  } catch (error) {
    console.error("Error setting Telegram game score:", error);
    throw error;
  }
}

async function getTelegramGameScores(
  userId: number,
  chatId?: number,
  messageId?: number,
  inlineMessageId?: string
) {
  try {
    const body: any = {
      user_id: userId,
    };

    if (inlineMessageId) {
      body.inline_message_id = inlineMessageId;
    } else if (chatId && messageId) {
      body.chat_id = chatId;
      body.message_id = messageId;
    } else {
      throw new Error("Either inlineMessageId or chatId+messageId is required");
    }

    const response = await fetch(`${TELEGRAM_API}/getGameHighScores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Failed to get game scores:", result);
      return [];
    }

    return result.result || [];
  } catch (error) {
    console.error("Error getting Telegram game scores:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: "Bot token not configured" },
        { status: 500 }
      );
    }

    const body: ScoreSubmission = await request.json();
    const { userId, userName, chatId, messageId, inlineMessageId, score } =
      body;

    if (!userId || !userName || score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: userId, userName, score" },
        { status: 400 }
      );
    }

    if (!inlineMessageId && (!chatId || !messageId)) {
      return NextResponse.json(
        {
          error:
            "Either inlineMessageId or both chatId and messageId are required",
        },
        { status: 400 }
      );
    }

    console.log(
      `Setting game score: User ${userName} (${userId}) - Score: ${score}`
    );

    await setTelegramGameScore(
      userId,
      score,
      chatId,
      messageId,
      inlineMessageId
    );

    const highScores = await getTelegramGameScores(
      userId,
      chatId,
      messageId,
      inlineMessageId
    );

    const formattedScores = highScores.map((scoreData: any) => ({
      userId: scoreData.user.id,
      userName: `${scoreData.user.first_name}${
        scoreData.user.last_name ? ` ${scoreData.user.last_name}` : ""
      }`,
      score: scoreData.score,
      position: scoreData.position,
    }));

    formattedScores.sort((a: any, b: any) => b.score - a.score);

    console.log(
      `Score saved successfully. Updated leaderboard has ${formattedScores.length} entries`
    );

    return NextResponse.json({
      success: true,
      scores: formattedScores,
      message: "Score saved successfully",
    });
  } catch (error) {
    console.error("Error handling score submission:", error);
    return NextResponse.json(
      {
        error: "Failed to save score",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: "Bot token not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");
    const messageId = searchParams.get("messageId");
    const inlineMessageId = searchParams.get("inlineMessageId");
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    if (!inlineMessageId && (!chatId || !messageId)) {
      return NextResponse.json(
        {
          error:
            "Either inlineMessageId or both chatId and messageId are required",
        },
        { status: 400 }
      );
    }

    console.log(`Getting game scores for user ${userId}`);

    const highScores = await getTelegramGameScores(
      parseInt(userId),
      chatId ? parseInt(chatId) : undefined,
      messageId ? parseInt(messageId) : undefined,
      inlineMessageId || undefined
    );

    const formattedScores = highScores.map((scoreData: any) => ({
      userId: scoreData.user.id,
      userName: `${scoreData.user.first_name}${
        scoreData.user.last_name ? ` ${scoreData.user.last_name}` : ""
      }`,
      score: scoreData.score,
      position: scoreData.position,
    }));

    formattedScores.sort((a: any, b: any) => b.score - a.score);

    return NextResponse.json({
      success: true,
      scores: formattedScores,
    });
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch scores",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
