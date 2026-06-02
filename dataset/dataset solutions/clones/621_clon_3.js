var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

function processInputData(inputLines, numberOfEntries) {
  const aggregatedDataMap = new Map();

  for (let currentEntryIndex = 0; currentEntryIndex < numberOfEntries; currentEntryIndex++) {
    const entryLine = inputLines[currentEntryIndex];
    const lineSegments = entryLine.split(" ");
    const dataIdentifier = lineSegments[0];
    const numericValue = parseInt(lineSegments[1], 10);

    const currentSum = aggregatedDataMap.get(dataIdentifier) || 0;
    aggregatedDataMap.set(dataIdentifier, currentSum + numericValue);
  }
  return aggregatedDataMap;
}

function compareKeysForOutput(firstKey, secondKey) {
  const lengthDifference = firstKey.length - secondKey.length;
  if (lengthDifference !== 0) {
    return lengthDifference;
  }
  return firstKey.localeCompare(secondKey);
}

var contentLines = fileContent.trim().split("\n");
var totalEntries = parseInt(contentLines.shift(), 10);

var processedResults = processInputData(contentLines, totalEntries);

var finalSortedKeys = Array.from(processedResults.keys());

finalSortedKeys.sort(compareKeysForOutput);

for (let outputIndex = 0; outputIndex < finalSortedKeys.length; outputIndex++) {
  const currentKeyToPrint = finalSortedKeys[outputIndex];
  const valueAssociated = processedResults.get(currentKeyToPrint);
  console.log(`${currentKeyToPrint} ${valueAssociated}`);
}
