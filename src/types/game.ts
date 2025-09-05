export interface Game {
  id: string;
  songName: string;
  singerName: string;
  startTime: Date;
  endTime: Date;
  textHint?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSession {
  id: string;
  gameId: string;
  userId: number;
  userName: string;
  startedAt: Date;
  completedAt?: Date;
  score: number;
  wrongLetters: string[];
  usedTextHint: boolean;
  usedImageHint: boolean;
  guessedSongLetters: boolean[];
  guessedSingerLetters: boolean[];
  isSongGuessed: boolean;
  isSingerGuessed: boolean;
  isCompleted: boolean;
}

export const PERSIAN_LETTERS = [
  "آ",
  "ا",
  "ب",
  "پ",
  "ت",
  "ث",
  "ج",
  "چ",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "ژ",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ک",
  "گ",
  "ل",
  "م",
  "ن",
  "و",
  "ه",
  "ی",
];

export const GameStatus = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  ENDED: "ended",
} as const;

export type GameStatusType = (typeof GameStatus)[keyof typeof GameStatus];
