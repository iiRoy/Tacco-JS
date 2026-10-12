'use strict';

// This function processes a raw input string to compute a specific numerical result.
const processInput = (rawData) => {
  // First, the input string is split by spaces and each part is converted to a number.
  const parsedValues = rawData.split(' ').map(currentVal => Number(currentVal));

  // Extract the key numerical parameters from the processed array.
  const startPoint = parsedValues[0]; // Represents the initial boundary for iteration.
  const endPoint = parsedValues[1];   // Represents the final boundary for iteration.
  const stepSize = parsedValues[2];   // Represents the increment value for certain operations.

  let totalCount = 0; // Initialize a variable to accumulate the final count.

  // Begin an outer loop that iterates from the start point up to and including the end point.
  for (let outerIndex = startPoint; outerIndex <= endPoint; outerIndex++) {
    // Check if the current outer index is perfectly divisible by the third parsed value (stepSize).
    if (outerIndex % parsedValues[2] === 0) {
      // If the condition is met, initiate an inner loop.
      // This inner loop also starts from the current outer index and goes up to the end point,
      // incrementing by the defined step size.
      for (let innerIndex = outerIndex; innerIndex <= endPoint; innerIndex += stepSize) {
        totalCount++; // Increment the counter for each successful step in the inner loop.
        outerIndex = innerIndex; // Crucially, update the outer loop's index to the inner loop's current index.
                                  // This effectively "jumps" the outer loop forward.
      }
    }
  }

  // After all iterations are complete, print the final accumulated count to the console.
  console.log(totalCount);
};

// The program execution starts here by reading input from standard input.
// The content of /dev/stdin is read as a UTF-8 string and passed to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
