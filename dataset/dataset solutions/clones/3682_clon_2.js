'use strict';

/**
 * This function processes raw input data to extract characters
 * from a source string at regular intervals.
 * @param {string} rawData - The complete input string, expected to be multi-line.
 */
function ProcessInput(rawData) {
  // Split the incoming data into individual lines.
  const inputLines = rawData.split('\n');

  // The first line contains the string from which characters will be extracted.
  const sourceString = inputLines[0];

  // The second line contains the step size, converted to a number.
  const extractionStep = Number(inputLines[1]);

  // Initialize an empty string to accumulate the extracted characters.
  let finalOutput = '';

  // Iterate through the source string, advancing by 'extractionStep' each time.
  for (let charIndex = 0; charIndex < sourceString.length; charIndex += extractionStep) {
    // Append the character at the current 'charIndex' to the result.
    finalOutput += sourceString.charAt(charIndex);
  }

  // Display the accumulated string to the standard output.
  console.log(finalOutput);
}

// Read the entire content from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and then pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
