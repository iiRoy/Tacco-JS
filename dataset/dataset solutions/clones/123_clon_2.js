function findArrangements(
  accumulatedValue,
  startDigit,
  totalDigits,
  desiredTotal,
  currentLevel
) {
  // Base case: If we've reached the required depth for placing digits
  if ( (totalDigits - 1) === currentLevel ) {
    // Check if the final digit can complete the sum within valid range (0-9)
    if ( (startDigit <= (desiredTotal - accumulatedValue)) && ((desiredTotal - accumulatedValue) <= 9) ) {
      return 1; // One valid combination found
    }
    return 0; // No valid combination for this specific path
  }

  let resultCount = 0; // Counter for valid permutations

  // Iterate through possible digit values for the current position
  for ( let digitValue = startDigit; digitValue <= 9; digitValue++ ) {
    // Optimization: If adding the current digit already exceeds the target sum,
    // further digits in this branch will also exceed it, so we can stop.
    if ( (accumulatedValue + digitValue) > desiredTotal ) {
      break;
    }
    // Recursively explore combinations for the next level
    resultCount += findArrangements(
      accumulatedValue + digitValue,
      digitValue + 1,
      totalDigits,
      desiredTotal,
      currentLevel + 1
    );
  }

  return resultCount; // Return the aggregate count for this branch
}

// Wrapper function to handle asynchronous standard input processing
function setupInputHandler (mainLogicFunction) {
  let bufferedInput = ''; // Buffer to store all incoming data

  process.stdin.resume(); // Keep the process alive for input
  process.stdin.setEncoding('utf8'); // Set encoding for text data

  // Event listener for incoming data chunks
  process.stdin.on('data', function (inputPiece) {
    bufferedInput += inputPiece; // Append current chunk to buffer
  });

  // Event listener for end of input stream
  process.stdin.on('end', function () {
    mainLogicFunction(bufferedInput); // Execute the main logic with the complete input
  });
}

// Initiate the application's primary logic after input acquisition
setupInputHandler(function (rawInputData) {
  rawInputData
    .trim() // Remove leading/trailing whitespace from the entire input
    .split('\n') // Split the input into individual lines
    .forEach(function (currentLineText) {
      const lineSegments = currentLineText.split(' '); // Split each line by space to get number and sum
      const digitCountStr = lineSegments[0]; // First part is the count of digits (as string)
      const targetSumStr = lineSegments[1]; // Second part is the target sum (as string)

      // Check for termination condition: '0 0'
      if ( (digitCountStr === '0') && (targetSumStr === '0') ) {
        return; // Stop processing further lines
      }

      // Output the calculated number of distinct arrangements
      console.log(
        findArrangements(
          0, // Initial accumulated sum
          0, // Starting digit for the first position
          +digitCountStr, // Convert string digit count to number
          +targetSumStr,  // Convert string target sum to number
          0  // Initial recursion level
        )
      );
    });
});