var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input
var lineSegments = rawData.split("\n"); // Divide the input into individual lines
var outputBuffer = ""; // Initialize an empty string to accumulate the final output

// Iterate through each processed line segment
for (var idx = 0; idx < lineSegments.length; idx++) {
  // Split the current line by spaces and convert parts to numerical values
  var dimensions = lineSegments[idx].split(" ").map(Number);

  // Extract height and width values from the parsed dimensions
  var heightVal = dimensions[0];
  var widthVal = dimensions[1];

  // Check for the termination condition: both height and width are zero
  if (heightVal === 0 && widthVal === 0) {
    break; // Exit the loop if the termination condition is met
  }

  // Construct a single row pattern consisting of asterisks and a newline character
  var rowPattern = Array(widthVal + 1).join("*") + "\n";

  // Append the repeated row pattern (heightVal times) to the output buffer
  outputBuffer += Array(heightVal + 1).join(rowPattern);

  // Add an additional newline character after each block of output
  outputBuffer += "\n";
}

// Display the accumulated output string to the console
console.log(outputBuffer);
