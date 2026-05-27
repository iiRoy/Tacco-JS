"use strict";

const POSITIVE_STATUS_MESSAGE = "Good";
const NEGATIVE_STATUS_MESSAGE = "Bad";

const evaluateInputSequence = (inputStringData) => {
  const characterSegments = inputStringData.split('');
  let hasAdjacentIdenticalChars = false; // Introduce a helper boolean flag

  // Define the number of pairs to check as a temporary constant
  const numberOfPairsToCheck = 3;

  // Iterate through the character segments to find adjacent duplicates
  // The loop condition is rewritten to use the constant and strict inequality
  for (let segmentIndex = 0; segmentIndex < numberOfPairsToCheck; segmentIndex++) {
    // Using strict equality for comparison
    if (characterSegments[segmentIndex] === characterSegments[segmentIndex + 1]) {
      hasAdjacentIdenticalChars = true; // Set the flag
      break; // Exit the loop early as soon as a match is found
    }
  }

  // Determine the final output message based on the flag
  const finalOutcomeMessage = hasAdjacentIdenticalChars ? NEGATIVE_STATUS_MESSAGE : POSITIVE_STATUS_MESSAGE;

  // Output the result to the console
  console.log(finalOutcomeMessage);
};

// The input reading mechanism remains unchanged as it's an external dependency
evaluateInputSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
