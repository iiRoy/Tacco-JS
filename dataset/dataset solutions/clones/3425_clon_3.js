'use strict';

const fileSystem = require('fs');

// Define the target numeric value that substrings will be compared against.
const REFERENCE_TARGET_VALUE = 753;

/**
 * Retrieves the primary input string from standard input.
 * It reads the entire file, trims whitespace, splits by newlines,
 * and then extracts the first non-empty token from the first line.
 *
 * @returns {string} The processed input string.
 * @throws {Error} If the standard input is entirely empty or unreadable.
 */
const acquirePrimaryInput = () => {
  let fileContent;
  try {
    fileContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  } catch (error) {
    throw new Error(`Failed to read from /dev/stdin: ${error.message}`);
  }

  const trimmedContent = fileContent.trim();
  if (trimmedContent.length === 0) {
    // If after trimming, content is empty, treat as no valid input.
    return ""; // Or throw new Error("No valid input found in /dev/stdin.");
  }

  // Split by newlines, then take the first line.
  const firstMeaningfulLine = trimmedContent.split('\n')[0];

  // Split the first line by any whitespace and filter out empty strings,
  // then return the very first non-empty token.
  const tokens = firstMeaningfulLine.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return ""; // No tokens found on the first line.
  }

  return tokens[0]; // The string we need for processing.
};

/**
 * Analyzes a given string to find the minimum absolute difference
 * between REFERENCE_TARGET_VALUE and any 3-digit number formed by its substrings.
 *
 * @param {string} sourceSequence The input string to analyze.
 * @returns {number} The smallest absolute difference found, or 0 if no valid substrings can be formed.
 */
const determineMinimumDeviation = (sourceSequence) => {
  // Define the fixed length for the numeric substrings we are interested in.
  const SUBSTRING_LENGTH = 3;

  // Basic validation: if the input string is too short, no 3-digit numbers can be formed.
  if (sourceSequence.length < SUBSTRING_LENGTH) {
    // In such cases, the "difference" is conventionally 0, as no comparison can be made
    // or it implies the target itself is the closest (a non-existent number).
    return 0;
  }

  // A collection to hold all the 3-character numeric strings extracted.
  const extractedNumericCandidates = [];

  // Iterate through the source string, extracting substrings of SUBSTRING_LENGTH.
  // The loop continues as long as there's enough characters left to form a full substring.
  for (let currentIndex = 0; currentIndex <= sourceSequence.length - SUBSTRING_LENGTH; ++currentIndex) {
    const currentSegment = sourceSequence.substring(currentIndex, currentIndex + SUBSTRING_LENGTH);
    extractedNumericCandidates.push(currentSegment);
  }

  // Initialize the variable to store the smallest difference found so far.
  // Start with a very large number to ensure the first comparison updates it.
  let currentMinimalDifference = Infinity;

  // Iterate over each extracted candidate string.
  for (const candidateText of extractedNumericCandidates) {
    // Convert the string segment into an integer for arithmetic comparison.
    // Use parseInt with radix 10 for explicit base conversion.
    const numericValue = parseInt(candidateText, 10);

    // Calculate the absolute difference between the candidate's value and the target.
    const absoluteDeviation = Math.abs(numericValue - REFERENCE_TARGET_VALUE);

    // If this deviation is smaller than the current minimum, update the minimum.
    if (absoluteDeviation < currentMinimalDifference) {
      currentMinimalDifference = absoluteDeviation;
    }
  }

  // Return the smallest absolute difference found across all candidates.
  return currentMinimalDifference;
};

// Execute the input acquisition and processing.
const mainInputString = acquirePrimaryInput();
const finalCalculatedResult = determineMinimumDeviation(mainInputString);

// Output the final result to standard output.
console.log(finalCalculatedResult);