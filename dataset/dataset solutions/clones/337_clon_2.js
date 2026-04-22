var incomingLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

var segmentParts = currentInputLine = '';
var indexedRecords = [];

while (currentInputLine = incomingLines.shift()) {
  segmentParts = currentInputLine.split(' ');
  indexedRecords.push([segmentParts[0], +segmentParts[1]]);
}

indexedRecords.sort(function (firstItem, secondItem) {
  if (firstItem[0] < secondItem[0]) return -1;
  if (firstItem[0] > secondItem[0]) return 1;
  if (firstItem[1] < secondItem[1]) return -1;
  if (firstItem[1] > secondItem[1]) return 1;
  return 0;
});

var activeCategory = '';
var collectedNumbers = [];

indexedRecords.forEach(function (recordDetails, entryIndex) {
  if (activeCategory !== recordDetails[0]) {
    if (entryIndex !== 0) {
      console.log(collectedNumbers.join(' '));
      collectedNumbers = [];
    }
    console.log(recordDetails[0]);
  }
  collectedNumbers.push(recordDetails[1]);
  activeCategory = recordDetails[0];
});
console.log(collectedNumbers.join(' '));