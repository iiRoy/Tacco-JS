"use strict"; // Enforce strict parsing and error handling

/**
 * This function processes an input string, compares the ASCII/Unicode values
 * of its first two space-separated characters, and prints a comparison result.
 * @param {string} incomingText - The raw input string to be processed.
 */
function processInputData(incomingText) {
  // Split the input string by spaces and convert each part to its character code.
  // The 'map' function iterates over each segment, 'charItem' represents each segment.
  const processedCodes = incomingText.split(" ").map((charItem) => charItem.charCodeAt(0));

  // Extract the character code of the first segment.
  const firstCharacterCode = processedCodes[0];
  // Extract the character code of the second segment.
  const secondCharacterCode = processedCodes[1];

  // Perform a comparison between the two character codes.
  if (firstCharacterCode === secondCharacterCode) {
    // If they are identical, print an equality symbol.
    console.log("=");
  } else if (firstCharacterCode > secondCharacterCode) {
    // If the first is greater, print a 'greater than' symbol.
    console.log(">");
  } else {
    // Otherwise (if the first is less), print a 'less than' symbol.
    console.log("<");
  }
}

// Read the entire content from standard input synchronously and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
