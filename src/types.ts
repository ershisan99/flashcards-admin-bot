export type UserData = {
  name: string;
  availableTime: { from: number; to: number | null };
  tgUsername: string;
  userId: string;
  chatId: string;
};

export type Data = {
  rawData: Record<string, UserData>;
  groups: UserData[][];
};
