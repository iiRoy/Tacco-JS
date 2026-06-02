var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var dataLines = (rawData.trim()).split("\n"); // Split input into an array of lines

// Main processing loop
while (true) {
   // Get the next number from the array and convert it to a numeric type
   var targetValue = dataLines.shift() - 0;

   // If the value is zero, terminate the loop
   if (targetValue === 0) {
      break;
   }

   // Initialize minimum sum to a very large number
   var minimumSum = Infinity;

   // Loop for the first variable (z) from 0 to 100
   for (var iterZ = 0; iterZ <= 100; iterZ++) {
      // Loop for the second variable (y) from 0 to 1000
      for (var iterY = 0; iterY <= 1000; iterY++) {
         // Calculate the remaining value for x
         var remainingX = targetValue - (Math.pow(iterZ, 3) + Math.pow(iterY, 2));

         // If remainingX is negative, it means iterY is too large for the current iterZ,
         // so we can break from the inner loop and try the next iterZ.
         if (remainingX < 0) {
            break;
         }

         // Update the minimum sum found so far
         minimumSum = Math.min(minimumSum, iterZ + iterY + remainingX);
      }
   }
   // Output the calculated minimum sum for the current targetValue
   console.log(minimumSum);
}
