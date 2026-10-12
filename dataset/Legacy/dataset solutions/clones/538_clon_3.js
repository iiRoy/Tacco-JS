var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.trim().split("\n");

var arraySize = parseInt(lines.shift());
var initialArray = lines.shift().split(" ").map(Number);
var sortedArray = initialArray.slice().sort((val1, val2) => val1 - val2);

var queryCount = parseInt(lines.shift());
var swapIndices = lines.map(line => line.split(" ").map(Number).map(val => val - 1));

// The original code prepends a no-op swap at the beginning.
// This is preserved to match the loop iteration count and index.
swapIndices.unshift([0, 0]);

var currentMismatchMap = new Map();
var targetMismatchMap = new Map();

for (let idx = 0; idx < initialArray.length; idx++) {
   if (initialArray[idx] !== sortedArray[idx]) {
      currentMismatchMap.set(idx, initialArray[idx]);
      targetMismatchMap.set(idx, sortedArray[idx]);
   }
}

// Helper function to generate a consistent string representation of map values.
// Map.values() iterates in insertion order. Since keys are inserted in ascending order (0, 1, 2...),
// this will produce the same string as Object.values() on an object with integer keys.
const generateMismatchValueString = (mismatchMap) => {
    return Array.from(mismatchMap.values()).join(",");
};

var targetMismatchValuesString = generateMismatchValueString(targetMismatchMap);
var foundMatch = false;
var matchIteration = -1;

for (let idx = 0; idx <= queryCount; idx++) {
   const currentSwapPair = swapIndices[idx];
   const swapIdx1 = currentSwapPair[0];
   const swapIdx2 = currentSwapPair[1];

   // Retrieve values from the map. If a key doesn't exist, get() returns undefined.
   const valueAtIdx1 = currentMismatchMap.get(swapIdx1);
   const valueAtIdx2 = currentMismatchMap.get(swapIdx2);

   // Perform the swap. set() will add a key with an undefined value if it doesn't exist,
   // matching the behavior of assigning undefined to an object property.
   currentMismatchMap.set(swapIdx1, valueAtIdx2);
   currentMismatchMap.set(swapIdx2, valueAtIdx1);

   // Check if the current state of mismatches matches the target sorted state.
   if (generateMismatchValueString(currentMismatchMap) === targetMismatchValuesString) {
      foundMatch = true;
      matchIteration = idx;
      break;
   }
}

if (foundMatch) {
   console.log(matchIteration);
} else {
   console.log(-1);
}
