function executeProgram() {
  // This function checks if a sequence of numbers can be partitioned
  // into two strictly increasing subsequences (stacks).
  // It uses a depth-first search (DFS) approach.
  function checkSequence(currentNumbers, leftStack, rightStack) {
    // Base case: If all numbers have been processed, it's a valid partition.
    if (currentNumbers.length === 0) {
      return true;
    }

    // Attempt to place the first number of the current sequence
    // onto the left stack.
    // It must be greater than the top element of the left stack.
    const tryLeft =
      currentNumbers[0] > leftStack[0] &&
      checkSequence(
        currentNumbers.slice(1),
        [currentNumbers[0]].concat(leftStack), // Add to left stack
        rightStack
      );

    // If placing on the left stack didn't work, or if we want to try
    // placing on the right stack as an alternative.
    // It must be greater than the top element of the right stack.
    const tryRight =
      currentNumbers[0] > rightStack[0] &&
      checkSequence(
        currentNumbers.slice(1),
        leftStack,
        [currentNumbers[0]].concat(rightStack) // Add to right stack
      );

    // Return true if either placement leads to a valid partition.
    return tryLeft || tryRight;
  }

  // Declare variables for loop counter, number of test cases, and input lines.
  var
    idx,
    numTestCases = parseInt(rawData[0], 10), // Parse the first line as the count
    testCaseLines = rawData.slice(1); // Remaining lines are the test cases

  // Iterate through each test case.
  for (idx = 0; idx < numTestCases; idx++) {
    // Process each line: split by space, convert to floating-point numbers.
    const numbersForCheck = testCaseLines[idx].split(' ').map(parseFloat);

    // Call the DFS function with initial empty stacks (represented by [0]
    // to satisfy the 'greater than' condition for the first element).
    const isPossible = checkSequence(numbersForCheck, [0], [0]);

    // Output 'YES' or 'NO' based on the result.
    console.log(isPossible ? 'YES' : 'NO');
  }
}

// Global variable to accumulate input data.
var
  rawData = '';

// Set up standard input processing.
process.stdin.resume(); // Keep the process alive for input.
process.stdin.setEncoding('utf8'); // Expect UTF-8 encoded text.

// Event listener for incoming data chunks.
process.stdin.on('data', function(dataSegment) {
  rawData += dataSegment; // Append each chunk to the rawData string.
});

// Event listener for the end of input.
process.stdin.on('end', function() {
  // Once all input is received, split it into an array of lines.
  rawData = rawData.split('\n');
  // Execute the main program logic.
  executeProgram();
});
