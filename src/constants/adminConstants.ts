export const ADMIN_CONFIG = {
  USERNAME: process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin",
  PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123",
  AUTH_DELAY: 500,
  DEFAULT_GAME_DURATION: 60 * 60 * 1000,
} as const;

export const GAME_STATUS = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  ENDED: "ended",
} as const;

export const GAME_STATUS_LABELS = {
  [GAME_STATUS.UPCOMING]: {
    label: "آینده",
    color: "bg-blue-100 text-blue-800",
  },
  [GAME_STATUS.ACTIVE]: {
    label: "فعال",
    color: "bg-green-100 text-green-800",
  },
  [GAME_STATUS.ENDED]: {
    label: "تمام شده",
    color: "bg-gray-100 text-gray-800",
  },
} as const;
