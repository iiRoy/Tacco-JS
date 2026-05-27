"use strict";

// Initiate the program by reading input from the standard input stream.
// The 'fs' module is used to read the file synchronously.
processInput(require("fs").readFileSync("/dev/stdin", "UTF-8"));

/**
 * Main function to process the input data and calculate the number of anagram pairs.
 * @param {string} rawData - The entire content read from stdin as a single string.
 */
function processInput(rawData) {
  // Split the raw input string into an array of individual lines.
  let processedLines = rawData.split("\n");

  // The first line of the input specifies the total count of strings to be processed.
  // Parse this value as an integer and remove it from the array of lines.
  const numStrings = parseInt(processedLines.shift());

  // Transform each string in the array:
  // 1. Convert it into an array of characters.
  // 2. Sort these characters alphabetically.
  // 3. Join the sorted characters back into a single string.
  // This standardization allows for easy comparison of anagrams (e.g., "abc" and "bca" both become "abc").
  processedLines = processedLines.map(currentStr =>
    currentStr
      .split("") // Break the string into an array of characters.
      .sort()    // Arrange characters in ascending order.
      .join("")  // Combine the sorted characters back into a string.
  );

  // Initialize a counter to keep track of the number of anagram pairs found.
  let matchCount = 0;

  // Use nested loops to compare every unique pair of strings.
  // The outer loop iterates from the first string up to the second-to-last.
  for (let idxA = 0; idxA < numStrings; idxA++) {
    // The inner loop starts from the string immediately following 'idxA'
    // to avoid redundant comparisons and comparing a string with itself.
    for (let idxB = idxA + 1; idxB < numStrings; idxB++) {
      // If the sorted versions of two strings are identical, they are anagrams.
      // Increment the counter for each such pair discovered.
      if (processedLines[idxA] === processedLines[idxB]) {
        matchCount++;
      }
    }
  }

  // Print the final count of anagram pairs to the console.
  console.log(matchCount);
}
