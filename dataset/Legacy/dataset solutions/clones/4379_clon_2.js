"use strict"; // Enforce strict parsing and error handling for cleaner code.

/**
 * Processes the given text to extract characters at even indices.
 * @param {string} rawData The input string to be processed.
 */
function processInput(rawData) {
  // Convert the incoming string into an array of individual characters.
  let charArray = rawData.split("");

  // Initialize an empty string to accumulate the selected characters.
  let resultString = "";

  // Iterate through the character array, selecting elements at even positions.
  // The loop runs up to half the length of the array, rounded up,
  // because we're skipping every other character.
  for (let idx = 0; idx < Math.ceil(charArray.length / 2); idx++) {
    // Append the character at the current even index (idx * 2) to the result string.
    resultString += charArray[idx * 2];
  }

  // Output the final constructed string to the console.
  console.log(resultString);
}

// Read the entire content from standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
