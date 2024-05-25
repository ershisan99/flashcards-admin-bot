import fs from 'fs';
import { Data, UserData } from './types.js';

generateGroups();

function generateGroups() {
  const data = fs.readFileSync('./data.json', 'utf8');
  const dataObj = JSON.parse(data) as Data;
  const groupedUsers = groupByTime(dataObj.rawData);
  fs.writeFileSync('./groups.json', JSON.stringify(groupedUsers), 'utf8');
  generateJsFile(groupedUsers);
}

function generateJsFile(users: UserData[][]) {
  const template = fs.readFileSync('./index.js.template', 'utf8');
  const usersString = JSON.stringify(users);
  const jsFile = template.replace('/* USERS */', usersString);

  fs.writeFileSync('./index.js', jsFile, 'utf8');
}

function groupByTime(users: Record<string, UserData>): UserData[][] {
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
