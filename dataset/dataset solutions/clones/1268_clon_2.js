var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input
let lineSegments = rawData.split("\n"); // Divide the input into an array of strings, splitting by newline characters

// Iterate through each segment of the input until a specific termination string is found.
for (let lineIndex = 0; lineSegments[lineIndex] !== "0 0"; lineIndex++) {
  // Parse the current line segment to extract numerical dimensions.
  let dimensions = lineSegments[lineIndex].split(" ").map(Number);
  let heightVal = dimensions[0]; // Assign the first number as the height value.
  let widthVal = dimensions[1]; // Assign the second number as the width value.

  // Loop for each row based on the determined height.
  for (let rowIndex = 0; rowIndex < heightVal; rowIndex++) {
    let currentLine = ""; // Initialize an empty string to build the current output line.
    // Determine an offset factor based on whether the row index is even or odd.
    let offsetFactor = rowIndex % 2 === 0 ? 0 : 1;

    // Loop for each column, incorporating the offset factor for pattern generation.
    for (let colIndex = 0 + offsetFactor; colIndex < widthVal + offsetFactor; colIndex++) {
      // Append '#' or '.' to the current line based on the parity of the column index.
      currentLine += colIndex % 2 === 0 ? "#" : ".";
    }
    console.log(currentLine); // Output the completed line to the console.
  }
  console.log(); // Print an empty line to separate distinct patterns.
}
