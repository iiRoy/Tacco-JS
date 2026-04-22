/**
 * @file This script evaluates a specific numerical condition based on standard input.
 * @author CloneGenerator
 * @version 1.0.1
 * @license Unlicensed (for educational cloning purposes)
 *
 * This module processes raw textual data, extracts a primary numeric value,
 * and then applies a custom modulo-based rule to determine a binary outcome ("Yes" or "No").
 * It includes robust input parsing and error handling mechanisms to ensure stability.
 */

/**
 * Executes the primary logic for determining the output based on processed input.
 * This function encapsulates the steps from input extraction to final condition evaluation.
 *
 * @param {string} rawSourceText The entire content read from the input source, typically stdin.
 * @returns {void} Outputs "Yes" or "No" directly to the console.
 */
function evaluateInputCondition(rawSourceText) {
  // --- Configuration Constants ---
  const KEY_MODULUS_DIVISOR = 11;
  const ACCEPTABLE_REMAINDER_SET = new Set([0, 4, 7]); // Using a Set for efficient lookup of allowed remainders.
  const SUCCESS_MESSAGE = "Yes";
  const FAILURE_MESSAGE = "No";

  /**
   * Internal helper function to safely extract and convert the first numeric value
   * from the provided raw text input. It performs basic validation.
   *
   * @param {string} textContent The string from which to extract the number.
   * @returns {number} The parsed integer, or NaN if extraction/parsing fails.
   */
  const extractAndParseNumericDatum = (textContent) => {
    // Guard clause for invalid input type or emptiness.
    if (typeof textContent !== 'string' || textContent.trim() === '') {
      console.error("[Validation] Input content is empty or not a string.");
      return NaN;
    }

    // Split the content into lines and take the first one.
    const contentLines = textContent.split('\n');
    if (contentLines.length === 0 || contentLines[0].trim() === '') {
      console.error("[Validation] First line of input is empty or missing.");
      return NaN;
    }

    const firstLineCandidate = contentLines[0].trim();
    // Attempt to parse the string into an integer.
    const parsedNumber = parseInt(firstLineCandidate, 10);

    // Additional validation to ensure the parsed value is a valid, finite number.
    if (isNaN(parsedNumber) || !Number.isFinite(parsedNumber)) {
      console.error(`[Validation] Could not convert "${firstLineCandidate}" to a valid number.`);
      return NaN;
    }

    return parsedNumber;
  };

  // --- Main Processing Flow ---

  // Step 1: Extract and validate the primary numeric value.
  const primaryNumericValue = extractAndParseNumericDatum(rawSourceText);

  // Step 2: Handle cases where the primary numeric value could not be determined.
  // If parsing failed, output the failure message and terminate.
  if (isNaN(primaryNumericValue)) {
    console.log(FAILURE_MESSAGE);
    return; // Exit early as further calculation is impossible.
  }

  // Step 3: Calculate the remainder using the predefined divisor.
  const resultantRemainder = primaryNumericValue % KEY_MODULUS_DIVISOR;

  // Step 4: Evaluate the condition based on the calculated remainder.
  let isConditionSatisfied = false;
  if (ACCEPTABLE_REMAINDER_SET.has(resultantRemainder)) {
    isConditionSatisfied = true;
  }
  // Alternatively, one could use a switch statement here for more complex remainder checks.
  /*
  switch (resultantRemainder) {
    case 0:
    case 4:
    case 7:
      isConditionSatisfied = true;
      break;
    default:
      isConditionSatisfied = false;
  }
  */

  // Step 5: Output the final result based on the condition's evaluation.
  const finalOutputString = isConditionSatisfied ? SUCCESS_MESSAGE : FAILURE_MESSAGE;
  console.log(finalOutputString);
}

// --- Application Entry Point ---
// This block handles the interaction with the file system to read input.
const fileSystemUtility = require("fs");
const standardInputFile = "/dev/stdin";
const defaultEncoding = "utf8";

try {
  // Read the entire content of the standard input stream synchronously.
  const receivedInputContent = fileSystemUtility.readFileSync(standardInputFile, defaultEncoding);
  // Pass the raw content to the core evaluation function.
  evaluateInputCondition(receivedInputContent);
} catch (readError) {
  // If there's an error reading the input file (e.g., file not found, permission issues),
  // log the error and output the failure message to maintain consistent output type.
  console.error(`[System Error] Failed to read from standard input: ${readError.message}`);
  console.log("No"); // Default to 'No' on input reading failure.
}