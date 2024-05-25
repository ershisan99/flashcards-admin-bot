import { promises as fsp } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');
const dataDir = path.join(rootDir, 'data');
const dataFilePath = path.join(dataDir, 'data.json');

const initialData: Data = {
  rawData: {},
  groups: [],
};

async function readData(): Promise<Data> {
  try {
    const data = await fsp.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await writeData(initialData);
        return initialData;
      } catch (error) {
        throw error;
      }
    } else {
      throw error;
    }
  }
}

async function writeData(data: Data): Promise<void> {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fsp.writeFile(dataFilePath, jsonData, 'utf-8');
  } catch (error) {
    throw error;
  }
}

export { readData, writeData, initialData };
