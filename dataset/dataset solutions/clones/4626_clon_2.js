function ProcessInput(inputString) {
  // Divide the incoming text into separate lines
  const lineSegments = inputString.split("\n");

  // Extract the total number of elements from the first line
  const elementCount = parseInt(lineSegments[0], 10);

  // Parse the second line, splitting by spaces and converting each part to an integer
  const numericValues = lineSegments[1].split(" ").map(currentElement => parseInt(currentElement, 10));

  // Initialize variables for the running total, the count of operations, and a record of past totals
  let currentSum = 0;
  let operationTally = 0;
  const sumHistory = [];

  // Iterate through each number in the input array
  for (let loopIndex = 0; loopIndex < elementCount; loopIndex++) {
    // Add the current numeric value to the running total
    currentSum += numericValues[loopIndex];

    // Special handling for the very first element in the sequence
    if (loopIndex === 0) {
      // If the running total is zero at this initial step
      if (currentSum === 0) {
        // Check if the subsequent element is non-negative
        if (numericValues[loopIndex + 1] >= 0) {
          // Adjust the running total based on the next element
          currentSum -= (numericValues[loopIndex + 1] - 1);
          // If the total becomes zero after adjustment, decrement it further
          if (currentSum === 0) {
            currentSum--;
          }
          // Add the absolute value of the adjusted total to the operation count
          operationTally += Math.abs(currentSum);
        } else {
          // If the subsequent element is negative, apply a different adjustment
          currentSum += (Math.abs(numericValues[loopIndex + 1]) - 1);
          // If the total becomes zero after this adjustment, increment it
          if (currentSum === 0) {
            currentSum++;
          }
          // Add the adjusted total to the operation count
          operationTally += currentSum;
        }
      }
    } else {
      // For all elements after the first one
      // Examine the sign of the previous running total from the history
      if (sumHistory[loopIndex - 1] > 0) {
        // If the previous total was positive and the current total is non-negative
        if (currentSum >= 0) {
          // Increment the operation count and modify the current total to make it negative
          operationTally += (currentSum + 1);
          currentSum -= (currentSum + 1);
        }
      } else {
        // If the previous total was non-positive and the current total is non-positive
        if (currentSum <= 0) {
          // Increment the operation count and modify the current total to make it positive
          operationTally += (Math.abs(currentSum) + 1);
          currentSum += (Math.abs(currentSum) + 1);
        }
      }
    }
    // Record the current running total in the history array
    sumHistory.push(currentSum);
  }

  // Display the final accumulated operation count
  console.log(operationTally);
}

// Read the entire content from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
