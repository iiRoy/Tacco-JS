// This script processes input to generate various patterns.

var sourceData =
  require('fs')
    .readFileSync(
      '/dev/stdin', // Target file for input stream
      'utf8'        // Character encoding for the input data
    );

// Process the raw input: remove leading/trailing whitespace and then split into an array of lines.
var inputLines = sourceData
  .trim()
  .split("\n");

// Initialize a string builder to accumulate all generated output.
let resultBuilder = "";

// Begin the main processing loop; it continues indefinitely until explicitly broken.
while (true) {
  // Extract the first line from the array and remove it for sequential processing.
  var currentSegment = inputLines.shift();

  // Check for the specific termination sequence "0 0".
  if (currentSegment === "0 0") {
    break; // Exit the loop if the termination condition is met.
  }

  // Parse the current line, which is expected to contain two space-separated numbers,
  // into an array of numeric dimensions.
  const sizePair = currentSegment
    .split(" ") // Divide the string by space
    .map(Number); // Convert each part to a numeric type

  // Construct a rectangular pattern of '#' characters based on the parsed dimensions.
  // sizePair[0] determines the height (number of rows).
  // sizePair[1] determines the width (number of '#' characters per row).
  resultBuilder += Array(sizePair[0] + 1)
    .join(
      (Array(sizePair[1] + 1) // Creates a string of 'width' '#' characters
        .join("#"))
      + "\n" // Each generated row is followed by a newline
    );

  // Append an additional blank line after each completed pattern.
  resultBuilder += "\n";
}

// Output the final accumulated string to the standard console.
// The .trim() method ensures that any final, unnecessary newline characters are removed.
console.log(resultBuilder.trim());