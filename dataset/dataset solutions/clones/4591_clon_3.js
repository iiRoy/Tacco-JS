'use strict'; // Enforce strict mode for cleaner code practices and better error handling.

/**
 * A utility function to determine if a given numerical value is even.
 * This helper enhances readability for parity checks.
 * @param {number} numberToCheck - The integer value to be evaluated for evenness.
 * @returns {boolean} - Returns true if the number is even, false otherwise.
 */
const isValueEven = (numberToCheck) => numberToCheck % 2 === 0;

/**
 * A composite utility function to verify if a trio of numerical values are all even.
 * This simplifies complex conditional checks within the main logic.
 * @param {number} valOne - The first number in the trio.
 * @param {number} valTwo - The second number in the trio.
 * @param {number} valThree - The third number in the trio.
 * @returns {boolean} - Returns true if all three numbers are even, false if any one is odd.
 */
const areAllNumbersEven = (valOne, valTwo, valThree) =>
  isValueEven(valOne) && isValueEven(valTwo) && isValueEven(valThree);

/**
 * This function orchestrates a numerical transformation process, iteratively updating
 * three integer values based on a specific rule. It counts the number of transformation cycles
 * until a condition (at least one value becomes odd) is met, or an infinite loop scenario is detected.
 *
 * @param {string} rawInputLine - A string containing three space-separated integer values,
 *                                  e.g., "10 20 30".
 * @returns {number} The total count of successful transformation steps, or -1 if the initial
 *                   state represents an infinite transformation cycle. The result is also
 *                   printed to the standard output.
 */
const performNumericalSequenceTransformation = (rawInputLine) => {
  // Extract and convert the initial string values into numerical integers.
  // The input is expected to be a single line with three space-delimited numbers.
  const stringSegments = rawInputLine.trim().split(' ');
  const [initialValueX, initialValueY, initialValueZ] = stringSegments.map(Number);

  // Initialize dynamic variables that will undergo transformation.
  let currentX = initialValueX;
  let currentY = initialValueY;
  let currentZ = initialValueZ;

  // Initialize a counter to track the number of executed transformation steps.
  let transformationCycleCounter = 0;

  // A boolean flag to signal if an indefinite loop condition has been identified.
  let hasInfiniteCycleOccurred = false;

  // Pre-check for the specific condition that would lead to an infinite loop:
  // if all three initial values are identical and all are even.
  if (currentX === currentY && currentY === currentZ && isValueEven(currentX)) {
    transformationCycleCounter = -1; // Indicate an infinite loop.
    hasInfiniteCycleOccurred = true; // Set flag to bypass subsequent transformation logic.
  } else {
    // Execute transformation cycles as long as all numbers remain even
    // and an infinite loop hasn't been detected.
    while (areAllNumbersEven(currentX, currentY, currentZ) && !hasInfiniteCycleOccurred) {
      // Increment the counter for the current successful transformation cycle.
      transformationCycleCounter++;

      // Create a temporary snapshot of the current values before they are modified.
      // This is crucial because new values depend on the old values simultaneously.
      const valuesAtStartOfCycle = [currentX, currentY, currentZ];

      // Calculate half of each value from the snapshot.
      const halfOfValX = valuesAtStartOfCycle[0] / 2;
      const halfOfValY = valuesAtStartOfCycle[1] / 2;
      const halfOfValZ = valuesAtStartOfCycle[2] / 2;

      // Compute the next set of values based on the specific transformation rules.
      // New X is derived from half of previous Y and Z.
      // New Y is derived from half of previous X and Z.
      // New Z is derived from half of previous X and Y.
      const calculatedNextX = halfOfValY + halfOfValZ;
      const calculatedNextY = halfOfValX + halfOfValZ;
      const calculatedNextZ = halfOfValX + halfOfValY;

      // Update the main dynamic variables with their newly computed values.
      currentX = calculatedNextX;
      currentY = calculatedNextY;
      currentZ = calculatedNextZ;

      // --- Type III Addition: Non-essential validation/debug fragment ---
      // Although problem constraints usually guarantee integer results,
      // this check demonstrates adding a guard for unexpected data states.
      if (!Number.isInteger(currentX) || !Number.isInteger(currentY) || !Number.isInteger(currentZ)) {
        // If non-integer values appear (which implies a problem with input or logic),
        // log an error and halt the transformation process.
        console.error("Warning: Transformation resulted in non-integer values. Halting processing.");
        break; // Exit the loop prematurely.
      }
      // --- End of Type III Addition ---
    }
  }

  // Display the final computed count of transformation steps to the console.
  console.log(transformationCycleCounter);

  // Return the result for potential further programmatic use or testing.
  return transformationCycleCounter;
};

// Entry point for executing the transformation process.
// Reads input from standard input (e.g., '/dev/stdin' in Unix-like systems)
// and passes it to the primary transformation function.
performNumericalSequenceTransformation(require('fs').readFileSync('/dev/stdin', 'utf8'));