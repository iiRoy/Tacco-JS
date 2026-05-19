'use strict';
// This script calculates the minimum number of operations to reach a target value.
// Operations involve adding 1, or powers of 6, or powers of 9.
console.log(function(inputData){
  // Parse the input string to an integer, effectively truncating any decimal part.
  const targetValue = inputData.trim()|0;

  // Initialize a dynamic programming array to store the minimum operations for each number up to targetValue.
  // Fill with a large value (Infinity) to represent unreached states or higher costs.
  const minOperations = Array(targetValue + 1).fill(Infinity);

  // Base case: 0 operations are needed to reach 0.
  minOperations[0] = 0;

  // Iterate through each number from 0 up to (but not including) the target value.
  for ( let currentIdx = 0; currentIdx < targetValue; currentIdx++ ) {
    // Option 1: Add 1 to the current number.
    // If reaching currentIdx + 1 via adding 1 from currentIdx is cheaper than its current recorded cost, update it.
    if ( minOperations[currentIdx] < minOperations[currentIdx + 1] ) {
      minOperations[currentIdx + 1] = minOperations[currentIdx] + 1;
    }

    // Option 2: Add powers of 6.
    // Start with 6, then 36, 216, etc., as long as the sum does not exceed targetValue.
    for ( let stepSize = 6; currentIdx + stepSize <= targetValue; stepSize *= 6 ) {
      // If reaching currentIdx + stepSize via adding stepSize from currentIdx is cheaper, update it.
      if ( minOperations[currentIdx] < minOperations[currentIdx + stepSize] ) {
        minOperations[currentIdx + stepSize] = minOperations[currentIdx] + 1;
      }
    }

    // Option 3: Add powers of 9.
    // Start with 9, then 81, 729, etc., as long as the sum does not exceed targetValue.
    for ( let stepSize = 9; currentIdx + stepSize <= targetValue; stepSize *= 9 ) {
      // If reaching currentIdx + stepSize via adding stepSize from currentIdx is cheaper, update it.
      if ( minOperations[currentIdx] < minOperations[currentIdx + stepSize] ) {
        minOperations[currentIdx + stepSize] = minOperations[currentIdx] + 1;
      }
    }
  }

  // The result is the minimum operations needed to reach the targetValue.
  // Convert the final result to a string before returning.
  return minOperations[targetValue].toString();
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
