"use strict";

/**
 * Retrieves raw input data from the standard input stream.
 * This function encapsulates the file system interaction.
 * @returns {string} The content read from /dev/stdin in UTF-8 format.
 */
function retrieveInputData() {
  const fileSystemModule = require("fs"); // Obtain file system utility
  const inputPath = "/dev/stdin";        // Standard input source
  const encodingType = "utf-8";          // Character encoding for input

  // Read and return the entire file content
  return fileSystemModule.readFileSync(inputPath, encodingType);
}

/**
 * Processes a raw score string, converts it to a numeric value,
 * and determines a corresponding rank based on predefined score ranges.
 * The ranking system assigns values from 8 down to 1 for scores
 * between 400 and 1999, in increments of 200.
 * Scores outside this specific range will result in an "Invalid Score" output.
 * @param {string} rawScoreString - The input string representing a score.
 */
function processScoreValue(rawScoreString) {
  // Trim leading/trailing whitespace from the input string
  const cleanedInput = rawScoreString.trim();

  // Attempt to parse the cleaned string into an integer
  const numericScore = parseInt(cleanedInput, 10); // Explicitly use base 10

  // Define the core parameters for the ranking calculation
  const rangeIncrement = 200; // Each rank covers a 200-point score range
  const lowestScoreForRank = 400; // Minimum score to receive any rank
  const highestScoreForRank = 1999; // Maximum score to receive any rank
  const initialRankOffset = 9; // Base value for rank calculation (9 - X = rank)

  let resultRankDisplay = "Invalid Score"; // Default display for out-of-range or invalid input

  // Validate the parsed numeric score
  if (!isNaN(numericScore) && numericScore >= lowestScoreForRank && numericScore <= highestScoreForRank) {
    // Calculate the segment of the score relative to the base and increment
    // Example: For 400-599, floor(N/200) is 2.
    // For 600-799, floor(N/200) is 3.
    const scoreSegment = Math.floor(numericScore / rangeIncrement);

    // Derive the rank using the calculated segment and the initial offset
    // The formula is: initialRankOffset - (scoreSegment - (lowestScoreForRank / rangeIncrement - 1))
    // Simplifies to: initialRankOffset - (scoreSegment - 1) for this specific problem (9 - (segment - 1))
    const derivedRank = initialRankOffset - (scoreSegment - (lowestScoreForRank / rangeIncrement));

    // Convert the numeric rank to a string for consistent output
    resultRankDisplay = String(derivedRank);
  } else if (isNaN(numericScore)) {
    // Handle cases where parsing failed (e.g., input was not a number)
    resultRankDisplay = "Non-numeric Input";
  }

  // Output the final determined rank or error message
  console.log(resultRankDisplay);
}

// Main execution block: retrieve input and initiate processing
processScoreValue(retrieveInputData());