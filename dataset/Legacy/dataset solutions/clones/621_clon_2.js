var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = (rawData.trim()).split("\n");

var entryCount = lineSegments.shift();

var dataMap = {};

for (var idx = 0; idx < entryCount; idx++) {
  var currentEntryParts = lineSegments[idx].split(" ");
  var keyIdentifier = currentEntryParts[0];

  if (!dataMap.hasOwnProperty(keyIdentifier)) {
    dataMap[keyIdentifier] = 0;
  }

  dataMap[keyIdentifier] += currentEntryParts[1] - 0;
}

var sortedKeys = [];
for (var mapProp in dataMap) {
  sortedKeys.push(mapProp);
}

function compareLengths(firstStr, secondStr) {
  if (firstStr.length > secondStr.length) {
    return 1;
  }
  if (firstStr.length < secondStr.length) {
    return -1;
  }
  return 0;
}

sortedKeys.sort();
sortedKeys.sort(compareLengths);

for (var outputIndex = 0; outputIndex < sortedKeys.length; outputIndex++) {
  var currentKey = sortedKeys[outputIndex];
  console.log(currentKey + " " + dataMap[currentKey]);
}
