"use strict";

/**
 * Processes raw input data to determine the maximum number of times
 * all provided integers can be simultaneously halved.
 * @param {string} rawInputData The raw input string containing numbers.
 */
function ProcessInputData(rawInputData) {
  const inputLines = rawInputData.split('\n');

  // Input validation: Ensure there are at least two lines for N and the array.
  if (inputLines.length < 2) {
    console.error("Application Error: Insufficient input data. Expected at least two lines.");
    return; // Exit early if input is malformed
  }

  // Parse the declared count of elements from the first line.
  const declaredElementCount = parseInt(inputLines[0], 10);
  if (isNaN(declaredElementCount) || declaredElementCount <= 0) {
    console.error("Application Error: Invalid or non-positive element count provided.");
    return;
  }

  // Parse the array of numeric values from the second line.
  // Explicitly convert each string part to a Number.
  let currentNumericValues = inputLines[1].split(' ').map(Number);

  // Validate that all parsed values are indeed numbers.
  if (currentNumericValues.some(val => isNaN(val))) {
    console.error("Application Error: One or more provided values are not valid numbers.");
    return;
  }

  // Optional validation: Check if the actual array length matches the declared count.
  // Proceed with the actual length for robustness, but log a warning if there's a mismatch.
  if (currentNumericValues.length !== declaredElementCount) {
    console.warn(`Input Warning: Declared element count (${declaredElementCount}) does not match actual element count (${currentNumericValues.length}). Proceeding with actual count.`);
  }

  let totalHalvingRounds = 0; // Counter for successful halving rounds
  let wasUnevenNumberFoundInRound = false; // Flag to track if an odd number was hit

  // Loop indefinitely until an odd number prevents further divisions.
  for (;;) {
    wasUnevenNumberFoundInRound = false; // Reset the flag for the current round

    // Iterate through the array to check and perform division.
    for (let elementIndex = 0; elementIndex < currentNumericValues.length; elementIndex++) {
      const valueToExamine = currentNumericValues[elementIndex]; // Use an intermediate variable for clarity

      // Check if the current number is odd using a bitwise AND operation.
      if ((valueToExamine & 1) !== 0) {
        wasUnevenNumberFoundInRound = true;
        // If an odd number is found, there's no need to check further in this round.
        break;
      }
      // If the number is even, perform integer division by 2 using a bitwise right shift.
      currentNumericValues[elementIndex] >>= 1;
    }

    // If an odd number was encountered during this round, terminate the main process.
    if (wasUnevenNumberFoundInRound) {
      break;
    }

    // If all numbers were successfully halved in this round, increment the counter.
    totalHalvingRounds++;
  }

  // Output the final calculated count of halving rounds.
  console.log(totalHalvingRounds);
}

// --- Standard Input/Output Handler (do not modify this section) ---
// This part is responsible for reading input from stdin and invoking the main processing function.
// It is typically provided in competitive programming environments and should remain untouched.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));