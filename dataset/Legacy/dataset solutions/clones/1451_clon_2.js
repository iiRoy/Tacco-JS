var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineSegments = rawData.trim().split("\n"); // Split the input into lines, removing leading/trailing whitespace

// Parse the second line (index 1) into an array of numbers
var firstSet = lineSegments[1].split(" ").map(Number);

// Parse the fourth line (index 3) into another array of numbers
var secondSet = lineSegments[3].split(" ").map(Number);

var matchCount = 0; // Initialize a counter for matching elements

// Iterate over each element in the second set
secondSet.forEach(function(currentValue) {
   // Check if the current element exists in the first set
   if (firstSet.indexOf(currentValue) !== -1) {
      matchCount++; // Increment the counter if a match is found
   }
});

console.log(matchCount); // Output the total count of matches
