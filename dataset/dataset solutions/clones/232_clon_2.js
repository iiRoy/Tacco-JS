var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input.

var lineData = (rawData.trim()).split("\n"); // Trim whitespace and split the input into an array of lines.

// Loop through each entry in the processed line data.
for (var idx = 0; idx < lineData.length; idx++) {
   // Convert the current line to a numeric value, then increment it.
   var numVal = (lineData[idx] - 0) + 1;

   // Calculate a specific value using the formula 0.5 * N * (N - 1).
   var calcResult = 0.5 * numVal * (numVal - 1);

   // Print the calculated result plus one to the console.
   console.log(calcResult + 1);
}
