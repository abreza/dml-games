import { NextRequest, NextResponse } from "next/server";
import { Game, GameSession, PERSIAN_LETTERS } from "@/types/game";
import { getRedisClient } from "@/lib/redis";

export async function PUT(request: NextRequest, { params }: any) {
  try {
    const redis = await getRedisClient();
    const { gameId, sessionId } = params;
    const body = await request.json();
    const { action, letter } = body;

    const gameData = await redis.get(`game:${gameId}`);
    if (!gameData) {
      return NextResponse.json({ error: "بازی یافت نشد" }, { status: 404 });
    }

    const game: Game = JSON.parse(gameData);
    const now = new Date();
    const startTime = new Date(game.startTime);
    const endTime = new Date(game.endTime);

    if (now < startTime) {
      return NextResponse.json(
        { error: "بازی هنوز شروع نشده است" },
        { status: 400 }
      );
    }

    if (now > endTime) {
      return NextResponse.json(
        { error: "بازی به پایان رسیده است" },
        { status: 400 }
      );
    }

    let sessionData = null;
    let userId = null;

    const sessionKeys = await redis.keys(`session:${gameId}:*`);
    for (const key of sessionKeys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.id === sessionId) {
          sessionData = data;
          userId = session.userId;
          break;
        }
      }
    }

    if (!sessionData) {
      return NextResponse.json(
        { error: "جلسه بازی یافت نشد" },
        { status: 404 }
      );
    }

    const session: GameSession = JSON.parse(sessionData);

    if (session.isCompleted) {
      return NextResponse.json(
        { error: "این جلسه بازی قبلاً تمام شده است" },
        { status: 400 }
      );
    }

    const updatedSession = { ...session };
    const responseData: any = { success: true };

    if (action === "guess_letter") {
      if (!letter || !PERSIAN_LETTERS.includes(letter)) {
        return NextResponse.json({ error: "حرف نامعتبر" }, { status: 400 });
      }

      const normalizedLetter = letter.replace(/ي/g, "ی").replace(/ك/g, "ک");

      const normalizeText = (text: string) => {
        return text
          .trim()
          .replace(/\s+/g, " ")
          .replace(/ي/g, "ی")
          .replace(/ك/g, "ک");
      };

      const songName = normalizeText(game.songName);
      const singerName = normalizeText(game.singerName);

      const songIndices = [];
      const singerIndices = [];

      for (let i = 0; i < songName.length; i++) {
        if (songName[i] === normalizedLetter && songName[i] !== " ") {
          songIndices.push(i);
        }
      }

      for (let i = 0; i < singerName.length; i++) {
        if (singerName[i] === normalizedLetter && singerName[i] !== " ") {
          singerIndices.push(i);
        }
      }

      let isCorrectGuess = false;

      if (songIndices.length > 0) {
        songIndices.forEach((index) => {
          if (!updatedSession.guessedSongLetters[index]) {
            updatedSession.guessedSongLetters[index] = true;
            isCorrectGuess = true;
          }
        });
      }

      if (singerIndices.length > 0) {
        singerIndices.forEach((index) => {
          if (!updatedSession.guessedSingerLetters[index]) {
            updatedSession.guessedSingerLetters[index] = true;
            isCorrectGuess = true;
          }
        });
      }

      if (songIndices.length === 0 && singerIndices.length === 0) {
        if (!updatedSession.wrongLetters.includes(normalizedLetter)) {
          updatedSession.wrongLetters.push(normalizedLetter);
          updatedSession.score = Math.max(0, updatedSession.score - 20);
        }
      } else {
        updatedSession.score +=
          10 * (songIndices.length + singerIndices.length);
      }

      const songCompletionCheck = songName.split("").every((char, index) => {
        return char === " " || updatedSession.guessedSongLetters[index];
      });

      if (songCompletionCheck && !updatedSession.isSongGuessed) {
        updatedSession.isSongGuessed = true;
        updatedSession.score += 100;
      }

      const singerCompletionCheck = singerName
        .split("")
        .every((char, index) => {
          return char === " " || updatedSession.guessedSingerLetters[index];
        });

      if (singerCompletionCheck && !updatedSession.isSingerGuessed) {
        updatedSession.isSingerGuessed = true;
        updatedSession.score += 100;
      }

      if (updatedSession.isSongGuessed && updatedSession.isSingerGuessed) {
        updatedSession.isCompleted = true;
        updatedSession.completedAt = new Date();

        const timeRemaining = Math.max(
          0,
          Math.floor((endTime.getTime() - now.getTime()) / 1000)
        );
        updatedSession.score += timeRemaining;
      }

      responseData.isCorrect = isCorrectGuess;
    } else if (action === "use_text_hint") {
      if (!game.textHint) {
        return NextResponse.json(
          { error: "راهنمایی متنی موجود نیست" },
          { status: 400 }
        );
      }

      if (updatedSession.usedTextHint) {
        return NextResponse.json(
          { error: "راهنمایی متنی قبلاً استفاده شده" },
          { status: 400 }
        );
      }

      updatedSession.usedTextHint = true;
      updatedSession.score = Math.max(0, updatedSession.score - 30);
      responseData.textHint = game.textHint;
    } else if (action === "use_image_hint") {
      if (!game.imageUrl) {
        return NextResponse.json(
          { error: "راهنمایی تصویری موجود نیست" },
          { status: 400 }
        );
      }

      if (updatedSession.usedImageHint) {
        return NextResponse.json(
          { error: "راهنمایی تصویری قبلاً استفاده شده" },
          { status: 400 }
        );
      }

      updatedSession.usedImageHint = true;
      updatedSession.score = Math.max(0, updatedSession.score - 100);
      responseData.imageUrl = game.imageUrl;
    } else {
      return NextResponse.json({ error: "عملیات نامعتبر" }, { status: 400 });
    }

    await redis.set(
      `session:${gameId}:${userId}`,
      JSON.stringify(updatedSession)
    );

    responseData.session = updatedSession;

    console.log(
      `Session updated for user ${userId} in game ${gameId}: action=${action}, score=${updatedSession.score}, completed=${updatedSession.isCompleted}`
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی جلسه" },
      { status: 500 }
    );
  }
}
