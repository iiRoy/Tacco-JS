"use strict";

/**
 * Computes a specialized numerical sum based on the positions of 'W' characters
 * within an input string. This function handles multi-line input, extracts
 * the primary sequence, and performs a calculation that involves subtracting
 * the sequential order of 'W's (excluding the first position) from their
 * original character indices.
 *
 * @param {string} rawInputContent The complete string read from input, potentially containing multiple lines.
 */
function processSequenceCalculation(rawInputContent) {
  // Input validation: Ensure the provided content is a valid string.
  // In a robust application, one might throw an error. Here, we default to 0.
  if (typeof rawInputContent !== 'string' || rawInputContent === null || rawInputContent === undefined) {
    console.log(0); // If input is invalid, the result is implicitly zero.
    return;
  }

  // Step 1: Process the raw input to extract relevant lines.
  // Splitting by newline and filtering out any completely empty lines.
  // Using a more descriptive variable name for lines.
  const significantContentLines = rawInputContent.split("\n").filter(singleLine => {
    // Adding a robustness check: trim whitespace before checking if the line is empty.
    return singleLine.trim().length > 0;
  });

  // Guard clause: If no significant lines are found after filtering, there's no data to process.
  if (significantContentLines.length === 0) {
    console.log(0);
    return;
  }

  // Step 2: Extract the primary character sequence from the first significant line.
  // Trimming again ensures no leading/trailing whitespace impacts character indexing.
  const mainCharacterSequence = significantContentLines[0].trim();

  // Guard clause: If the main sequence itself is empty after trimming, the result is 0.
  if (mainCharacterSequence.length === 0) {
    console.log(0);
    return;
  }

  // Helper collection: This array will store the original indices of 'W' characters
  // that satisfy a specific condition from the original logic.
  const relevantWIndices = [];

  // Step 3: Iterate through the main sequence to identify and collect specific 'W' indices.
  // The original code implicitly filtered out 'W's at index 0. This loop makes that explicit.
  for (let charPosition = 0; charPosition < mainCharacterSequence.length; charPosition++) {
    const currentCharacter = mainCharacterSequence[charPosition];
    // Condition: The character must be 'W' AND its position must NOT be 0.
    // This directly translates the original `map(..., index => (char === "W" ? index : 0)).filter(x => x !== 0)` pattern.
    if (currentCharacter === "W" && charPosition !== 0) {
      relevantWIndices.push(charPosition);
    }
  }

  // Guard clause: If no relevant 'W' characters were found, the final sum is 0.
  if (relevantWIndices.length === 0) {
    console.log(0);
    return;
  }

  // Step 4: Calculate the final weighted sum.
  // The original `reduce` operation `acc + cur - index` can be broken down into two sums:
  // 1. The sum of the collected 'W' indices (`sum(cur)`).
  // 2. The sum of their sequential positions within the `relevantWIndices` array (`sum(index)`).
  // Then, subtract the second sum from the first.

  let totalOriginalIndicesSum = 0; // Accumulates sum of `cur` (original indices)
  let totalSequentialPositionsSum = 0; // Accumulates sum of `index` (array positions)

  // Using a forEach loop to perform the accumulation, replacing the reduce method.
  relevantWIndices.forEach((originalIndexValue, sequentialPosition) => {
    totalOriginalIndicesSum += originalIndexValue;
    totalSequentialPositionsSum += sequentialPosition;
  });

  // The final computed value is the difference between these two sums.
  const finalComputedDifference = totalOriginalIndicesSum - totalSequentialPositionsSum;

  // Step 5: Output the calculated result.
  console.log(finalComputedDifference);
}

// --- Auxiliary functions and execution entry point ---

// Encapsulate file reading logic into a separate, reusable function.
/**
 * Reads content from a specified file path using synchronous file system operations.
 * Handles potential file reading errors gracefully by logging and returning an empty string.
 * @param {string} filePath The path to the file to be read.
 * @returns {string} The content of the file as a UTF-8 string, or an empty string if an error occurs.
 */
function retrieveFileContents(filePath) {
  const fileSystemUtility = require("fs"); // Import fs module locally or globally.
  try {
    return fileSystemUtility.readFileSync(filePath, "utf8");
  } catch (error) {
    // Log the error for debugging purposes but allow the program to continue with empty input.
    console.error(`An error occurred while attempting to read file at "${filePath}": ${error.message}`);
    return ""; // Return an empty string to signify failed read, which will be handled by main logic.
  }
}

// Main execution block: Read from standard input and pass to the processing function.
const standardInputFilePath = "/dev/stdin";
const dataFromStandardInput = retrieveFileContents(standardInputFilePath);

// Invoke the primary processing function with the acquired data.
processSequenceCalculation(dataFromStandardInput);