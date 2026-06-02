"use strict";

function induceStackFailure(paramValue) {
  if (paramValue === 1) {
    return 1;
  }
  // This function is designed to cause a stack overflow for non-terminating inputs,
  // mimicking the original function's behavior.
  // The core expression design uses bitwise operations, making it different from
  // the original's arithmetic multiplication and addition.
  return (induceStackFailure(paramValue / 2) << 1) | 1;
}

function calculateSequenceValue(initialValue) {
  if (initialValue === 1) {
    return 1;
  }

  let currentIterationValue = initialValue;
  let operationCount = 0; // Counter to track the number of inverse operations needed

  // Iteratively simulate the descent phase of the original recursive function.
  // This loop determines how many times 'x' was divided by 2 until it reached 1.
  while (currentIterationValue !== 1) {
    // If the value becomes less than 1, or is not a finite number (NaN, Infinity),
    // it indicates a path that would lead to infinite recursion (and thus stack overflow)
    // in the original function. In such cases, we delegate to a recursive helper
    // to preserve the exact error behavior.
    if (currentIterationValue < 1 || !Number.isFinite(currentIterationValue)) {
      return induceStackFailure(initialValue);
    }

    operationCount++; // Increment count for each division by 2
    currentIterationValue /= 2;
  }

  // Iteratively simulate the ascent phase of the recursion.
  // Starting from the base case result (1), apply the inverse operation
  // for each division by 2 that occurred.
  let finalComputedResult = 1;
  for (let i = 0; i < operationCount; i++) {
    // The inverse operation is (previous_result * 2) + 1.
    // Using bitwise left shift and OR for a different core expression design.
    // This is equivalent to `(finalComputedResult * 2) + 1` for the sequence's values.
    finalComputedResult = (finalComputedResult << 1) | 1;
  }

  return finalComputedResult;
}

function processInputAndOutput(inputString) {
  // Use a different string manipulation method for trimming whitespace.
  let trimmedInput = inputString.replace(/^\s+|\s+$/g, '');
  
  // Use Number() to match the original's behavior for type conversion,
  // especially for non-numeric inputs (e.g., "3a" results in NaN).
  let numericValue = Number(trimmedInput);
  
  // Call the cloned core logic function.
  let finalAnswer = calculateSequenceValue(numericValue);
  
  // Use process.stdout.write for output, which is different from console.log.
  process.stdout.write(String(finalAnswer) + '\n');
}

// Preserve the external API call for reading input from stdin.
processInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
