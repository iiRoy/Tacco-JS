// This module processes a series of numerical entries from an external source.
function analyzeNumbers(incomingString) {
   // Step 1: Convert the raw text input into an array of numerical values.
   // Each line in the input string is treated as a distinct number.
   let numericValues = incomingString
      .split("\n") // Break the input string into individual lines.
      .map((valueText) => Number(valueText)); // Transform each line string into its numerical equivalent.

   // Step 2: Store the first element, which often serves as a preliminary count or identifier.
   // This element is then removed from the main dataset.
   const initialCount = numericValues[0];
   numericValues.shift(); // Remove the initial element from the array.

   // Step 3: Identify the largest numerical value present in the current dataset.
   const greatestValue = Math.max.apply(
      null,
      numericValues
   ); // Determine the maximum number within the array.

   // Step 4: Find the zero-based index of this greatest value within the array.
   let peakIndex = numericValues.indexOf(greatestValue);

   // Step 5: Modify the highest value by halving it and updating it in its original position.
   numericValues[peakIndex] = numericValues[peakIndex] / 2;

   // Step 6: Compute the final aggregate sum of all numbers in the now-modified array.
   let aggregateResult = numericValues.reduce(
      (runningTotal, currentVal) => runningTotal + currentVal,
      0
   );

   // Step 7: Output the calculated total to the standard console.
   console.log(aggregateResult);
}

// Application entry point: Read data from standard input (e.g., a file) and initiate processing.
analyzeNumbers(
   require("fs").readFileSync("/dev/stdin", "utf8")
); // Retrieve file content and pass it to the primary data handler.