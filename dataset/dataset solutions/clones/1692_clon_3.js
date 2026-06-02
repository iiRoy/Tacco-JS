const fileSystem = require('fs');

const inputFilePath = '/dev/stdin';
const predefinedCategories = ['AC', 'WA', 'TLE', 'RE'];

const rawInputContent = fileSystem.readFileSync(inputFilePath, 'utf8');
const allInputLines = rawInputContent.split(/\n/);

const [firstLinePlaceholder, ...statusEntries] = allInputLines;

const statusTally = new Map();

for (const currentEntry of statusEntries) {
  if (statusTally.has(currentEntry)) {
    statusTally.set(currentEntry, statusTally.get(currentEntry) + 1);
  } else {
    statusTally.set(currentEntry, 1);
  }
}

for (const outputCategory of predefinedCategories) {
  const countForCategory = statusTally.get(outputCategory);
  console.log(`${outputCategory} x ${countForCategory}`);
}
