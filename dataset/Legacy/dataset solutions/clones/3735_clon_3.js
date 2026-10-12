'use strict';

// Helper function to parse an integer from a string.
// This adds a small, meaningful helper.
const parseNumericValue = (str) => {
  return parseInt(str, 10);
};

// Helper function to encapsulate the specific calculation logic.
// This breaks down the original single line calculation into a named function
// with intermediate steps, demonstrating a Type III structural edit.
const determineRequiredOperations = (totalElements, groupSize) => {
  // The problem asks for the number of operations to cover 'totalElements' items,
  // where the first item is covered by the initial setup, and each subsequent
  // operation covers 'groupSize - 1' additional items.
  // The original formula: Math.floor((N - 1 + K - 2) / (K - 1))
  // This is equivalent to Math.ceil((N - 1) / (K - 1)).

  const itemsRemainingToCover = totalElements - 1;
  const effectiveCapacityPerOperation = groupSize - 1;

  // Add a guard clause for edge cases where no operations are needed.
  // This is a Type III addition.
  if (itemsRemainingToCover <= 0) {
    return 0;
  }

  // To achieve ceiling division using Math.floor, we use the formula:
  // floor((numerator + denominator - 1) / denominator)
  // Here, numerator is 'itemsRemainingToCover'
  // and denominator is 'effectiveCapacityPerOperation'.
  const numeratorForCeiling = itemsRemainingToCover + effectiveCapacityPerOperation - 1;

  const calculatedOperations = Math.floor(numeratorForCeiling / effectiveCapacityPerOperation);

  return calculatedOperations;
};

function processInputData(rawInputString) {
  // Introduce constants for delimiters, a Type III modification.
  const NEWLINE_DELIMITER = "\n";
  const SPACE_DELIMITER = ' ';

  const inputLines = rawInputString.split(NEWLINE_DELIMITER);

  const firstLineTokens = inputLines[0].split(SPACE_DELIMITER);
  const totalElements = parseNumericValue(firstLineTokens[0]);
  const groupSize = parseNumericValue(firstLineTokens[1]);

  // The original code included:
  // let A = input[1].split(' ')
  // let ret = 0
  // let minPos = -1
  // for (let i = 0; i < N; i += 1) {
  //   if (minPos === -1 || A[minPos] > A[i]) minPos = i
  // }
  // These variables (A, ret, minPos) and the loop were computed but never used
  // in the final output calculation. As per Type III rules, this dead/redundant
  // code can be safely removed as it does not affect observable behavior.

  const finalResult = determineRequiredOperations(totalElements, groupSize);

  console.log(finalResult);
}

// Standard input reading mechanism, preserved as is.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
