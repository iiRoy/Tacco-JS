'use strict';

/**
 * A utility function to display the computed outcome.
 * @param {number} valueToDisplay - The numerical result to be printed.
 */
function emitResult(valueToDisplay) {
  // Ensure the output is a string before logging
  const formattedOutput = String(valueToDisplay);
  console.log(formattedOutput);
}

/**
 * Processes raw string input, extracts numeric values, performs a comparison,
 * and then outputs a final calculated value based on a specific rule.
 * This function serves as the primary entry point for the application logic.
 *
 * @param {string} inputStringData - The raw string data typically read from standard input.
 */
function processInputAndCompute(inputStringData) {
  // --- Step 1: Input Preprocessing and Parsing ---
  // A comment block detailing the initial data handling.

  // Remove any leading/trailing whitespace from the entire input.
  const trimmedInputContent = inputStringData.trim();

  // Split the content into individual lines. We are primarily interested in the first line.
  const contentLines = trimmedInputContent.split('\n');

  // Check if there's at least one line to process.
  if (contentLines.length === 0) {
    // In a real-world scenario, we might throw an error or log a warning.
    // For this exercise, we'll simply output a default/error value or exit.
    emitResult(-1); // Indicate an error or invalid input state
    return;
  }

  // Extract the very first line of input.
  const relevantInputLine = contentLines[0];

  // Split the primary line by spaces to get individual string tokens.
  const stringTokens = relevantInputLine.split(' ');

  // Prepare an array to hold our successfully parsed numerical operands.
  const numericOperands = [];

  // Iterate through each string token and attempt to convert it to a number.
  for (let i = 0; i < stringTokens.length; i++) {
    const currentToken = stringTokens[i];
    // Use Number() for explicit type conversion; it handles various numeric string formats.
    const potentialNumber = Number(currentToken);

    // Validate if the conversion resulted in a valid number.
    if (!isNaN(potentialNumber)) {
      numericOperands.push(potentialNumber);
    } else {
      // If a token is not a number, we might log an error or skip it.
      // For this problem, we assume valid number format for the first two tokens.
      console.error(`Warning: Non-numeric token encountered: '${currentToken}'`);
    }
  }

  // --- Step 2: Data Extraction and Validation ---

  // Ensure we have at least two valid numbers to proceed with the core logic.
  if (numericOperands.length < 2) {
    console.error("Error: Insufficient numeric data provided. Expected at least two numbers.");
    emitResult(-2); // Another error indicator
    return;
  }

  // Assign the first two parsed numbers to distinct variables for clarity.
  // Using 'const' as their values won't change after assignment here.
  const primaryValue = numericOperands[0];
  const secondaryValue = numericOperands[1];

  // Declare a variable to store the final outcome of the computation.
  let calculatedOutcome;

  // --- Step 3: Core Business Logic Application ---

  // Apply the specific comparison rule:
  // If the primary value is less than or equal to the secondary value,
  // the outcome is the primary value itself.
  if (primaryValue <= secondaryValue) {
    calculatedOutcome = primaryValue;
  } else {
    // Otherwise, if the primary value is greater, the outcome is
    // the primary value decremented by one.
    // Introduce an intermediate step for clarity.
    const decrementedPrimary = primaryValue - 1;
    calculatedOutcome = decrementedPrimary;
  }

  // --- Step 4: Output Generation ---

  // Call the helper function to display the final calculated result.
  emitResult(calculatedOutcome);
}

// --- Application Entry Point ---
// This block reads content from standard input and passes it to the main processing function.
// It ensures the input is interpreted as UTF-8 encoded text.
const fileSystemModule = require("fs");
const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Initiate the processing pipeline.
processInputAndCompute(standardInputContent);