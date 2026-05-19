var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data by trimming whitespace and splitting into individual lines.
var lineSegments = rawData.trim().split("\n");

// The main processing loop continues as long as the first element of the lineSegments array is not '0'.
// This element is consumed (shifted) at the beginning of each iteration.
while (lineSegments.shift() != 0) {

   // Extract the current set of numbers for this test case from the next line.
   // These numbers are space-separated.
   var currentNumbers = lineSegments.shift().split(" ");

   // A boolean flag to track if a clear winner has been identified in the current test case.
   var winnerFound = false;

   // An object to store the frequency (counts) of each number encountered.
   var numberCounts = {};

   // Iterate through each number in the current test case.
   for (var idx = 0; idx < currentNumbers.length; idx++) {

      // Increment the count for the current number. If it's the first time seeing this number, initialize its count to 1.
      numberCounts[currentNumbers[idx]] = (numberCounts[currentNumbers[idx]] || 0) + 1;

      // Create an array to hold [count, number] pairs for sorting.
      var sortedCounts = [];

      // Populate the sortedCounts array from the numberCounts object.
      for (var keyVal in numberCounts) {
         sortedCounts.push([numberCounts[keyVal], keyVal]);
      }

      // Sort the pairs in descending order based on their counts (the first element of each pair).
      sortedCounts.sort(function(firstPair, secondPair) {
         return firstPair[0] < secondPair[0];
      });

      // If there's only one unique number encountered so far,
      // effectively set the second highest count to zero for the winner check.
      if (sortedCounts.length === 1) {
         sortedCounts[1] = [0];
      }

      // Check if the current leading number has a winning majority.
      // A winner is declared if its count (sortedCounts[0][0]) is greater than
      // the second highest count (sortedCounts[1][0]) plus the number of remaining elements to be processed.
      // The remaining elements are currentNumbers.length - (idx + 1).
      if (sortedCounts[0][0] > sortedCounts[1][0] + currentNumbers.length - (idx + 1)) {
         // Output the winning number and the index (plus one for 1-based counting) at which it was determined.
         console.log(sortedCounts[0][1], idx + 1);
         // Set the flag to true as a winner has been found.
         winnerFound = true;
         // Exit the inner loop since a winner is declared.
         break;
      }
   }

   // After iterating through all numbers (or breaking early),
   // if no winner was found, it means there's a TIE.
   if (winnerFound === false) {
      console.log("TIE");
   }
}
