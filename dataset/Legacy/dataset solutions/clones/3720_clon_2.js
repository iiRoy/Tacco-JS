/*
 * This module processes incoming text data.
 * It counts occurrences of specific characters.
 */
function ProcessInput(rawData) {
  // The 'rawData' parameter holds the entire input string.
  // The original code had a commented-out line for splitting by newline,
  // but the active logic splits by individual characters.

  let finalCount = 0; // Initialize a counter for character analysis.

  // Convert the input string into an array of individual characters.
  rawData = rawData.split("");

  // Iterate over each character in the processed array.
  rawData.forEach(function(charItem) {
    // Check if the current character is a hyphen.
    if (charItem === '-') {
      // If it's a hyphen, decrement the counter.
      finalCount--;
    } else {
      // For any other character, increment the counter.
      finalCount++;
    }
  });

  // Output the final calculated count, followed by a newline.
  // The empty string "" is used for type coercion, ensuring string concatenation.
  console.log(finalCount + "" + '\n');
}

// Execute the main processing function.
// It reads the content of '/dev/stdin' synchronously as a UTF-8 string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// Another commented-out line from the original, for local file testing.
// ProcessInput(require('fs').readFileSync('./input.txt', 'utf-8'));
