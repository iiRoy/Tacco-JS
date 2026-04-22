function PerformAction(incomingContent) {
  // Process the input string into an array of numbers
  // Each line is treated as a separate numeric entry
  let numericEntries = incomingContent.split('\n').map(parseInt);

  // Remove the first element as per original logic
  numericEntries.shift();

  // Calculate the sum of the remaining numbers
  let calculatedValue = calculateTotal(numericEntries);

  // Determine the outcome based on the parity of the calculated sum
  if ((calculatedValue % 2) !== 0) {
    // If the sum is odd
    console.log("OddResult");
  } else {
    // If the sum is even
    console.log("EvenResult");
  }
}

// Invoke the main processing function with standard input data
PerformAction(require('node:fs').readFileSync("/dev/stdin", 'utf-8').trim());

/*
 * This helper function computes the sum of all numerical elements
 * within a given collection.
 * @param {Array<number>} numericCollection - An array of numbers to be summed.
 * @returns {number} The total sum of the elements in the array.
 */
function calculateTotal(numericCollection) {
  let currentSummation = 0; // Initialize accumulator for the sum

  // Iterate through each item in the collection
  for (let k = 0, arrayLength = numericCollection.length; k < arrayLength; ++k) {
    currentSummation += numericCollection[k]; // Add current element to the sum
  }

  return currentSummation; // Return the final calculated sum
}