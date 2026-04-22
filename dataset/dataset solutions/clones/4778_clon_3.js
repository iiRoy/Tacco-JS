// This JavaScript program calculates the number of non-negative integer triples (x, y, z)
// such that their sum equals a target value (S), and each component (x, y, z)
// does not exceed a specified upper bound (K).

/**
 * Executes the core logic to find combinations based on provided parameters.
 * @param {string} rawInputData - A string containing two space-separated numbers: K and S.
 */
function calculateValidCombinations(rawInputData) {
  // Defensive programming: Ensure input is a string and not empty.
  if (typeof rawInputData !== 'string' || rawInputData.length === 0) {
    console.error("Error: Input data is missing or not in expected string format.");
    return;
  }

  // Step 1: Pre-process the raw input string.
  const cleanedInput = rawInputData.trim();
  const inputSegments = cleanedInput.split(' ');

  // Validate the number of segments after splitting.
  const requiredSegments = 2;
  if (inputSegments.length < requiredSegments) {
    console.error(`Error: Insufficient input values. Expected ${requiredSegments} numbers, found ${inputSegments.length}.`);
    return;
  }

  // Step 2: Parse the numeric values from the input segments.
  const numericParameters = [];
  for (let segmentIndex = 0; segmentIndex < requiredSegments; segmentIndex++) {
    const currentSegment = inputSegments[segmentIndex];
    const parsedNumber = Number(currentSegment);

    // Validate if the parsed value is a valid number.
    if (isNaN(parsedNumber)) {
      console.error(`Error: Non-numeric data encountered in input: "${currentSegment}".`);
      return;
    }
    numericParameters.push(parsedNumber);
  }

  // Assign parsed values to semantically meaningful variables.
  const upperBoundK = numericParameters[0]; // Corresponds to 'k' in the original problem.
  const targetSumS = numericParameters[1];   // Corresponds to 's' in the original problem.

  // Additional validation for the problem constraints (non-negative integers).
  if (upperBoundK < 0 || targetSumS < 0) {
    console.warn("Warning: Provided K or S values are negative. This may lead to unexpected results for non-negative component requirements.");
  }
  if (!Number.isInteger(upperBoundK) || !Number.isInteger(targetSumS)) {
      console.warn("Warning: K or S are not integers. Calculations will proceed, but problem assumptions might be violated.");
  }

  let finalCountOfTriples = 0; // Initialize a counter for valid (x, y, z) combinations.

  // Step 3: Iterate through all possible values for the first component (x).
  // The value of x can range from 0 up to K (inclusive).
  for (let currentX = 0; currentX <= upperBoundK; currentX++) {

    // Step 4: Iterate through all possible values for the second component (y).
    // The value of y can also range from 0 up to K (inclusive).
    for (let currentY = 0; currentY <= upperBoundK; currentY++) {

      // Step 5: Calculate the required value for the third component (z).
      // Since x + y + z = S, then z = S - (x + y).
      const sumOfTwoComponents = currentX + currentY;
      const requiredZ = targetSumS - sumOfTwoComponents;

      // Step 6: Check if the calculated 'z' is valid according to the problem constraints.
      // 'z' must be non-negative (>= 0) and not exceed the upper bound 'K'.
      const isZNonNegative = (requiredZ >= 0);
      const isZWithinBounds = (requiredZ <= upperBoundK);

      // If both conditions are met, we have found a valid triple (x, y, z).
      if (isZNonNegative && isZWithinBounds) {
        finalCountOfTriples = finalCountOfTriples + 1; // Increment the counter.
      }
    }
  }

  // Step 7: Output the total number of valid combinations found.
  console.log(finalCountOfTriples);
}

// Entry point for the program: Read input from standard input and pass to the main function.
// This uses an Immediately Invoked Function Expression (IIFE) for scope management and error handling.
(function executeProgram() {
  try {
    const fileSystemModule = require('fs');
    const standardInputPath = '/dev/stdin';
    const contentFromFile = fileSystemModule.readFileSync(standardInputPath, 'utf8');

    // Call the main calculation function with the obtained input.
    calculateValidCombinations(contentFromFile);
  } catch (errorReadingInput) {
    // Log any errors that occur during file reading or module loading.
    console.error("An error occurred while attempting to read standard input:", errorReadingInput.message);
    // Optionally, exit the process with an error code.
    // process.exit(1);
  }
})();