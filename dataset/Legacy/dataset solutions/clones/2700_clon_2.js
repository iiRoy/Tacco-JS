'use strict';

// This function processes the main input data.
function processInput(rawData) {
  const inputLines = rawData.split('\n'); // Split the raw input into individual lines.
  inputLines.pop(); // Remove the last empty line, if present.

  // The first line contains the count of elements, but it's not used in the logic.
  const elementCount = parseInt(inputLines[0], 10);

  // The second line contains space-separated numbers, parse them into an array.
  const numericSequence = inputLines[1].split(' ').map(valStr => {
    return parseInt(valStr, 10); // Convert each string part to an integer.
  });

  // Output the result of the sequence check.
  console.log(checkSequence(numericSequence));
}

// This function checks if the given sequence can be made sorted with at most two swaps.
function checkSequence(originalSequence) {
  const sequenceCopy = originalSequence.slice(); // Create a shallow copy of the array.
  let mismatchCount = 0; // Initialize a counter for elements not in their correct sorted position.

  // Iterate over each element in the copied sequence.
  sequenceCopy.forEach((currentValue, currentIndex) => {
    // If the current value is not equal to its expected sorted position (index + 1),
    // increment the mismatch counter.
    if (currentValue !== currentIndex + 1) {
      mismatchCount++;
    }
  });

  // If there are 0, 1, or 2 mismatches, it's possible to sort with at most two swaps.
  if (mismatchCount <= 2) {
    return 'YES';
  }
  // Otherwise, it's not possible.
  return 'NO';
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
