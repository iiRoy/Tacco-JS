const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace,
// split into lines, and convert each line to a numerical value.
let numericLines = rawData.trim().split("\n").map(Number);

// Begin the main processing loop. This loop continues indefinitely
// until a specific termination condition is met.
while (true) {
  // Extract the first number from the 'numericLines' array.
  let currentValue = numericLines.shift();

  // Check for the termination condition: if the extracted value is 0,
  // exit the loop.
  if (currentValue === 0) {
    break;
  }

  // Initialize a boolean array, 'booleanFlags', with a size equal to 'currentValue'.
  // All elements are initially set to 'false'.
  let booleanFlags = [];
  for (let idx = 0; idx < currentValue; idx++) {
    booleanFlags[idx] = false;
  }

  // Populate 'booleanFlags' based on a mathematical operation:
  // For each index 'idx' from 1 up to 'currentValue' - 1,
  // set the element at (idx * idx) % currentValue to 'true'.
  for (let idx = 1; idx < currentValue; idx++) {
    booleanFlags[(idx * idx) % currentValue] = true;
  }

  // Create a new array, 'matchingIndices', to store the indices
  // where 'booleanFlags' contains a 'true' value.
  let matchingIndices = [];
  booleanFlags.forEach(function(element, index) {
    if (element) {
      matchingIndices.push(index);
    }
  });

  // Initialize 'resultCounts', an array that will store the final computed counts.
  let resultCounts = [];
  // Calculate 'halfLength', which is used for indexing and value adjustment.
  const halfLength = (currentValue - 1) / 2;

  // Fill 'resultCounts' with zeros up to and including the 'halfLength' index.
  for (let idx = 0; idx <= halfLength; idx++) {
    resultCounts[idx] = 0;
  }

  // Iterate through all unique pairs of elements in 'matchingIndices'.
  for (let idx = 0; idx < matchingIndices.length; idx++) {
    for (let innerIdx = idx + 1; innerIdx < matchingIndices.length; innerIdx++) {
      // Compute the difference between the current pair of indices.
      let difference = matchingIndices[idx] - matchingIndices[innerIdx];

      // If the difference is negative, adjust it by adding 'currentValue'
      // to ensure it's within the positive range [0, currentValue - 1].
      if (difference < 0) {
        difference += currentValue;
      }

      // If the 'difference' exceeds 'halfLength', adjust it by subtracting
      // it from 'currentValue'. This effectively mirrors the value.
      if (halfLength < difference) {
        difference = currentValue - difference;
      }

      // Increment the count for the calculated 'difference' by 2.
      resultCounts[difference] += 2;
    }
  }

  // Remove the first element from 'resultCounts' (the count for difference 0).
  resultCounts.shift();

  // Output each remaining count in 'resultCounts' to the console.
  resultCounts.forEach(function(element) {
    console.log(element);
  });
}
