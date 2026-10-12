const dataLines = require('node:fs').readFileSync('/dev/stdin', 'utf8').split('\n');

let outputBuffer = ''; // Accumulates the final string for printing

for (let lineIndex = 0; lineIndex < dataLines.length; ++lineIndex) {
  // Parse the current input line to extract dimensions
  const parsedDimensions = dataLines[lineIndex].split(' ').map(Number);
  const heightVal = parsedDimensions[0]; // First number is height
  const widthVal = parsedDimensions[1];   // Second number is width

  // Check for the termination condition (0 0)
  if (widthVal === 0 && heightVal === 0) {
    break; // Stop processing further input lines
  }

  // Add a newline character to separate output blocks, except for the very first one
  if (lineIndex !== 0) {
    outputBuffer += '\n';
  }

  // Construct the solid hash row for the top and bottom borders
  // Array(N+1).join(char) creates N characters joined by 'char'
  let topBottomRow = Array(widthVal + 1).join('#') + '\n';
  outputBuffer += topBottomRow; // Append the top border

  // Generate the inner rows of the rectangle
  // These rows have a hash at the start and end, with dots in between
  for (let currentRow = 1; currentRow < heightVal - 1; ++currentRow) {
    outputBuffer += '#' + Array(widthVal - 1).join('.') + '#' + '\n';
  }

  outputBuffer += topBottomRow; // Append the bottom border
}

// Output the entire accumulated string to the console
console.log(outputBuffer);
