import { Game } from "../types/game";

export interface GameForm extends Omit<Game, "id" | "createdAt" | "updatedAt"> {
  id?: string;
}

export const adminApi = {
  async fetchGames(): Promise<{ games: Game[] }> {
    const response = await fetch("/api/admin/games");
    if (!response.ok) {
      throw new Error("Failed to fetch games");
    }
    return response.json();
  },

  async createGame(gameData: GameForm): Promise<Game> {
    const response = await fetch("/api/admin/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create game");
    }

    return response.json();
  },

  async updateGame(gameId: string, gameData: GameForm): Promise<Game> {
    const response = await fetch(`/api/admin/games/${gameId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update game");
    }

    return response.json();
  },

  async deleteGame(gameId: string): Promise<void> {
    const response = await fetch(`/api/admin/games/${gameId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete game");
    }
  },

  async fetchLeaderboard(gameId: string): Promise<{ leaderboard: any[] }> {
    const response = await fetch(`/api/games/${gameId}/leaderboard`);
    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard");
    }
    return response.json();
  },
};
