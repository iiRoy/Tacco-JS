var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input data from standard input
var lineData = rawData.trim().split("\n"); // Process raw input: remove leading/trailing whitespace and split into an array of lines
var currentLineIdx = -1; // Initialize an index to keep track of the current line being processed

// Main loop to handle multiple test cases
while (true) {
   // Read the number of stones for the current test case.
   // The `- 0` converts the string to a number.
   var numStones = lineData[++currentLineIdx] - 0;

   // If the number of stones is 0, it signifies the end of input.
   if (numStones === 0) {
      break; // Exit the loop
   }

   var stoneValues = []; // Array to store the stone values for the current case
   // Populate the stoneValues array by reading 'numStones' lines
   while (numStones--) {
      stoneValues.push(lineData[++currentLineIdx] - 0); // Convert each line to a number and add to array
   }

   var processedValues = []; // Array to store the results of the stone processing logic
   var isFirstOfPair = false; // A boolean flag to alternate logic for pairs of stones

   // Iterate over each stone value to apply the processing logic
   stoneValues.forEach(function(currentVal, valIndex) {
      isFirstOfPair = !isFirstOfPair; // Toggle the flag for each stone

      // If it's the first stone of a conceptual pair
      if (isFirstOfPair) {
         processedValues.push(currentVal); // Simply add it to the processed array
      }
      // If it's the second stone of a conceptual pair
      else {
         // Check if the current stone value matches the last value in the processed array
         if (processedValues[processedValues.length - 1] === currentVal) {
            processedValues.push(currentVal); // If they match, add the current stone
         }
         // If the current stone value does not match the last value in the processed array
         else {
            processedValues.push(currentVal); // Add the current stone to the array
            valIndex--; // Decrement the index to start propagating changes backward from the previous element

            // Loop backward through the processed values to update them
            while (true) {
               // Stop if we've reached the beginning of the array or found a value that matches the current stone
               if (valIndex < 0 || processedValues[valIndex] === currentVal) {
                  break;
               }
               // If the value doesn't match, update it to the current stone's value
               else {
                  processedValues[valIndex] = currentVal;
                  valIndex--; // Move to the next previous element
               }
            }
         }
      }
   });

   var zeroCount = 0; // Initialize a counter for zero values

   // Iterate through the final processed values to count how many are zero
   processedValues.forEach(function(currentVal) {
      if (currentVal === 0) {
         zeroCount++; // Increment the counter if the value is zero
      }
   });

   console.log(zeroCount); // Output the total count of zeros for the current test case
}
