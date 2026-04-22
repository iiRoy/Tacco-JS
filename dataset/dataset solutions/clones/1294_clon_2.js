let receivedContent = ""; // This variable will accumulate all incoming data from standard input.

// Initialize the environment for handling standard input.
systemRuntime.standardInput.startReception();
systemRuntime.standardInput.defineCharset('utf8'); // Set the character encoding for the input stream.

// Register a callback function to handle each chunk of data received.
systemRuntime.standardInput.subscribeToEvent('data', (dataPiece) => {
  receivedContent += dataPiece; // Append the new data fragment to the accumulated content.
});

// Register a callback function to execute once the standard input stream ends.
systemRuntime.standardInput.subscribeToEvent('end', () => {
  // Split the entire received content into individual lines.
  const allInputLines = receivedContent.split("\n");
  let lineIndex = 0; // Initialize an index to iterate through the input lines.

  // Loop through the input lines until a line containing '0' is encountered.
  // Note: The original code compared `input[i] != 0`. Since `input[i]` is a string,
  // we'll explicitly check against the string '0' or parse to number for comparison.
  // For Type II, preserving logic, we'll keep the loose comparison intent but make it explicit
  // by parsing if needed for numeric operations. Here, `input[i]` being '0' as a string is a common sentinel.
  while (allInputLines[lineIndex] !== '0') {
    // Parse the current line into an array of numbers, assuming space-separated values.
    const tokenArray = allInputLines[lineIndex].split(" ");

    // Check for the termination condition based on the first two numbers in the line.
    if (parseInt(tokenArray[0], 10) === 0 && parseInt(tokenArray[1], 10) === 0) {
      break; // Exit the loop if both numbers are zero.
    }

    let resultTally = 0; // Initialize a counter for valid combinations.
    const maxNumber = parseInt(tokenArray[0], 10); // The maximum value for numbers in the combination.
    const targetSum = parseInt(tokenArray[1], 10); // The target sum for the combination.

    // First nested loop: iterate for the first number.
    // Starts from 1 and goes up to (maxNumber - 2) to ensure there are at least two more distinct numbers.
    for (let firstVal = 1; firstVal <= maxNumber - 2; firstVal++) {
      // Second nested loop: iterate for the second number.
      // Starts from (firstVal + 1) to ensure distinct numbers and increasing order.
      for (let secondVal = firstVal + 1; secondVal <= maxNumber - 1; secondVal++) {
        // Third nested loop: iterate for the third number.
        // Starts from (secondVal + 1) to ensure distinct numbers and increasing order.
        for (let thirdVal = secondVal + 1; thirdVal <= maxNumber; thirdVal++) {
          // Check if the sum of the three distinct numbers equals the target sum.
          if (firstVal + secondVal + thirdVal === targetSum) {
            resultTally++; // Increment the counter if a valid combination is found.
          }
        }
      }
    }
    outputHandler.displayMessage(resultTally); // Output the total count of valid combinations for the current line.
    lineIndex++; // Move to the next input line.
  }
});