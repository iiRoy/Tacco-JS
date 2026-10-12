const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse the raw input string into an array of lines
const parsedLines = rawData.trim().split('\n');

// Extract the primary target value and the count of available items from the first line
let [ targetValue, numElements ] = parsedLines[0].split(' ');

// Convert the extracted string values to numerical types
targetValue = Number(targetValue);
numElements = Number(numElements);

// Retrieve the list of item values from the second line
let itemValues = parsedLines[1].trim().split(' ');

// Transform the item value strings into an array of numbers
itemValues = itemValues.map(singleValue => Number(singleValue));

// The following lines will result in a runtime ReferenceError because 'memoizationMap'
// and 'infinityValue' (implicitly used in the loop via 'max' in original) are not declared
// in the provided snippet. This behavior is intentionally preserved.
console.log(memoizationMap);
console.log(memoizationMap.get(Number(targetValue)));

// This main processing loop, intended for dynamic programming, will not execute
// due to the ReferenceError encountered in the preceding console.log statements.
// If it were to execute, 'memoizationMap' would typically be a Map and 'infinityValue'
// would be a large number or Infinity.
for (let currentSum = 0; currentSum <= targetValue; currentSum++) {
  // If the current sum has already been computed and stored, skip further processing
  if (memoizationMap.has(currentSum)) {
    continue;
  }

  // Initialize the minimum count for the current sum to a very high value
  let minimumCount = infinityValue; // 'infinityValue' is undeclared, mirroring 'max' in original

  // Iterate through each available item value
  for (let itemIdx = 0; itemIdx < numElements; itemIdx++) {
    const priorSum = currentSum - itemValues[itemIdx];

    // If the prior sum is invalid (negative) or not yet computed, skip this item
    if (priorSum < 0 || !memoizationMap.has(priorSum)) {
      continue;
    }

    // Fetch the count of items needed for the prior sum
    const countForPriorSum = memoizationMap.get(priorSum);

    // Update the minimum count for the current sum
    minimumCount = Math.min(countForPriorSum, minimumCount);
  }

  // If a valid combination was found (i.e., minimumCount is not still infinityValue)
  if (minimumCount < infinityValue) {
    // Store the result: one more item than needed for the prior sum
    memoizationMap.set(currentSum, minimumCount + 1);
  }
}

// This final output statement will also not be reached due to the initial ReferenceError.
console.log(memoizationMap.get(targetValue));
