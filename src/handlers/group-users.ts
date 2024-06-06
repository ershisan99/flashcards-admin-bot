import { User } from '../db.js';

export function groupByTime(users: User[]): User[][] {
  // First, sort all users by their available time from low to high
  users.sort((a, b) => a.availableFrom - b.availableFrom);

  const groups: User[][] = [];
  let currentGroup: User[] = [];

  if (users.length % 3 === 1) {
    const lastGroup = [users.at(-1), users.at(-2)];
    groups.push(lastGroup);
    users = users.slice(0, -2);
  }

  users.forEach((user) => {
    currentGroup.push(user);

    // If the current group reaches 3 members, start a new group
    if (currentGroup.length === 3) {
      groups.push(currentGroup);
      currentGroup = []; // Reset for next group
    }
  });

  // Add the last group if it has less than 3 members and is not empty
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}
