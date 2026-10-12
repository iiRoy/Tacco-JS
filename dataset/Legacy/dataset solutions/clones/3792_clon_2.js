'use strict'; // Enforce strict parsing and error handling.

/**
 * Processes raw input data to find the maximum number of common unique characters
 * between two halves of a string, split at various points.
 * @param {string} rawData - The complete input string, typically from stdin.
 */
function ProcessInput(rawData) {
  // Parse the total character count from the first line of input.
  const charCount = Number(rawData.split('\n')[0]);
  // Convert the second line of input into an array of individual characters.
  const charArray = rawData.split('\n')[1].split('');

  let uniqueLeftChars; // Stores unique characters from the left segment.
  let uniqueRightChars; // Stores unique characters from the right segment.
  let commonCharCount = 0; // Tracks the count of common unique characters for a given split.
  let overlapCounts = []; // Accumulates the common character counts for each split point.

  // Iterate through all possible split points for the character array.
  // The split index 'splitIndex' ranges from 1 to charCount - 1.
  for (let splitIndex = 1; splitIndex < charCount; splitIndex++) {
    // Extract the left segment and filter for unique characters.
    uniqueLeftChars = charArray.slice(0, splitIndex)
      .filter((currentElement, elementIndex, originalArray) => originalArray.indexOf(currentElement) === elementIndex);

    // Extract the right segment and filter for unique characters.
    uniqueRightChars = charArray.slice(splitIndex)
      .filter((currentElement, elementIndex, originalArray) => originalArray.indexOf(currentElement) === elementIndex);

    // Compare each unique character from the left segment with the unique characters from the right segment.
    for (let leftCharIndex = 0; leftCharIndex < uniqueLeftChars.length; leftCharIndex++) {
      // If a character from the left segment is found in the right segment, increment the common count.
      if (uniqueRightChars.some(rightChar => rightChar === uniqueLeftChars[leftCharIndex])) {
        commonCharCount++;
      }
    }
    // Store the calculated common character count for the current split.
    overlapCounts.push(commonCharCount);
    // Reset the counter for the next iteration.
    commonCharCount = 0;

    /*
    // Debugging outputs (commented out in original, so kept commented or removed)
    // console.log("Left segment unique:", uniqueLeftChars);
    // console.log("Right segment unique:", uniqueRightChars);
    // console.log("All overlap counts:", overlapCounts);
    */
  }

  // Output the maximum common character count found across all split points.
  console.log(Math.max.apply(null, overlapCounts));
}

// Read input from standard input, decode as UTF-8, remove leading/trailing whitespace, and pass to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
