function findPosition(dataArray, targetValue) {
  // Initialize search boundaries and iteration counter
  let startIndex = 0;
  let endIndex = dataArray.length;
  let iterationCount = 0;

  // Loop indefinitely until a break condition is met
  while (true) {
    iterationCount++; // Increment the counter for each iteration

    // If the start and end indices meet, the element is not found or the search space is exhausted
    if (startIndex === endIndex) {
      break;
    }

    // Calculate the middle index of the current search range
    const middleIndex = Math.floor((startIndex + endIndex) / 2);

    // Check if the element at the middle index is the target value
    if (dataArray[middleIndex] === targetValue) {
      return iterationCount; // Return the count if found
    }

    // Adjust search boundaries based on comparison with the target value
    if (targetValue < dataArray[middleIndex]) {
      endIndex = middleIndex; // Target is in the left half
    } else {
      startIndex = middleIndex + 1; // Target is in the right half
    }
  }
  return iterationCount; // Return the count even if not found (loop completed)
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split into lines
const lineData = rawData.trim().split("\n");

// Process multiple test cases
while (true) {
  // Get the number of elements for the current array, converting to a number
  const elementCount = lineData.shift() - 0;

  // If the element count is 0, it signifies the end of input
  if (elementCount === 0) {
    break;
  }

  // Initialize an empty array for the current test case
  const currentArray = [];

  // Populate the current array with 'elementCount' numbers from the input
  for (let idx = 0; idx < elementCount; idx++) {
    currentArray.push(lineData.shift() - 0);
  }

  // Get the target value for the binary search
  const searchTarget = lineData.shift() - 0;

  // Perform the binary search and print the result to console
  console.log(findPosition(currentArray, searchTarget));
}
