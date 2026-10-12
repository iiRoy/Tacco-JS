var rawData = ""; // Initialize a string to accumulate input data

// Resume standard input stream and set its encoding
process.stdin.resume();
process.stdin.setEncoding('utf-8');

// Event listener for incoming data chunks
process.stdin.on('data', function(dataSegment) {
  rawData += dataSegment; // Append each chunk to the rawData string
});

// Event listener for the end of the input stream
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines
  let inputLines = rawData.split("\n");
  let lineIndex = 0; // Initialize an index to iterate through input lines

  // Loop through input lines until a line containing '0' is encountered
  while (inputLines[lineIndex] != 0) {
    // Split the current line by space to get two numbers
    let numPair = inputLines[lineIndex].split(" ");

    // Check for the termination condition (0 0)
    if (parseInt(numPair[0]) === 0 && parseInt(numPair[1]) === 0) {
      break; // Exit the loop if both numbers are zero
    }

    let solutionCount = 0; // Initialize a counter for valid combinations

    // Outer loop for the first number (firstNum)
    // It iterates from 1 up to (first value in numPair - 2)
    for (let firstNum = 1; firstNum <= parseInt(numPair[0]) - 2; firstNum++) {
      // Middle loop for the second number (secondNum)
      // It starts from firstNum + 1 up to (first value in numPair - 1)
      for (let secondNum = firstNum + 1; secondNum <= parseInt(numPair[0]) - 1; secondNum++) {
        // Inner loop for the third number (thirdNum)
        // It starts from secondNum + 1 up to the first value in numPair
        for (let thirdNum = secondNum + 1; thirdNum <= parseInt(numPair[0]); thirdNum++) {
          // Check if the sum of the three numbers equals the second value in numPair
          if (firstNum + secondNum + thirdNum === parseInt(numPair[1])) {
            solutionCount++; // Increment the counter if the condition is met
          }
        }
      }
    }
    // Output the total count of combinations for the current input line
    console.log(solutionCount);
    lineIndex++; // Move to the next input line
  }
});
