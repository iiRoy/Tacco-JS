var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineSegments = rawData.trim().split("\n"); // Split input into lines and remove leading/trailing whitespace

// Main processing loop
while (true) {
   var currentLine = lineSegments.shift(); // Get the next line from the input array

   // Check for termination condition
   if (currentLine === "0 0 0 0 0") {
      break; // Exit loop if the termination string is found
   }

   // Combine current line with the next line, split by space, and convert to numbers
   var numericValues = (currentLine + " " + lineSegments.shift()).split(" ").map(Number);

   // Execute an anonymous function with the parsed numeric values as arguments
   (function(paramA, paramB, paramC, paramD, paramE, numA, numB, numC) {
      // Calculate an initial base result
      var resultVal = Math.floor(numC / paramD) * paramD * paramE;
      var remainderVal = numC % paramD; // Calculate the remainder

      // Define and execute a nested function for calculation option A
      var calcOptionA = (function(currentSum) {
         currentSum += remainderVal * paramC; // Add cost for remainder
         currentSum += numA * paramA + numB * paramB; // Add cost for remaining items
         return currentSum;
      })(resultVal); // Pass the initial result to option A

      // Define and execute a nested function for calculation option B
      var calcOptionB = (function(currentSumB, countA, countB) {
         // If the initial result was zero, special handling for remainder
         if (currentSumB === 0) {
            var extraUnits = (remainderVal === 0) ? 0 : paramD - remainderVal; // Calculate units to make a full 'd' block
            if (extraUnits > 0) {
               currentSumB += paramE * paramD; // Add cost for a full 'd' block
            }
            // Deduct 'extraUnits' from counts of A and B
            while (extraUnits--) {
               if (countB > 0) {
                  countB--;
               } else if (countA > 0) {
                  countA--;
               }
            }
            currentSumB += countA * paramA + countB * paramB; // Add cost for remaining items
            return currentSumB;
         }
         // If initial result was not zero, use a different calculation
         if (currentSumB !== 0) {
            return countA * paramA + countB * paramB + numC * paramE;
         }
      })(resultVal, numA, numB); // Pass initial result and counts to option B

      // Output the minimum of the two calculated options
      console.log(Math.min(calcOptionA, calcOptionB));

   }).apply(null, numericValues); // Apply the parsed numbers as arguments to the anonymous function
}
