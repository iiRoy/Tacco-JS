const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split("\n");
const totalEntryCount = parseInt(inputLines.shift(), 10);

const aggregatedData = {};

for (let loopIndex = 0; loopIndex < totalEntryCount; loopIndex++) {
   const currentEntryParts = inputLines[loopIndex].split(" ");
   const currentKey = currentEntryParts[0];
   const numericValue = parseInt(currentEntryParts[1], 10);
   aggregatedData[currentKey] = (aggregatedData[currentKey] || 0) + numericValue;
}

let processedKeys = Object.keys(aggregatedData);

function compareStringsByLength(strA, strB) {
  const lenA = strA.length;
  const lenB = strB.length;
  if (lenA > lenB) {
    return 1;
  }
  if (lenA < lenB) {
    return -1;
  }
  return 0;
}

processedKeys.sort();
processedKeys.sort(compareStringsByLength);

for (let loopIndex = 0; loopIndex < processedKeys.length; loopIndex++) {
  const keyToOutput = processedKeys[loopIndex];
  console.log(keyToOutput + " " + aggregatedData[keyToOutput]);
}
