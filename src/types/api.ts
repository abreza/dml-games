import { Game, GameSession } from "./game";

export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface GameListResponse extends ApiResponse {
  games: Game[];
}

export interface GameStartResponse extends ApiResponse {
  game: Game;
  session: GameSession;
}

export interface GameActionResponse extends ApiResponse {
  session: GameSession;
  isCorrect?: boolean;
  textHint?: string;
  imageUrl?: string;
}

export interface LeaderboardResponse extends ApiResponse {
  leaderboard: PlayerLeaderboard[];
}

export interface PlayerLeaderboard {
  userId: number;
  userName: string;
  score: number;
  position?: number;
  isCompleted?: boolean;
  completedAt?: Date;
}

export interface StartGameRequest {
  gameId: string;
  userId: number;
  userName: string;
}

export interface GameActionRequest {
  action: "guess_letter" | "use_text_hint" | "use_image_hint";
  letter?: string;
}
