import {
  GameListResponse,
  GameStartResponse,
  GameActionResponse,
  LeaderboardResponse,
  PlayerLeaderboard,
  StartGameRequest,
  GameActionRequest,
} from "../types/api";
import { Game, GameSession } from "../types/game";

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

export const fetchActiveGames = async (): Promise<Game[]> => {
  const data = await apiCall<GameListResponse>("/api/games");
  return data.games || [];
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
  sessionId: string,
  letter: string
): Promise<{ session: GameSession; isCorrect?: boolean }> => {
  const request: GameActionRequest = {
    action: "guess_letter",
    letter,
  };

  const data = await apiCall<GameActionResponse>(
    `/api/games/${gameId}/session/${sessionId}`,
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
  sessionId: string
): Promise<{ session: GameSession; textHint: string }> => {
  const request: GameActionRequest = {
    action: "use_text_hint",
  };

  const data = await apiCall<GameActionResponse>(
    `/api/games/${gameId}/session/${sessionId}`,
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
  sessionId: string
): Promise<{ session: GameSession; imageUrl: string }> => {
  const request: GameActionRequest = {
    action: "use_image_hint",
  };

  const data = await apiCall<GameActionResponse>(
    `/api/games/${gameId}/session/${sessionId}`,
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
