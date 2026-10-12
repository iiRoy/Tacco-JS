"use strict";

/*
 * This script processes raw text data.
 * It extracts the first character of specific tokens and converts them to uppercase.
 */
function processInput(rawData) {
  // Split the incoming string by spaces, then transform each part.
  // For each part, take its initial character and convert it to uppercase.
  const processedTokens = rawData
    .trim() // Remove leading/trailing whitespace from the entire input.
    .split(' ') // Break the string into an array of substrings based on space delimiter.
    .map((tokenPart) => tokenPart[0].toUpperCase()); // For every substring, get its first character and make it uppercase.

  // Output the concatenated first three processed tokens to the console.
  console.log(processedTokens[0] + processedTokens[1] + processedTokens[2]);
}

// Read the content from standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
