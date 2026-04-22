var inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw input string is first cleaned by removing any leading or trailing whitespace,
// then it is divided into an array of separate lines based on the newline character.
var dataRows = (inputContent.trim()).split("\n");

// Begin iterating through each individual data record provided in the input.
for (var currentLineIndex = 0; currentLineIndex < dataRows.length; currentLineIndex++) {
   // For the current line, split it by spaces and convert each resulting part into a numerical value.
   var parsedNumbers = dataRows[currentLineIndex].split(" ").map(Number);

   // Extract the two key numerical parameters from the parsed array for this specific problem instance.
   var limitValue = parsedNumbers[0];
   var targetTotal = parsedNumbers[1];

   // Check if the termination condition (both parameters being zero) has been met.
   if (limitValue === 0 && targetTotal === 0) {
      break; // If so, exit the main processing loop.
   }

   // Initialize a counter to keep track of valid combinations of three distinct numbers.
   var validCombinationCounter = 0;

   // Start the first loop to select the first number of the triplet.
   // This number ranges from 1 up to the defined limitValue.
   for (var firstComponent = 1; firstComponent <= limitValue; firstComponent++) {
      // Start the second loop to select the second number.
      // It must be greater than the firstComponent to ensure distinctness and avoid duplicates.
      for (var secondComponent = firstComponent + 1; secondComponent <= limitValue; secondComponent++) {
         // Implement an optimization: if the sum of the first two numbers already equals or exceeds
         // the targetTotal, no valid third number can exist (since numbers are positive and distinct).
         if (firstComponent + secondComponent >= targetTotal) {
            break; // Break from this inner loop and try a new secondComponent.
         }

         // Calculate the value that the third number must have to reach the targetTotal.
         var thirdComponent = targetTotal - (firstComponent + secondComponent);

         // Verify if the calculated third number is distinct from the second and within the allowed range.
         if (thirdComponent > secondComponent && thirdComponent <= limitValue) {
            validCombinationCounter++; // If all conditions are met, increment the counter.
         }
      }
   }
   // Output the final count of valid triplets found for the current set of parameters.
   console.log(validCombinationCounter);
}