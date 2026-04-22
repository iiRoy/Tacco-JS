'use strict'; // Global strict mode directive.

/**
 * Utility function to synchronously retrieve raw input data from standard input.
 * This simulates reading from a console or pipe in a Node.js environment.
 * @returns {string} The entire content read from stdin as a single string.
 */
function fetchStandardInputData() {
  // Utilize Node.js's file system module to read from the standard input stream.
  // The 'utf8' encoding ensures proper text handling.
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

/**
 * Processes a given input string to calculate a time-of-day value.
 * The core logic involves parsing two numbers, summing them, and
 * then finding the result modulo 24 (representing hours in a day).
 * @param {string} rawPayload - The complete input string, potentially containing multiple lines.
 */
function determineCyclicTimeValue(rawPayload) {
  // Ensure strict mode applies to this function's execution context.
  // This helps catch common coding mistakes and enables certain optimizations.
  // 'use strict'; // Moved to global scope as per common practice for modules.

  // Step 1: Extract the primary line of data from the payload.
  // We assume the relevant numbers are on the first non-empty line.
  const allInputLines = rawPayload.split('\n');
  let firstRelevantLine = '';

  // Iterate through lines to find the first non-empty one.
  for (const line of allInputLines) {
    if (line.trim().length > 0) {
      firstRelevantLine = line.trim();
      break; // Found the first non-empty line, exit loop.
    }
  }

  // Guard clause: If no valid line was found, log an error and exit.
  if (!firstRelevantLine) {
    console.error("Error: No meaningful input line detected in the provided payload.");
    return; // Terminate execution for this invalid input.
  }

  // Step 2: Split the relevant line into string components based on spaces.
  const individualStringParts = firstRelevantLine.split(' ');

  // Step 3: Parse the string parts into an array of numbers.
  // We use parseInt for integer conversion and validate each conversion.
  const collectedNumericValues = [];
  for (const part of individualStringParts) {
    const numericalConversion = parseInt(part, 10); // Base 10 for decimal numbers.
    if (!isNaN(numericalConversion)) {
      collectedNumericValues.push(numericalConversion);
    } else {
      // Provide a warning for any input parts that could not be converted to numbers.
      console.warn(`Warning: Skipped non-numeric or invalid part encountered: '${part}'`);
    }
  }

  // Guard clause: Ensure we have at least two valid numbers for our calculation.
  if (collectedNumericValues.length < 2) {
    console.error("Error: Insufficient numeric data. At least two numbers are required for processing.");
    return; // Exit if critical data is missing.
  }

  // Step 4: Assign the first two parsed numbers to distinct variables.
  // Renaming for enhanced readability and to reflect their roles.
  let operandOne = collectedNumericValues[0];
  let operandTwo = collectedNumericValues[1];

  // Introduce a named constant for the modulo base, improving code clarity.
  const TIME_CYCLE_HOURS = 24; // Represents the total hours in a standard day cycle.

  // Step 5: Compute the sum of the two operands.
  // Using an intermediate variable for this step.
  let intermediateSumOfHours = operandOne + operandTwo;

  // Step 6: Apply the modulo operation to get the final cyclic time value.
  // This ensures the result stays within the 0-23 range for hours.
  // Added an extra step to handle potential negative sums gracefully,
  // although not strictly necessary for typical problem constraints.
  while (intermediateSumOfHours < 0) {
    intermediateSumOfHours += TIME_CYCLE_HOURS; // Adjust by adding full cycles until positive.
  }
  let finalCalculatedTime = intermediateSumOfHours % TIME_CYCLE_HOURS;

  // Step 7: Output the final computed value to the console.
  console.log(finalCalculatedTime);
}

// Entry point: Fetch input and then initiate the processing sequence.
determineCyclicTimeValue(fetchStandardInputData());