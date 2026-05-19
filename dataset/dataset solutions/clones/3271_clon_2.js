"use strict"; // Enforce strict mode for cleaner code execution.

/**
 * Processes the given raw input to determine if the target word can be formed.
 * @param {string} rawData - The complete raw input string, typically from standard input.
 */
function processInput(rawData) {
  // Split the entire input into an array of individual lines.
  const inputLines = rawData.split('\n');
  // The primary string to be analyzed is the first line of the input.
  let targetString = inputLines[0];
  // Cache the total character count of the target string for loop efficiency.
  const stringLength = targetString.length;

  // Iterate through all possible starting indices for a segment to be removed.
  for (let startIndex = 0; startIndex < stringLength; startIndex++) {
    // Iterate through all possible ending indices for the segment to be removed.
    // The 'endIndex' can go up to 'stringLength' to allow removing a suffix.
    for (let endIndex = startIndex; endIndex <= stringLength; endIndex++) {
      // Construct a new string by taking the part before 'startIndex'
      // and concatenating it with the part after 'endIndex'.
      // This effectively simulates removing the characters from 'startIndex' up to 'endIndex - 1'.
      let modifiedString = targetString.slice(0, startIndex) + targetString.slice(endIndex);

      // Check if the resulting string, after removal, matches the specific target word.
      if (modifiedString === 'keyence') {
        // If a match is found, print 'YES' to console and terminate the function.
        console.log('YES');
        return;
      }
    }
  }

  // If the loops complete without finding any combination that forms 'keyence',
  // print 'NO' to indicate no match was found.
  console.log('NO');
}

// Execute the main processing function by reading data from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Helper function to parse a string line containing space-separated numbers
 * into an array of integers.
 * @param {string} inputLine - A string where numbers are separated by whitespace.
 * @returns {number[]} An array containing the parsed integer values.
 */
function parseNumbers(inputLine) {
  // Split the input line by one or more whitespace characters,
  // then convert each resulting string segment into an integer.
  return inputLine.split(/\s+/).map(function (numStr) {
    return parseInt(numStr, 10); // Use radix 10 for explicit decimal parsing.
  });
}
