"use strict"; // Enforce strict parsing and error handling in the script

/**
 * Main function to process input and calculate the minimum absolute difference
 * based on a specific cumulative sum logic.
 * This function handles input parsing, data validation, and the core calculation.
 * @param {string} rawInputPayload - The raw input string, typically from stdin.
 */
const executeNumericalProcessing = (rawInputPayload) => {
  // Step 1: Prepare the input data
  // Convert the raw buffer to a string, remove leading/trailing whitespace,
  // and split it into individual lines.
  const inputLines = rawInputPayload.toString().trim().split('\n');

  // Attempt to parse the second line, which contains space-separated numbers.
  // Robustly split by one or more whitespace characters, filter out any empty strings
  // that might result from multiple spaces, and convert each part to a number.
  // Further filter out any non-numeric results (NaN) to ensure a clean array.
  const sourceNumbers = inputLines[1]
    .split(/\s+/)
    .filter(segment => segment !== '')
    .map(Number)
    .filter(value => !isNaN(value));

  // --- Type III: Add guard clauses for edge cases ---
  // If the array of numbers is empty, there's no difference to calculate.
  if (sourceNumbers.length === 0) {
    console.log(0);
    return; // Exit early
  }

  // If there's only one number, the only 'split' implies one partition is that number
  // and the other is zero. The difference is simply the absolute value of that number.
  if (sourceNumbers.length === 1) {
    console.log(Math.abs(sourceNumbers[0]));
    return; // Exit early
  }
  // --- End of guard clauses ---

  // Step 2: Initialize accumulators and result variable
  // Calculate the total sum of all numbers in the array.
  // An explicit initial value of 0 is provided for robustness.
  const cumulativeTotal = sourceNumbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Initialize the first partition's sum with the first element.
  let accumulatorOne = sourceNumbers[0];
  // Initialize the second partition's sum with the total sum minus the first element.
  let accumulatorTwo = cumulativeTotal - accumulatorOne;

  // Initialize the variable to store the minimum absolute difference found so far.
  // Using Number.POSITIVE_INFINITY ensures any valid difference will be smaller.
  let minimumObservedDelta = Number.POSITIVE_INFINITY;

  // Step 3: Iterate through the array to find the minimum difference
  // The loop processes each element, effectively shifting it from the second partition
  // to the first, and recalculating the difference.
  // The loop iterates N times, considering N potential "split" configurations
  // including the case where the second partition becomes empty.
  for (let processingIndex = 0; processingIndex < sourceNumbers.length; ++processingIndex) {
    // Store the current element being processed for clarity and potential reuse.
    const currentElement = sourceNumbers[processingIndex];

    // Calculate the absolute difference between the current states of the two accumulators.
    const currentDeltaMagnitude = Math.abs(accumulatorTwo - accumulatorOne);

    // Update the minimum observed delta if the current delta is smaller.
    minimumObservedDelta = Math.min(minimumObservedDelta, currentDeltaMagnitude);

    // Update the accumulators for the next iteration:
    // Subtract the current element from the second accumulator (as if moving it out).
    accumulatorTwo -= currentElement;
    // Add the current element to the first accumulator (as if moving it in).
    accumulatorOne += currentElement;
  }

  // Step 4: Output the final result
  // Display the smallest absolute difference found during the processing.
  console.log(minimumObservedDelta);
};

// Execute the numerical processing function with input read from standard input.
// This approach is common in competitive programming environments.
executeNumericalProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));