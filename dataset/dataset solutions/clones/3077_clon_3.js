// This module is designed to process raw textual input containing numerical data.
// Its primary function is to analyze a sequence of numbers based on specific criteria
// and then report a binary outcome ("Yes" or "No").
// Author: Code Clone Generation System
// Version: 1.0.1
// License: MIT-like (for educational purposes)

/**
 * Orchestrates the processing of input data to determine if a specific numerical pattern exists.
 * The pattern requires the first three significant numbers to be identical and the first number to be non-zero.
 *
 * @param {string} sourceTextContent - The raw string data, expected to contain space-separated numbers.
 *                                     It can include leading/trailing whitespace or multiple spaces between numbers.
 */
function analyzeNumericPattern(sourceTextContent) {

  // --- Input Validation and Pre-processing (Type III: Added Guard Clauses) ---

  // Initial check: Ensure the input is a valid string and not empty after trimming.
  if (typeof sourceTextContent !== 'string' || sourceTextContent.trim().length === 0) {
    // If the input is invalid or purely whitespace, the condition cannot be met.
    console.log("No");
    return; // Exit early.
  }

  // Step 1: Normalize and tokenize the raw input string.
  // The original code's `split(/\s/)` can produce empty strings if multiple
  // whitespace characters separate numbers (e.g., "1  2 3" -> ["1", "", "2", "3"]).
  // We explicitly replicate this behavior.
  const rawStringTokens = sourceTextContent.trim().split(/\s/);

  // Step 2: Convert each string token into its numerical representation.
  // The `Number()` global function (used in the original `map(Number)`) has specific behaviors:
  // - `Number('')` converts to 0.
  // - `Number('some_text')` converts to `NaN`.
  // - `Number('1.23')` converts to `1.23`.
  // We will manually iterate to build our sequence, preserving this exact conversion logic.
  const processedNumericalSequence = [];
  const tokenCount = rawStringTokens.length;

  for (let i = 0; i < tokenCount; i++) {
    const currentStringPart = rawStringTokens[i];
    const convertedNumericValue = Number(currentStringPart); // Mimics `map(Number)`
    processedNumericalSequence.push(convertedNumericValue);
  }

  // --- Data Integrity Check (Type III: Added Validation) ---

  // Critical validation: Verify that we have a sufficient number of elements
  // to perform the required three-way comparison.
  const MINIMUM_COMPARISON_ELEMENTS = 3;
  if (processedNumericalSequence.length < MINIMUM_COMPARISON_ELEMENTS) {
    console.log("No"); // Insufficient data points for analysis.
    return; // Terminate execution.
  }

  // --- Extract and Evaluate Core Data Points (Type III: Helper Variables & Intermediate Steps) ---

  // Extract the first three relevant numerical values from the sequence.
  // Note: These could be 0 (from empty strings) or NaN (from invalid numbers).
  const primaryDatum = processedNumericalSequence[0];
  const secondaryDatum = processedNumericalSequence[1];
  const tertiaryDatum = processedNumericalSequence[2];

  // Evaluate the first part of the compound condition: Is the primary value non-zero?
  const isPrimaryValueNonZero = (primaryDatum !== 0);

  // Evaluate the second part of the compound condition: Are all three extracted values strictly identical?
  // This comparison correctly handles `NaN` values, as `NaN === NaN` evaluates to `false`.
  const allThreeValuesAreIdentical = (primaryDatum === secondaryDatum) && (secondaryDatum === tertiaryDatum);

  // --- Final Decision Logic (Type III: Rewritten Ternary to If/Else) ---

  let finalVerdictMessage; // Declare a variable to hold the outcome message.

  // Combine the boolean flags to reach the final determination.
  if (isPrimaryValueNonZero && allThreeValuesAreIdentical) {
    finalVerdictMessage = "Yes"; // All conditions met.
  } else {
    finalVerdictMessage = "No";  // One or more conditions not met.
  }

  // Output the final result to standard output.
  console.log(finalVerdictMessage);
}

// --- Program Entry Point and Environment Setup (Type III: IIFE, Error Handling) ---

// An Immediately Invoked Function Expression (IIFE) to encapsulate the setup logic
// and prevent global variable pollution, while also providing error handling for I/O.
(function initializeAndExecuteProcessor() {
  const fsModule = require("fs"); // Import Node.js File System module.
  const standardInputPath = "/dev/stdin"; // Standard input file path in Unix-like systems.
  const defaultEncoding = "utf8";       // Specify character encoding for input.

  try {
    // Attempt to read the entire content from standard input synchronously.
    const receivedRawInput = fsModule.readFileSync(standardInputPath, defaultEncoding);

    // Pass the raw input string to our main processing function.
    analyzeNumericPattern(receivedRawInput);

  } catch (operationError) {
    // Catch and report any errors that occur during file reading (e.g., file not found, permissions).
    console.error("An operational error occurred during input acquisition:", operationError.message);

    // As a robust fallback, invoke the processing function with an empty string.
    // This ensures a consistent "No" output if input cannot be read, rather than crashing.
    analyzeNumericPattern("");
  }
})();