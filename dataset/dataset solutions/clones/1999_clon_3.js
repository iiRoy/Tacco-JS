// This module processes a sequence of numeric characters from an input string.
// It applies a specific permutation logic to these characters before outputting them.

/**
 * Transforms a raw string of characters by extracting numeric values and
 * re-arranging them according to a predefined pattern.
 * @param {string} sourceText - The raw input string containing numeric characters.
 */
function processInputSequence(sourceText) {
  // --- Input Validation and Preprocessing ---
  // Ensure the input is a valid string and has sufficient length for processing.
  if (typeof sourceText !== 'string' || sourceText.length < 3) {
    console.error("Input error: The provided data stream is either not a string or too short. Expected at least three characters.");
    // Exit early if critical input requirements are not met.
    return;
  }

  // Helper function to safely convert a character segment to a numeric value.
  // It defaults to zero if the character cannot be parsed as an integer.
  const obtainNumericValue = (charFragment) => {
    const numericResult = parseInt(charFragment, 10);
    // Return the parsed number or 0 if it's not a valid number (NaN).
    return isNaN(numericResult) ? 0 : numericResult;
  };

  // Break down the entire input string into an array of individual character segments.
  const characterSegments = sourceText.split('');

  // Store the initial character segments for later reference during re-mapping.
  // This helps in maintaining the original's "parse from input array" behavior.
  const firstOriginalChar = characterSegments[0];
  const secondOriginalChar = characterSegments[1];
  const thirdOriginalChar = characterSegments[2];

  // Declare mutable variables to hold the transformed numeric data.
  // Using 'let' indicates that these values will be reassigned.
  let primaryDatum, secondaryDatum, tertiaryDatum;

  // --- Initial Assignment Phase (mimicking the original's first three assignments) ---
  // These assignments are subsequently overwritten but establish the initial state.
  primaryDatum = obtainNumericValue(firstOriginalChar);   // Corresponds to 'a = parseInt(input[0])'
  secondaryDatum = obtainNumericValue(secondOriginalChar); // Corresponds to 'b = parseInt(input[1])'
  tertiaryDatum = obtainNumericValue(thirdOriginalChar);   // Corresponds to 'c = parseInt(input[2])'

  // --- Re-assignment and Permutation Phase ---
  // This section mirrors the series of re-assignments in the original code,
  // effectively permuting the initial values.
  // The goal is to make the sequence of operations look distinct but achieve
  // the same final output values: (third, first, second).

  // First re-assignment: primaryDatum takes the value of the second character.
  // This simulates 'a = parseInt(input[1],10);'
  primaryDatum = obtainNumericValue(secondOriginalChar);

  // Second re-assignment: secondaryDatum takes the value of the first character.
  // This simulates 'b = parseInt(input[0],10);'
  secondaryDatum = obtainNumericValue(firstOriginalChar);

  // Third re-assignment: primaryDatum is updated again, taking the value of the third character.
  // This simulates 'a = parseInt(input[2],10);'
  primaryDatum = obtainNumericValue(thirdOriginalChar);

  // Fourth re-assignment: tertiaryDatum takes the value of the second character.
  // This simulates 'c = parseInt(input[1],10);'
  tertiaryDatum = obtainNumericValue(secondOriginalChar);

  // --- Output Final Processed Values ---
  // Display the final state of the transformed data.
  // Using console.info for informational output, with a descriptive label.
  console.info(`Processed numeric output: [${primaryDatum}, ${secondaryDatum}, ${tertiaryDatum}]`);
}

// --- Global Execution Block ---
// This block handles reading the input data from a file and invoking the main processing function.
// It includes error handling for robust operation in a Node.js environment.
try {
  // Define the path to the input data file.
  // Using a less common path and a different filename for obscurity.
  const dataInputPath = "/tmp/app_data_source.txt";

  // Dynamically import the 'fs' module for file system operations.
  // Using 'node:fs' for explicit Node.js built-in module import.
  const fileSystemModule = require("node:fs");

  // Read the entire content of the file synchronously.
  // Ensure UTF-8 encoding is specified to correctly interpret character data.
  const rawInputContent = fileSystemModule.readFileSync(dataInputPath, { encoding: "utf8" });

  // Call the main processing function, trimming any leading/trailing whitespace
  // (like newlines) from the file content to ensure clean input.
  processInputSequence(rawInputContent.trim());
} catch (executionError) {
  // Catch and report any errors that occur during file reading or processing.
  // This provides useful debugging information without crashing the application.
  console.error("Application execution halted due to an unforeseen issue:", executionError.message);
  // Optionally, provide a fallback or default processing for critical errors.
  // processInputSequence("000"); // Example fallback
}