import {
  GameStartResponse,
  GameActionResponse,
  LeaderboardResponse,
  PlayerLeaderboard,
  StartGameRequest,
  GameActionRequest,
} from "../types/api";
import { Game, GameSession } from "../types/game";

interface GameListResponse {
  success: boolean;
  games: Game[];
  error?: string;
}

export const fetchGames = async (userId?: number): Promise<Game[]> => {
  const url = userId ? `/api/games?userId=${userId}` : "/api/games";
  const response = await fetch(url);
  const data: GameListResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch games");
  }

  return data.games || [];
};

const apiCall = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "API call failed");
  }

  return data;
};

export const fetchGameData = async (gameId: string): Promise<Game> => {
  const response = await fetch(`/api/games/${gameId}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Game not found");
  }

  return data.game;
};

export const fetchUserSession = async (
  gameId: string,
  userId: number
): Promise<GameSession | null> => {
  const response = await fetch(`/api/games/${gameId}/session?userId=${userId}`);
  const data = await response.json();

  if (!response.ok || !data.success) {
    return null;
  }

  return data.session;
};

export const startGame = async (
  request: StartGameRequest
): Promise<{ game: Game; session: GameSession }> => {
  const data = await apiCall<GameStartResponse>("/api/games", {
    method: "POST",
    body: JSON.stringify(request),
  });

  return {
    game: data.game,
    session: data.session,
  };
};

export const guessLetter = async (
  gameId: string,
  userId: number,
  letter: string
): Promise<{ session: GameSession; isCorrect?: boolean }> => {
  const request: GameActionRequest = {
    action: "guess_letter",
    letter,
  };

  const data = await apiCall<GameActionResponse>(
    `/api/games/${gameId}/session/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    }
  );

  return {
    session: data.session,
    isCorrect: data.isCorrect,
  };
};

export const getTextHint = async (
  gameId: string,
  userId: number
): Promise<{ session: GameSession; textHint: string }> => {
  const request: GameActionRequest = {
    action: "use_text_hint",
  };

  const data = await apiCall<GameActionResponse>(
    `/api/games/${gameId}/session/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    }
  );

  return {
    session: data.session,
    textHint: data.textHint || "",
  };
};

export const getImageHint = async (
  gameId: string,
  userId: number
): Promise<{ session: GameSession; imageUrl: string }> => {
  const request: GameActionRequest = {
    action: "use_image_hint",
  };

  const data = await apiCall<GameActionResponse>(
    `/api/games/${gameId}/session/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    }
  );

  return {
    session: data.session,
    imageUrl: data.imageUrl || "",
  };
};

export const fetchGameLeaderboard = async (
  gameId: string
): Promise<PlayerLeaderboard[]> => {
  const data = await apiCall<LeaderboardResponse>(
    `/api/games/${gameId}/leaderboard`
  );
  return data.leaderboard || [];
};
