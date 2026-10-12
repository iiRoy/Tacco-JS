'use strict';

/**
 * Processes the raw input string to compute the sum of all possible arithmetic expressions.
 * This function parses a numeric string, inserting plus signs in all possible ways,
 * and then sums the results of these expressions.
 *
 * @param {string} rawData The input string, typically read from standard input.
 */
function ProcessInput(rawData) {
  // Convert the input string into an array of individual characters.
  const charArray = rawData.trim().split('');

  // Calculate the number of potential positions where a '+' sign can be inserted.
  // This is one less than the total number of characters.
  const segmentCount = charArray.length - 1;

  // Initialize a variable to store the cumulative sum of all evaluated expressions.
  let totalSum = 0;

  // Iterate through all possible combinations of splits.
  // Each 'combinationIndex' represents a unique pattern of '+' insertions.
  // A bit set to 1 indicates a split, 0 indicates concatenation.
  for (let combinationIndex = 0; combinationIndex < (1 << segmentCount); combinationIndex++) {
    // Start building the segments with the very first character.
    let currentSegments = [charArray[0]];

    // Loop through the remaining characters to form segments based on the current combination.
    for (let segmentPosition = 0; segmentPosition < segmentCount; segmentPosition++) {
      const nextChar = charArray[segmentPosition + 1]; // Get the subsequent character.

      // Check if the bit corresponding to the current segment position is set.
      if (combinationIndex & (1 << segmentPosition)) {
        // If the bit is set, it signifies a split, so start a new number segment.
        currentSegments.push(nextChar);
      } else {
        // If the bit is not set, concatenate the character to the last existing segment.
        currentSegments[currentSegments.length - 1] += nextChar;
      }
    }

    // After forming all segments for the current combination, sum their integer values.
    // The 'reduce' method iterates through the segments, converting each to an integer
    // and adding it to the running total for this specific combination.
    totalSum += currentSegments.reduce((accumulator, currentValue) => accumulator + parseInt(currentValue, 10), 0);
  }

  // Print the final accumulated sum of all possible expressions to the console.
  console.log(totalSum);
}

// Read the input from standard input using Node.js 'fs' module and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
