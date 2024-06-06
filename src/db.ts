import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');
const dataDir = path.join(rootDir, 'data');
const dbPath = path.join(dataDir, 'database.db');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    availableFrom INTEGER,
    availableTo INTEGER,
    tgUsername TEXT,
    chatId TEXT UNIQUE,
    groupId INTEGER,
    FOREIGN KEY (groupId) REFERENCES groups(id)
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT
  );
`);

export interface User {
  id: string;
  name: string;
  availableFrom: number;
  availableTo: number;
  tgUsername: string;
  chatId: string;
  groupId?: number;
}

type CreateUserParams = Omit<User, 'id'>;

export interface Group {
  id: number;
  users: User[];
}

const clearDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // const stmt = db.prepare('DELETE FROM users');
      // stmt.run();
      const stmt2 = db.prepare('DELETE FROM groups');
      stmt2.run();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

const getUsers = async (): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare('SELECT * FROM users');
      const users = stmt.all() as User[];
      resolve(users);
    } catch (error) {
      reject(error);
    }
  });
};

const getGroups = async (): Promise<Group[]> => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare('SELECT * FROM groups');
      const groups = stmt.all() as { id: number }[];

      const groupsWithUsers = groups.map((group) => {
        const usersStmt = db.prepare('SELECT * FROM users WHERE groupId = ?');
        const users = usersStmt.all(group.id) as User[];
        return { id: group.id, users };
      });

      resolve(groupsWithUsers);
    } catch (error) {
      reject(error);
    }
  });
};

const addUser = async (user: CreateUserParams): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO users (name, availableFrom, availableTo, tgUsername, chatId)
        VALUES (@name, @availableFrom, @availableTo, @tgUsername, @chatId)
      `);
      stmt.run(user);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

const modifyUser = async (groupId: number, id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`
        UPDATE users
        SET groupId = @groupId
        WHERE id = @id
      `);
      stmt.run({ groupId, id });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

const addGroup = async (userIds: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const insertGroupStmt = db.prepare('INSERT INTO groups DEFAULT VALUES');
      const result = insertGroupStmt.run();
      const groupId = result.lastInsertRowid as number;

      const updateUserStmt = db.prepare(
        'UPDATE users SET groupId = ? WHERE id = ?',
      );
      const transaction = db.transaction(
        (userIds: string[], groupId: number) => {
          for (const userId of userIds) {
            updateUserStmt.run(groupId, userId);
          }
        },
      );

      transaction(userIds, groupId);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export { getUsers, getGroups, addUser, addGroup, clearDatabase, modifyUser };
export default db;
