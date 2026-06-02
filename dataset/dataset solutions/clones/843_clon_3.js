var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const MIN_NUMBER_VALUE = 2;
const MAX_NUMBER_VALUE = 100001;
const INITIAL_MAX_FREQUENCY = 1;

var trimmedInputData = rawData.trim();
var inputLines = trimmedInputData.split("\n");

var numRangesString = inputLines.shift();
var numRanges = parseInt(numRangesString, 10);

var frequencyMap = {};
for (let currentNum = MIN_NUMBER_VALUE; currentNum <= MAX_NUMBER_VALUE; currentNum++) {
   frequencyMap[currentNum] = 0;
}

for (let rangeIndex = 0; rangeIndex < numRanges; rangeIndex++) {
   var currentRangeLine = inputLines.shift();
   var rangeBounds = currentRangeLine.split(" ").map(Number);
   var startBound = rangeBounds[0];
   var endBound = rangeBounds[1];

   for (let valueToIncrement = startBound; valueToIncrement <= endBound; valueToIncrement++) {
      frequencyMap[valueToIncrement]++;
   }
}

var maxObservedFrequency = INITIAL_MAX_FREQUENCY;
for (let checkNumber = MIN_NUMBER_VALUE; checkNumber <= MAX_NUMBER_VALUE; checkNumber++) {
   var currentCountForNumber = frequencyMap[checkNumber];
   if (currentCountForNumber >= checkNumber) {
      maxObservedFrequency = Math.max(maxObservedFrequency, currentCountForNumber);
   }
}

console.log(maxObservedFrequency - 1);
