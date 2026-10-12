let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let lineData = rawData.trim().split("\n");

let arraySize = lineData.shift() - 0;

let originalArray = lineData.shift().split(" ").map(Number);

let sortedArray = originalArray.slice().sort((val1, val2) => val1 - val2);

let queryCount = lineData.shift() - 0;

let swapOperations = lineData.map(item => item.split(" ").map(Number).map(item => item - 1));

swapOperations.unshift([0, 0]);

let currentDiffs = {};
let targetDiffs = {};

for (let idx = 0; idx < originalArray.length; idx++) {
   if (originalArray[idx] !== sortedArray[idx]) {
      currentDiffs[idx] = originalArray[idx];
      targetDiffs[idx] = sortedArray[idx];
   }
}

let targetDiffString = "";
for (let keyIndex in targetDiffs) {
    targetDiffString += targetDiffs[keyIndex];
}

let matchFound = false;
let finalOperationIndex = -1;

for (let opIndex = 0; opIndex <= queryCount; opIndex++) {
   let firstKey = swapOperations[opIndex][0];
   let secondKey = swapOperations[opIndex][1];

   let valAtFirstKey = currentDiffs[firstKey];
   let valAtSecondKey = currentDiffs[secondKey];

   currentDiffs[firstKey] = valAtSecondKey;
   currentDiffs[secondKey] = valAtFirstKey;

   let currentDiffString = "";
   for (let propKey in currentDiffs) {
       currentDiffString += currentDiffs[propKey];
   }

   if (currentDiffString === targetDiffString) {
      matchFound = true;
      finalOperationIndex = opIndex;
      break;
   }
}

if (matchFound) {
    console.log(finalOperationIndex);
} else {
    console.log(-1);
}
