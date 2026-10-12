const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = (rawData.trim()).split("\n");

const firstCount = Number(lineSegments[0]);
const firstArray = lineSegments[1].split(" ").map(Number);

// The original code included a commented-out line for a second count, which is not used.
// const secondCount = Number(lineSegments[2]);

const secondArray = lineSegments[3].split(" ").map(Number);

// This IIFE creates a closure for the binary search function,
// allowing it to access 'targetArray' and 'targetSize' from its outer scope.
const lookupValue = (function(targetArray, targetSize) {
  return (searchKey) => {
    let middleIdx;
    let lowBound = 0;
    let highBound = targetSize;

    // Early exit if the search key is outside the range of the sorted array.
    if (searchKey < targetArray[0] || targetArray[targetSize - 1] < searchKey) {
      return 0;
    }

    // Standard binary search loop.
    while (lowBound < highBound) {
      middleIdx = Math.floor((lowBound + highBound) / 2);
      if (searchKey < targetArray[middleIdx]) {
        highBound = middleIdx;
      } else if (searchKey > targetArray[middleIdx]) {
        lowBound = middleIdx + 1;
      } else {
        return 1; // Key found.
      }
    }
    return 0; // Key not found.
  };
})(firstArray, firstCount);

// This function is defined in the original code but not directly used in the final calculation.
// It's preserved to maintain all executable logic.
const accumulatorFunc = (valA, valB) => valA + valB;

// The final output calculates the sum of results from mapping the second array.
// Note: The original code contains a ReferenceError due to 'e' being undefined
// in the call to 'lookupValue(e)'. This behavior is strictly preserved.
console.log(secondArray.map(lookupValue(e)).reduce((currentSum, currentVal) => currentSum + currentVal, 0));
