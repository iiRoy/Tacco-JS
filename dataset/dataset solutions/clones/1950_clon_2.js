"use strict";

// This script processes input data to find specific numeric patterns.
function primaryFunction(inputData) {
  // Extract the first line of the input string after trimming whitespace.
  let inputString = inputData.trim().split("\n")[0];
  let occurrenceCount = 0; // Initialize a variable to count valid occurrences.

  // Iterate through possible starting positions for substrings.
  for (let outerIndex = 0; outerIndex < inputString.length - 4; outerIndex++) {
    // Iterate through possible ending positions for substrings, ensuring minimum length.
    for (let innerIndex = outerIndex + 4; innerIndex < inputString.length + 1; innerIndex++) {
      // No debug output here, just processing.
      // Check if the numeric value of the substring is divisible by 2019.
      if (Number(inputString.slice(outerIndex, innerIndex)) % 2019 === 0) {
        occurrenceCount++; // Increment the counter if the condition is met.
      }
    }
  }
  // Output the final tally of valid substrings.
  console.log(occurrenceCount);
}

// Execute the main processing function with data read from standard input.
primaryFunction(require('fs').readFileSync('/dev/stdin', 'utf8'));

// This auxiliary function finds the number of non-overlapping occurrences of a pattern in a source string.
function findOccurrences(sourceText, searchPattern) {
  let matchCount = 0; // Initialize a counter for found matches.
  let startIndex = 0; // Keep track of the starting position for the next search.

  // Loop indefinitely until no more matches are found.
  for (;;) {
    // Find the next occurrence of the pattern starting from startIndex.
    let foundPosition = sourceText.indexOf(searchPattern, startIndex);
    if (foundPosition < 0) {
      // If no more occurrences are found, return the total count.
      return matchCount;
    }
    if (foundPosition >= 0) {
      // If an occurrence is found, increment the counter.
      matchCount++;
      // Update the starting position for the next search to be after the current match.
      startIndex = foundPosition + 1;
    }
  }
  // This return statement is technically unreachable due to the infinite loop with an internal return.
  return matchCount;
}
