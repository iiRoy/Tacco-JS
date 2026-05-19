const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.split('\n');

const parseNumericLine = (lineString) => {
  return lineString.split(' ').map(Number);
};

const firstLineData = parseNumericLine(inputLines[0]);
const totalSunuke = firstLineData[0];
const numberOfGroups = firstLineData[1];

const initialTreatCount = 0;
const treatRecipientCounts = Array.from({ length: totalSunuke }, () => initialTreatCount);

const groupDataOffset = 2;

for (let groupIteration = 0; groupIteration < numberOfGroups; groupIteration++) {
  const currentGroupLineIndex = groupIteration * groupDataOffset + groupDataOffset;
  const groupTreatsLine = inputLines[currentGroupLineIndex];
  const recipientsInCurrentGroup = parseNumericLine(groupTreatsLine);

  recipientsInCurrentGroup.forEach((recipientId) => {
    const zeroBasedIndex = recipientId - 1;
    if (zeroBasedIndex >= 0 && zeroBasedIndex < totalSunuke) { // Added a check for robustness, though not strictly needed for problem constraints
      treatRecipientCounts[zeroBasedIndex]++;
    }
  });
}

const calculateUntreatedSunuke = (countsArray, targetCount) => {
  let untreatedCount = 0;
  for (const countValue of countsArray) {
    if (countValue === targetCount) {
      untreatedCount++;
    }
  }
  return untreatedCount;
};

const finalUntreatedCount = calculateUntreatedSunuke(treatRecipientCounts, initialTreatCount);
console.log(finalUntreatedCount);
