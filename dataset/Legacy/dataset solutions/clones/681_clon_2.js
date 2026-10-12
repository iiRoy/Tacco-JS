var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input into individual lines
var lineData = (rawData.trim()).split("\n");

// Initialize a pointer to track the current line being processed
var linePointer = 0;

// Main processing loop: continues until a specific termination condition is met
while (true) {
  // Parse the current line for N and S values
  var currentConfig = lineData[linePointer].split(" ").map(Number);
  linePointer++; // Move to the next line for subsequent reads

  var elementCount = currentConfig[0]; // N: number of elements to read
  var sumThreshold = currentConfig[1]; // S: the target sum threshold

  // Termination condition: if both N and S are zero, exit the loop
  if (elementCount === 0 && sumThreshold === 0) {
    break;
  }

  // Array to store the numeric values for the current test case
  var numericValues = [];

  // Read 'elementCount' numbers from subsequent lines
  for (var readIndex = 0; readIndex < elementCount; readIndex++) {
    var parsedValue = lineData[linePointer] - 0; // Convert line string to number
    linePointer++; // Advance the line pointer
    numericValues.push(parsedValue); // Add the number to our list
  }

  // Sort the array in ascending order, which is crucial for the algorithm
  numericValues.sort(function(valA, valB) {
    return valA - valB;
  });

  // Initialize a counter for pairs that satisfy the condition
  var validPairCount = 0;

  // Iterate through the sorted array to find pairs
  for (var firstElementIndex = 0; firstElementIndex < elementCount; firstElementIndex++) {
    // For each element, iterate through the remaining elements to its right
    for (var secondElementIndex = firstElementIndex + 1; secondElementIndex < elementCount; secondElementIndex++) {
      // If the sum of the current pair exceeds the threshold
      if (numericValues[firstElementIndex] + numericValues[secondElementIndex] > sumThreshold) {
        // All subsequent pairs with 'firstElementIndex' will also exceed the sum
        // because the array is sorted. So, add the count of remaining elements
        // and break the inner loop.
        validPairCount += elementCount - secondElementIndex;
        break;
      }
    }
  }

  // Output the total count of valid pairs for the current test case
  console.log(validPairCount);
}
