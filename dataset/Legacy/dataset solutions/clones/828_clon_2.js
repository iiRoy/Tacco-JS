var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data by removing trailing newlines and splitting into an array of lines.
var lineSegments = (rawData.replace(/\n$/, "")).split("\n");

// Main processing loop: continues until a specific termination condition is met.
while (true) {
   // Extract the number of entries for the current block from the beginning of the line segments.
   // The `-0` converts the string to a number.
   var countOfEntries = lineSegments.shift() - 0;

   // If the count is zero, it signifies the end of input, so break the loop.
   if (countOfEntries === 0) {
      break;
   }

   // Initialize an array to store the calculated results for the current block.
   var resultsList = [];

   // Iterate through each entry in the current block.
   for (var idx = 0; idx < countOfEntries; idx++) {
      // Get the current line, split it by spaces, and store it in a temporary array.
      var currentLineParts = (lineSegments.shift()).split(" ");

      // The first part of the line is the entity's label.
      var entityLabel = currentLineParts.shift();

      // Convert the remaining parts of the array to numbers.
      currentLineParts = currentLineParts.map(Number);

      // Prepend the entity's label back to the array of numerical parameters.
      currentLineParts.unshift(entityLabel);

      // Use an immediately invoked function expression (IIFE) to calculate values based on parameters.
      // The parameters are passed using `apply` from the `currentLineParts` array.
      (function (labelParam, costParam, timeA, timeB, timeC, factorD, factorE, rateF, scaleS, multiplierM) {
         // Calculate the total duration based on the provided time components and factors.
         var totalDuration = timeA + timeB + timeC + ((factorD + factorE) * multiplierM);

         // Calculate the net profit.
         var netProfit = (rateF * scaleS * multiplierM) - costParam;

         // Add the entity's label and its calculated profit-to-duration ratio to the results list.
         resultsList.push([labelParam, netProfit / totalDuration]);
      }).apply(null, currentLineParts);
   }

   // Sort the results list.
   // Primary sort: descending by the profit-to-duration ratio.
   // Secondary sort: ascending by label (string comparison) if ratios are equal.
   resultsList.sort(function (itemOne, itemTwo) {
      if (itemOne[1] === itemTwo[1]) {
         return itemOne[0] > itemTwo[0]; // Sort labels alphabetically if ratios are identical
      } else {
         return itemTwo[1] - itemOne[1]; // Sort by ratio in descending order
      }
   });

   // Output the label of each item in the sorted results list.
   resultsList.forEach(function (outputItem) {
      console.log(outputItem[0]);
   });

   // Print a separator character after each block of output.
   console.log("#");
}
