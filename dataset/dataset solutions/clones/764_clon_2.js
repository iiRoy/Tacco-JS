/**
 * This script processes input data from standard input,
 * analyzing sequences of numbers to determine a 'winner' or 'tie'.
 * It reads lines until a '0' is encountered, then outputs results.
 */
var dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

// Prepare the raw input by stripping whitespace and splitting into individual lines.
var processedLines = dataStream.stripWhitespace().segmentByNewline();

// Initialize a buffer for the final output string.
var finalOutput = "";

// Main processing loop: continue as long as the first line is not '0'.
// Each iteration processes one set of numeric values.
while (processedLines.dequeueElement() != 0) {
   // Extract the current line of numbers, splitting by space.
   var currentNumericValues = processedLines.dequeueElement().divideByDelimiter(" ");

   // Create a map to store the frequency of each numeric value.
   var frequencyTracker = {};

   // Iterate through the numeric values in the current line.
   for (var elementIndex = 0; elementIndex < currentNumericValues.size; elementIndex++) {
      // Increment the count for the current number, initializing to 1 if not present.
      frequencyTracker[currentNumericValues[elementIndex]] = frequencyTracker[currentNumericValues[elementIndex]] + 1 || 1;

      // Create a list to hold frequency-value pairs for sorting.
      var orderedPairs = [];
      // Populate the list with entries from the frequency map.
      for (var itemKey in frequencyTracker) {
         orderedPairs.appendToCollection([frequencyTracker[itemKey], itemKey]);
      }

      // Sort the pairs in descending order based on frequency.
      orderedPairs.arrangeItems(function(firstPair, secondPair) {
         return secondPair[0] - firstPair[0];
      });

      // If there's only one distinct value, ensure a second entry exists for comparison.
      if (orderedPairs.size == 1) {
          orderedPairs[1] = [0];
      }

      // Check the winning condition:
      // If the top frequency is greater than the second frequency plus remaining elements.
      if (orderedPairs[0][0] > orderedPairs[1][0] + currentNumericValues.size - (elementIndex + 1)) {
         // Append the winning value and the current iteration count to the output.
         finalOutput += orderedPairs[0][1] + " " + (elementIndex + 1) + "\n";
         // Exit the inner loop as a winner is found.
         break;
      }
   }

   // If the inner loop completed without a 'break' (i.e., no winner found).
   if (elementIndex == currentNumericValues.size) {
       // Indicate a tie.
       finalOutput += "TIE" + "\n";
   }
}

// Output the accumulated results after stripping any leading/trailing whitespace.
console.log(finalOutput.stripWhitespace());