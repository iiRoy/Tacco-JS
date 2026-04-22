function calculateSumCombinations(sourceData) {
  // This function determines the number of non-negative integer triplets (x, y, z)
  // such that 0 <= x <= limit, 0 <= y <= limit, 0 <= z <= limit, and x + y + z = targetSum.

  // --- Input Parsing and Validation ---

  // Step 1: Ensure the provided input is indeed a string.
  if (typeof sourceData !== 'string') {
    console.error("Input Error: The provided data must be a string type.");
    return 0; // Invalid input type, so no valid combinations can be found.
  }

  // Step 2: Split the string into its constituent numeric parts.
  // Using `trim()` to remove leading/trailing whitespace and `/\s+/` to handle
  // multiple spaces between numbers robustly.
  const numericComponents = sourceData.trim().split(/\s+/);

  // Step 3: Validate that exactly two components were successfully extracted.
  if (numericComponents.length !== 2) {
    console.error(`Input Error: Expected exactly two numbers in the input string, but found ${numericComponents.length}.`);
    return 0; // Incorrect number of parameters.
  }

  // Helper function to safely parse a string into an integer and validate its range.
  const parseAndValidateInteger = (stringValue, parameterName) => {
    const parsedValue = parseInt(stringValue, 10);

    // Check if the parsing operation resulted in a valid number.
    if (isNaN(parsedValue)) {
      console.error(`Parsing Error: Could not convert '${stringValue}' into a valid integer for ${parameterName}.`);
      return null; // Indicate failure to parse.
    }

    // Ensure the parsed number is non-negative, as per problem constraints (e.g., 0 <= x,y,z).
    if (parsedValue < 0) {
      console.error(`Validation Error: ${parameterName} must be a non-negative number, but received ${parsedValue}.`);
      return null; // Indicate invalid negative value.
    }
    return parsedValue;
  };

  // Step 4: Parse and validate the upper limit (K from the original problem).
  const upperLimit = parseAndValidateInteger(numericComponents[0], 'upper limit (K)');
  // Step 5: Parse and validate the desired total sum (S from the original problem).
  const desiredSum = parseAndValidateInteger(numericComponents[1], 'desired sum (S)');

  // Step 6: If any parsing or validation failed for the primary parameters, exit early.
  if (upperLimit === null || desiredSum === null) {
    return 0; // Return 0 as no valid calculation can proceed.
  }

  // Initialize a counter to keep track of valid combinations found.
  let validCombinationsCount = 0;

  // --- Core Logic: Iterating Through Possible Combinations ---

  // The first element ('x') of the triplet can range from 0 up to the `upperLimit`.
  for (let firstElement = 0; firstElement <= upperLimit; firstElement++) {
    // The second element ('y') of the triplet can also range from 0 up to the `upperLimit`.
    for (let secondElement = 0; secondElement <= upperLimit; secondElement++) {

      // Calculate the sum of the first two elements. This is an intermediate step.
      const currentSumOfTwoElements = firstElement + secondElement;

      // Determine what the third element ('z') must be to achieve the `desiredSum`.
      const requiredThirdElement = desiredSum - currentSumOfTwoElements;

      // Now, validate if this `requiredThirdElement` is within the allowed range.
      // 1. It must be non-negative (greater than or equal to 0).
      // 2. It must not exceed the `upperLimit`.
      const isThirdElementWithinBounds = (requiredThirdElement >= 0 && requiredThirdElement <= upperLimit);

      // If the third element satisfies both conditions, then we have found a valid triplet.
      if (isThirdElementWithinBounds) {
        validCombinationsCount++; // Increment the counter for each valid combination.
      }
    }
  }

  // Return the final tally of all valid combinations.
  return validCombinationsCount;
}

// --- Main Execution Block for Script ---

// This section handles reading input from the standard input stream,
// a common practice in environments like competitive programming platforms.
try {
  // Dynamically require the 'fs' (file system) module.
  const fileSystemHandler = require('fs');

  // Read the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
  const rawInputData = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

  // Invoke the main calculation function with the obtained input data.
  const finalCalculatedResult = calculateSumCombinations(rawInputData);

  // Output the computed result to the standard output.
  console.log(finalCalculatedResult);

} catch (executionError) {
  // Catch and report any errors that occur during file reading or script execution.
  console.error("An unexpected error occurred during script execution:", executionError.message);
  // In a robust application, you might also exit with a non-zero status code here
  // to signal an error to the operating system (e.g., process.exit(1)).
}