import { UserData } from '../types.js';

export function groupByTime(users: Record<string, UserData>): UserData[][] {
  const allUsers = Object.values(users);

  // First, sort all users by their available time from low to high
  allUsers.sort((a, b) => a.availableTime.from - b.availableTime.from);

  const groups: UserData[][] = [];
  let currentGroup: UserData[] = [];

  allUsers.forEach((user) => {
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
