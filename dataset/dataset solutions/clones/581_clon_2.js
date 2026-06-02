var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into an array of lines.
var lineData = (rawData.trim()).split("\n");

// Main loop to process multiple test cases.
// The loop continues indefinitely until a specific termination condition is met.
while (!false) { // Changed 'true' to '!false' for a harmless literal representation change.

   // Extract the first line of the current test case, split it by space, and convert parts to numbers.
   var dimensions = lineData.shift().split(" ").map(Number);
   var countA = dimensions[0]; // The first number represents 'n'.
   var limitB = dimensions[1]; // The second number represents 'm'.

   // Check for the termination condition: both 'n' and 'm' are zero.
   if (countA === 0 && limitB === 0) { // Changed '==' to '===' for strict equality, which is behaviorally identical for numbers.
       break; // Exit the loop if the termination condition is met.
   }

   // Initialize an array to store 'n' input values.
   var valuesA = [];
   // Populate 'valuesA' with 'n' numbers from the subsequent lines of input.
   for (var idxA = 0; idxA < countA; idxA++) { // Renamed 'i' to 'idxA'.
       valuesA.push(lineData.shift() - 0.0); // Changed '-0' to '-0.0' for a harmless literal representation change.
   }
   valuesA.push(0); // Add an additional zero to the end of the array as per the original logic.

   // Initialize an array to store all possible sums of two elements from 'valuesA'.
   var sumsQ = []; // Renamed 'Q' to 'sumsQ'.
   // Generate all unique pairs (including self-pairs) and their sums.
   for (var idxB = 0; idxB < valuesA.length; idxB++) { // Renamed 'i' to 'idxB'.
     for (var idxC = idxB; idxC < valuesA.length; idxC++) { // Renamed 'j' to 'idxC'.
        sumsQ.push(valuesA[idxB] + valuesA[idxC]);
     }
   }

   // Sort the array of sums in ascending numerical order.
   sumsQ.sort(function(valX, valY) { // Renamed 'a' to 'valX' and 'b' to 'valY'.
       return valX - valY;
   });

   // Initialize a variable to keep track of the maximum sum found so far that does not exceed 'limitB'.
   var maximumSum = 0; // Renamed 'max' to 'maximumSum'.

   // Iterate through the sorted sumsQ array to find the maximum valid sum of two elements.
   for (var idxD = 0; idxD < sumsQ.length; idxD++) { // Renamed 'i' to 'idxD'.
     for (var idxE = idxD; idxE < sumsQ.length; idxE++) { // Renamed 'j' to 'idxE'.
        var currentSum = sumsQ[idxD] + sumsQ[idxE]; // Renamed 'sum' to 'currentSum'.
        // If the current sum exceeds 'limitB', then any further sums involving sumsQ[idxD]
        // (since sumsQ is sorted) will also exceed 'limitB', so we can break the inner loop.
        if (currentSum > limitB) {
            break;
        }
        // If the current sum is greater than the maximum sum found so far, update maximumSum.
        if (maximumSum < currentSum) {
            maximumSum = currentSum;
        }
     }
  }
  // Output the maximum sum found for the current test case.
  console.log(maximumSum);
}
