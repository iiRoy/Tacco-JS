'use strict';

// Helper function to determine if a number is considered "prime" based on the original algorithm's logic.
// This function encapsulates the exact behavior of the inner loop from the original code.
const checkPrimalityStatus = (valueToTest) => {
  let hasFoundDivisor = false; // This variable mirrors the 'check' flag in the original implementation.

  // The original loop iterates for potential divisors starting from 2 up to (valueToTest - 2).
  // For numbers like 1, 2, or 3, the loop condition (currentDivisor < valueToTest - 1) will be false,
  // meaning the loop body will not execute. In such cases, 'hasFoundDivisor' remains false.
  // This behavior correctly identifies 2 and 3 as prime, but also incorrectly identifies 1 as prime,
  // which is consistent with the original code's observable output for an input of 1.
  for (let currentDivisor = 2; currentDivisor < valueToTest - 1; currentDivisor++) {
    if (valueToTest % currentDivisor === 0) {
      hasFoundDivisor = true; // A divisor has been found, so it's not "prime" by this definition.
      break; // No need to check further, exit the loop early.
    }
  }
  return !hasFoundDivisor; // Returns true if no divisor was found (i.e., it's considered "prime").
};

const processInputData = (rawInputLines) => {
  const firstLineContent = rawInputLines[0];
  const startingInteger = parseInt(firstLineContent, 10); // Parse the input string into an integer, explicitly using base 10.

  // Calculate the exclusive upper bound for the search range.
  // The original loop runs up to (but not including) 2 * x.
  const searchRangeUpperLimitExclusive = 2 * startingInteger;

  // Iterate through numbers starting from the initial integer up to the calculated upper limit.
  for (let currentCandidate = startingInteger; currentCandidate < searchRangeUpperLimitExclusive; currentCandidate++) {
    // Utilize the extracted helper function to determine if the current number meets the "prime" criteria.
    if (checkPrimalityStatus(currentCandidate)) {
      console.log(currentCandidate); // Output the first number found that satisfies the condition.
      return; // Terminate the function immediately after printing the result, as per original behavior.
    }
  }
};

// Read input from standard input, split by newlines, and pass to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
