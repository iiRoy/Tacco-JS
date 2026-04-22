'use strict';

/**
 * Executes the primary computation on provided textual information.
 * @param {string} rawData - The raw input string to be processed.
 */
function ProcessInput(rawData) {

  const charList = rawData
    .trim()
    .split(''); // Breaks the input string into an array of characters.

  const limitVal = charList.length - 1; // Determines the maximum index for iterations.

  let finalResult = 0; // Stores the cumulative sum of all computed values.

  // Iterates through all possible bit configurations for partitioning the string.
  for (let maskValue = 0; maskValue < (1 << limitVal); maskValue++) {
    let segmentCollection = [charList[0]]; // Initializes with the first character.

    // Processes the remaining characters based on the current bitmask.
    for (let iterationIndex = 0; iterationIndex < limitVal; iterationIndex++) {
      const nextChar = charList[iterationIndex + 1]; // Retrieves the subsequent character.

      // If the corresponding bit is set, start a new segment.
      if (maskValue & (1 << iterationIndex)) {
        segmentCollection.push(nextChar);
      }
      // Otherwise, append the character to the last segment.
      else {
        segmentCollection[segmentCollection.length - 1] += nextChar;
      }
    }

    // Sums up the numerical values of the generated segments and adds to the total.
    finalResult += segmentCollection.reduce(
      (accumulator, stringValue) => accumulator + parseInt(stringValue, 10), // Converts each string part to an integer.
      0 // Starting value for the sum.
    );
  }

  // Displays the final calculated aggregate.
  console.log(finalResult);
}

// Invokes the processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));