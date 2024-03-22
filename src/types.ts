export type UserData = {
  name: string;
  availableTime: { from: number; to: number | null };
  tgUsername: string;
  userId: string;
  chatId: string;
};

export type Data = Record<string, UserData>;
