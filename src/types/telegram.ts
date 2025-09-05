export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  ready: () => void;
  expand: () => void;
  close: () => void;
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
  };
  colorScheme: "light" | "dark";
}

export interface GameParams {
  user_id?: string;
  chat_id?: string;
  message_id?: string;
  query_id?: string;
  inline_message_id?: string;
  chat_instance?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
