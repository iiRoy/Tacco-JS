var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input
// Process the raw input: trim whitespace and divide into individual lines
var lineSegments = (rawData.trim()).split("\n");

// Extract the first line, split it by space, and convert parts to numbers
var params = (lineSegments.shift()).split(" ").map(Number);

// Assign the first number as the iteration count
var count = params[0];
// Assign the second number as the comparison threshold
var threshold = params[1];

// Initialize a default string value
var resultString = "kogakubu10gokan";

// Iterate through the remaining lines based on the 'count' variable
for (var idx = 0; idx < count; idx++) {
   // Split the current line into its constituent parts
   var currentLineParts = lineSegments[idx].split(" ");
   // Convert the first part of the current line to a numeric value
   var numericValue = currentLineParts[0] - 0; // A common trick to convert to number

   // Check if the numeric value is less than or equal to the defined threshold
   if (numericValue <= threshold) {
      // If the condition is met, update the result string with the second part of the current line
      resultString = currentLineParts[1];
   }
}

// Output the final determined string to the console
console.log(resultString);
