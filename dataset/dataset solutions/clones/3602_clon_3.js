// Enable strict mode for secure and clean JavaScript execution environment.
'use strict';

/**
 * Orchestrates the processing of raw input data: parsing, validation,
 * performing a specific arithmetic calculation, and outputting the result.
 * This function expects a string containing at least two space-separated
 * integer values.
 *
 * @param {string} incomingTextStream - The complete raw string content read from an input source.
 *                                      Expected to be a sequence of numbers separated by spaces.
 */
const performDecrementedProductCalculation = (incomingTextStream) => {

  // Define the character used to separate numeric values within the input string.
  const textSeparator = ' ';
  // Define the constant value by which each extracted number will be reduced.
  const reductionAmount = 1;

  // Initialize a mutable array to store the successfully parsed numeric values.
  let parsedNumericElements = [];

  // Implement an initial guard clause to check for empty or invalid input.
  if (!incomingTextStream || incomingTextStream.trim().length === 0) {
    // Output an error message to the console's error stream.
    console.error("Input processing error: The provided text stream is empty or contains only whitespace.");
    // Terminate execution of this function early as valid input is absent.
    return;
  }

  try {
    // Step 1: Divide the incoming text stream into individual string segments
    // based on the defined separator, after trimming leading/trailing whitespace.
    const segmentsOfStringData = incomingTextStream.trim().split(textSeparator);

    // Step 2: Iterate over each string segment to convert it into a numerical type.
    for (const currentSegment of segmentsOfStringData) {
      // Utilize the global Number() function for explicit type conversion.
      const convertedNumericValue = Number(currentSegment);

      // Perform validation to ensure the conversion yielded a valid finite number.
      if (isNaN(convertedNumericValue)) {
        console.error(`Input parsing warning: Encountered a non-numeric segment ('${currentSegment}'). This value will be skipped.`);
        // Continue to the next segment if the current one is not a valid number.
        continue;
      }
      // Add the successfully converted number to our collection.
      parsedNumericElements.push(convertedNumericValue);
    }

    // Another crucial validation: ensure we have sufficient numeric data for the operation.
    if (parsedNumericElements.length < 2) {
      console.error("Processing aborted: Insufficient valid numeric values detected. At least two numbers are required.");
      return;
    }

    // Step 3: Extract the primary operands from the beginning of the parsed elements array.
    // Using the .at() method for robust index access.
    const primaryValue = parsedNumericElements.at(0);
    const secondaryValue = parsedNumericElements.at(1);

    // Step 4: Apply the reduction amount to each of the extracted primary operands.
    const modifiedPrimary = primaryValue - reductionAmount;
    const modifiedSecondary = secondaryValue - reductionAmount;

    // Step 5: Compute the final product of the two modified numerical values.
    const computedOutcome = modifiedPrimary * modifiedSecondary;

    // Step 6: Display the calculated outcome to the standard output.
    console.log(computedOutcome);

  } catch (executionIssue) {
    // Catch any unexpected exceptions that might occur during the processing logic.
    console.error(`An unforeseen issue occurred during the calculation process: ${executionIssue.message}`);
    // Optionally, re-throw the error or log more details for debugging.
  }
};

// Initiate the application's core logic by reading from the standard input.
// Node.js 'fs' module is used to synchronously read the content of '/dev/stdin'.
// The 'node:fs' prefix is used for clarity and to indicate a built-in module.
performDecrementedProductCalculation(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf-8' }));