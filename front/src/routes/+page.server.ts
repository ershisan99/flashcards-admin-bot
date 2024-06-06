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
	},

	sendGroupInfo: async () => {
		await fetch('http://localhost:3000/send-group-info');
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
	users: User[];
	groups: Group[];
};

export type User = {
	availableFrom: number;
	availableTo: number;
	chatId: string;
	groupId?: any;
	id: number;
	name: string;
	tgUsername: string;
};

export type Group = {
	id: number;
	users: User[];
};
