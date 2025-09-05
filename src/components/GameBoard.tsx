import React, { useState } from "react";
import { Eye, FileText, Clock, Trophy } from "lucide-react";
import { Game, GameSession, PERSIAN_LETTERS } from "../types/game";

interface GameBoardProps {
  game: Game;
  session: GameSession;
  timeLeft: number;
  onGuessLetter: (letter: string) => void;
  onUseTextHint: () => void;
  onUseImageHint: () => void;
  isLoading: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  game,
  session,
  timeLeft,
  onGuessLetter,
  onUseTextHint,
  onUseImageHint,
  isLoading,
}) => {
  const normalizeText = (text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک");
  };

  const renderWord = (
    word: string,
    guessedLetters: boolean[],
    isGuessed: boolean
  ) => {
    const normalizedWord = normalizeText(word);

    return (
      <div className="flex flex-wrap justify-center gap-1 mb-4">
        {normalizedWord.split("").map((char, index) => (
          <div
            key={index}
            className={`
              w-10 h-12 border-2 border-gray-300 rounded-md flex items-center justify-center text-lg font-bold
              ${char === " " ? "border-transparent" : ""}
              ${
                guessedLetters[index] || isGuessed
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-white text-gray-400"
              }
            `}
          >
            {char === " "
              ? ""
              : guessedLetters[index] || isGuessed
              ? char
              : "_"}
          </div>
        ))}
      </div>
    );
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleLetterClick = (letter: string) => {
    if (isLoading || session.isCompleted) return;
    onGuessLetter(letter);
  };

  const isLetterUsed = (letter: string): boolean => {
    const normalizedLetter = letter.replace(/ي/g, "ی").replace(/ك/g, "ک");

    // Check if letter was guessed correctly in song
    const songName = normalizeText(game.songName);
    for (let i = 0; i < songName.length; i++) {
      if (songName[i] === normalizedLetter && session.guessedSongLetters[i]) {
        return true;
      }
    }

    // Check if letter was guessed correctly in singer
    const singerName = normalizeText(game.singerName);
    for (let i = 0; i < singerName.length; i++) {
      if (
        singerName[i] === normalizedLetter &&
        session.guessedSingerLetters[i]
      ) {
        return true;
      }
    }

    // Check if letter is in wrong letters
    return session.wrongLetters.includes(normalizedLetter);
  };

  const isLetterCorrect = (letter: string): boolean => {
    const normalizedLetter = letter.replace(/ي/g, "ی").replace(/ك/g, "ک");
    const songName = normalizeText(game.songName);
    const singerName = normalizeText(game.singerName);

    return (
      songName.includes(normalizedLetter) ||
      singerName.includes(normalizedLetter)
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-sm text-telegram-hint">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span>امتیاز: {session.score}</span>
          </div>
        </div>
      </div>

      {session.isCompleted && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-green-800 dark:text-green-200 font-bold">
            تبریک! بازی تمام شد
          </div>
          <div className="text-green-600 dark:text-green-300 text-sm mt-1">
            امتیاز نهایی: {session.score}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-telegram-text mb-2">
            نام آهنگ
          </h3>
          {renderWord(
            game.songName,
            session.guessedSongLetters,
            session.isSongGuessed
          )}
          {session.isSongGuessed && (
            <div className="text-green-600 text-sm">✅ درست!</div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-telegram-text mb-2">
            نام خواننده
          </h3>
          {renderWord(
            game.singerName,
            session.guessedSingerLetters,
            session.isSingerGuessed
          )}
          {session.isSingerGuessed && (
            <div className="text-green-600 text-sm">✅ درست!</div>
          )}
        </div>
      </div>

      {session.wrongLetters.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
          <div className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
            حروف اشتباه ({session.wrongLetters.length} × -20 = -
            {session.wrongLetters.length * 20})
          </div>
          <div className="flex flex-wrap gap-1">
            {session.wrongLetters.map((letter, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded text-sm"
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      )}

      {(game.textHint || game.imageUrl) && !session.isCompleted && (
        <div className="grid grid-cols-2 gap-2">
          {game.textHint && (
            <button
              onClick={onUseTextHint}
              disabled={session.usedTextHint || isLoading}
              className={`
                p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm
                ${
                  session.usedTextHint
                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                }
              `}
            >
              <FileText className="w-4 h-4" />
              {session.usedTextHint
                ? "استفاده شده (-30)"
                : "راهنمایی متنی (-30)"}
            </button>
          )}

          {game.imageUrl && (
            <button
              onClick={onUseImageHint}
              disabled={session.usedImageHint || isLoading}
              className={`
                p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm
                ${
                  session.usedImageHint
                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100"
                }
              `}
            >
              <Eye className="w-4 h-4" />
              {session.usedImageHint
                ? "استفاده شده (-100)"
                : "راهنمایی تصویری (-100)"}
            </button>
          )}
        </div>
      )}

      {!session.isCompleted && (
        <div className="space-y-3">
          <h3 className="text-center font-medium text-telegram-text">
            حروف فارسی
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {PERSIAN_LETTERS.map((letter) => {
              const isUsed = isLetterUsed(letter);
              const isCorrect = isLetterCorrect(letter);

              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={isUsed || isLoading || session.isCompleted}
                  className={`
                    aspect-square rounded-lg border-2 font-bold text-lg transition-all
                    ${
                      isUsed
                        ? isCorrect &&
                          !session.wrongLetters.includes(
                            letter.replace(/ي/g, "ی").replace(/ك/g, "ک")
                          )
                          ? "bg-green-100 border-green-300 text-green-800"
                          : "bg-red-100 border-red-300 text-red-800"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 active:scale-95"
                    }
                    ${
                      isLoading || session.isCompleted
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-sm text-center text-telegram-hint">پیشرفت</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs text-telegram-hint mb-1">آهنگ</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    session.isSongGuessed
                      ? 100
                      : (session.guessedSongLetters.filter(Boolean).length /
                          session.guessedSongLetters.length) *
                        100
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-telegram-hint mb-1">خواننده</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    session.isSingerGuessed
                      ? 100
                      : (session.guessedSingerLetters.filter(Boolean).length /
                          session.guessedSingerLetters.length) *
                        100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
