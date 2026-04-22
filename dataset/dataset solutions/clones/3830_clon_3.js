"use strict";

/**
 * Executes the main program logic based on provided input data.
 * This function processes a string and an integer K to find the K-th lexicographically
 * smallest unique substring of the input string, considering substrings up to a maximum length.
 *
 * @param {string} rawInputPayload - The raw input data, typically from standard input.
 *                                   Expected format: "input_string\nK"
 */
const executeProgram = (rawInputPayload) => {
  // Define a constant for the maximum permissible substring length.
  // This helps in maintaining and modifying the logic more easily.
  const MAX_SUBSTRING_SEGMENT_LENGTH = 5;

  // --- Input Parsing and Validation ---
  // Split the raw input into individual lines.
  const inputLines = rawInputPayload.trim().split("\n");

  // Extract the primary string from the first line of input.
  const sourceString = inputLines[0];
  // Determine the length of the source string for efficient iteration.
  const sourceLength = sourceString.length;

  // Parse the integer K from the second line. Using Number() for type conversion.
  const targetRank = Number(inputLines[1]);

  // Basic validation for the target rank. If it's non-positive,
  // there's no valid K-th element to find.
  if (targetRank <= 0) {
    console.log("Error: Target rank must be a positive integer.");
    return;
  }

  // --- Substring Generation and Collection ---
  // A Set is used to automatically handle uniqueness of collected substrings.
  const uniqueSubstringsCollection = new Set();

  // Iterate through all possible starting positions in the source string.
  for (let startPosition = 0; startPosition < sourceLength; startPosition++) {
    // For each starting position, generate substrings of varying lengths.
    // Lengths range from 1 up to MAX_SUBSTRING_SEGMENT_LENGTH.
    for (
      let currentSegmentLength = 1;
      currentSegmentLength <= MAX_SUBSTRING_SEGMENT_LENGTH;
      currentSegmentLength++
    ) {
      // Ensure the substring does not extend beyond the end of the source string.
      // The end index for substring() is exclusive, so it's startPosition + currentSegmentLength.
      if (startPosition + currentSegmentLength <= sourceLength) {
        // Extract the current substring.
        const currentSubstring = sourceString.substring(
          startPosition,
          startPosition + currentSegmentLength
        );
        // Add the extracted substring to our collection. The Set automatically handles duplicates.
        uniqueSubstringsCollection.add(currentSubstring);
      } else {
        // If extending further would go past the string end, break the inner loop
        // as no more valid substrings can be formed from this startPosition with increasing length.
        break;
      }
    }
  }

  // --- Sorting and Result Retrieval ---
  // Convert the Set of unique substrings into an array.
  const sortedUniqueSubstrings = Array.from(uniqueSubstringsCollection);

  // Sort the array lexicographically (alphabetically).
  sortedUniqueSubstrings.sort();

  // Check if the requested rank exists within the collected substrings.
  // If targetRank is larger than the number of unique substrings, it's an invalid request.
  if (targetRank > sortedUniqueSubstrings.length) {
    console.log(
      `Error: The requested rank (${targetRank}) exceeds the number of unique substrings found (${sortedUniqueSubstrings.length}).`
    );
    return;
  }

  // Retrieve the K-th (0-indexed: K-1) lexicographically smallest substring.
  const foundKthSubstring = sortedUniqueSubstrings[targetRank - 1];

  // --- Output ---
  // Print the final result to the console.
  console.log(foundKthSubstring);
};

/**
 * Helper function to read input from standard input.
 * This function abstracts the file system interaction.
 * @returns {string} The content read from /dev/stdin.
 */
const retrieveStandardInput = () => {
  return require("fs").readFileSync("/dev/stdin", "utf8");
};

// Initiate the program by calling the main execution function with standard input.
executeProgram(retrieveStandardInput());