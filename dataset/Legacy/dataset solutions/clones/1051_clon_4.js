const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const parsedLines = rawData.trim().split('\n');
const elementCount = Number(parsedLines[0]);
const valueSet = parsedLines[1].trim().split(' ').map(Number);
const queryCount = Number(parsedLines[2]);
const targetSums = parsedLines[3].trim().split(' ').map(Number);

const maxTargetSum = Math.max(...targetSums);

const dpTable = Array(elementCount + 1).fill(null).map(() => Array(maxTargetSum + 1).fill(false));

for (let rowIdx = 0; rowIdx <= elementCount; rowIdx++) {
  dpTable[rowIdx][0] = true;
}

for (let currentElementIdx = 1; currentElementIdx <= elementCount; currentElementIdx++) {
  const currentVal = valueSet[currentElementIdx - 1];
  for (let currentSum = 1; currentSum <= maxTargetSum; currentSum++) {
    let withoutCurrent = dpTable[currentElementIdx - 1][currentSum];

    let withCurrent = false;
    if (currentSum >= currentVal) {
      withCurrent = dpTable[currentElementIdx - 1][currentSum - currentVal];
    }

    dpTable[currentElementIdx][currentSum] = withoutCurrent || withCurrent;
  }
}

for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
  const currentQuerySum = targetSums[queryIdx];
  console.log(dpTable[elementCount][currentQuerySum] ? 'yes' : 'no');
}
