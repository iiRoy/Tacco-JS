function findInSorted(sortedCollection, targetValue) {
  // Initialize pointers for the search range
  let startIndex = 0;
  let endIndex = sortedCollection.length;
  // Counter for the number of comparisons/iterations
  let iterationCount = 0;

  // Loop until the search range collapses
  while (true) {
    // If the start and end pointers meet, the element is not found
    if (startIndex === endIndex) {
      break;
    }

    // Increment the iteration counter
    iterationCount++;

    // Calculate the middle index of the current search range
    const middleIndex = Math.floor((startIndex + endIndex) / 2);

    // Check if the element at the middle index is our target
    if (sortedCollection[middleIndex] === targetValue) {
      return iterationCount; // Target found, return the count
    }

    // Adjust the search range based on comparison with the target value
    if (targetValue < sortedCollection[middleIndex]) {
      endIndex = middleIndex; // Target is in the left half
    } else {
      startIndex = middleIndex + 1; // Target is in the right half
    }
  }
  // If the loop finishes without finding the target, return the final iteration count
  return iterationCount;
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into lines
const lineSegments = rawData.trim().split("\n");

// Main processing loop
while (true) {
  // Get the number of elements for the current array from the input lines
  // The `-0` converts the string to a number
  const elementCount = lineSegments.shift() - 0;

  // If the element count is 0, it signifies the end of input
  if (elementCount === 0) {
    break;
  }

  // Initialize an empty array to store the current set of numbers
  const currentArray = [];

  // Populate the current array with `elementCount` numbers from the input lines
  for (let idx = 0; idx < elementCount; idx++) {
    currentArray.push(lineSegments.shift() - 0);
  }

  // Get the target value to search for from the input lines
  const searchKey = lineSegments.shift() - 0;

  // Perform the binary search and print the result to console
  console.log(findInSorted(currentArray, searchKey));
}
