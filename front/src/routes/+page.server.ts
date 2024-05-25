export async function load() {
	return (await fetch('http://localhost:3000').then((res) => res.json() as Promise<Data>)) as Data;
}

export const actions = {
	prepareDb: async () => {
		await fetch('http://localhost:3000/prepare-db');
	},

	generateGroups: async () => {
		await fetch('http://localhost:3000/generate-groups');
	},

	fillPreregistered: async () => {
		await fetch('http://localhost:3000/fill-preregistered');
	}
};

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
