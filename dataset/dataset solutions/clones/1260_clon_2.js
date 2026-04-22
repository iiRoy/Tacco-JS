// This program reads numeric input pairs from standard input.
// Each pair represents dimensions (height and width) for a rectangular pattern.
// It generates and prints these patterns using asterisk characters.

var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw content from the specified input stream.

var lineSegments = sourceData.split("\n"); // Break the entire input into an array of separate text lines.

var finalOutput = ""; // Initialize an empty string buffer to build the complete output.

// Loop through each line segment obtained from the input.
for (var currentLineIdx = 0; currentLineIdx < lineSegments.length; currentLineIdx++) {

  // Process the current line: split by space and convert parts to numbers.
  var dimensionPair = lineSegments[currentLineIdx].split(" ").map(Number);

  // Extract the height and width values from the processed pair.
  var rowHeight = dimensionPair[0];
  var colWidth  = dimensionPair[1];

  // If both dimensions are zero, it signals the termination condition for input processing.
  if (rowHeight === 0 && colWidth === 0) {
    break;
  }

  // Construct a repeating string for a single row of the pattern.
  // It consists of 'colWidth' asterisks followed by a newline character.
  var horizontalPattern = Array(colWidth + 1).join("*") + "\n";

  // Append the full rectangular block (rowHeight repetitions of horizontalPattern) to the output buffer.
  finalOutput += Array(rowHeight + 1).join(horizontalPattern);

  // Add an extra newline character to separate distinct pattern blocks.
  finalOutput += "\n";
}

// Display the accumulated pattern string to the console.
console.log(finalOutput);