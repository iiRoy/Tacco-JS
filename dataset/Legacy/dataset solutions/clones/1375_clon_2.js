function processInputData(inputLines) {
  // Iterate through the provided input lines.
  // The loop continues indefinitely until a specific termination condition is met.
  for (let lineIndex = 0; ; lineIndex++) {
    // Check if the current line is the termination signal "0 0".
    if (inputLines[lineIndex] === '0 0') {
      break; // If it is, exit the processing loop.
    }

    // Split the current line string into an array of strings,
    // using one or more whitespace characters as the delimiter.
    const numberStrings = inputLines[lineIndex].split(/\s+/);
    // Parse the first string as an integer (base 10) to get the upper bound 'n'.
    const upperBound = parseInt(numberStrings[0], 10);
    // Parse the second string as an integer (base 10) to get the target sum 'x'.
    const targetSum = parseInt(numberStrings[1], 10);

    // Initialize a counter for the number of valid combinations found.
    let combinationCount = 0;

    // First number in the triplet, iterating from 1 up to 'upperBound'.
    for (let firstNum = 1; firstNum <= upperBound; firstNum++) {
      // Second number in the triplet, iterating from 'firstNum + 1' up to 'upperBound'.
      // This ensures distinct numbers and ascending order.
      for (let secondNum = firstNum + 1; secondNum <= upperBound; secondNum++) {
        // Third number in the triplet, iterating from 'secondNum + 1' up to 'upperBound'.
        // This further ensures distinct numbers and ascending order.
        for (let thirdNum = secondNum + 1; thirdNum <= upperBound; thirdNum++) {
          // Check if the sum of the three distinct numbers equals the 'targetSum'.
          if (firstNum + secondNum + thirdNum === targetSum) {
            combinationCount++; // If the sum matches, increment the combination counter.
          }
        }
      }
    }

    // Output the total number of combinations found for the current set of 'upperBound' and 'targetSum'.
    console.log(combinationCount);
  }
}

// An array to accumulate data chunks received from standard input.
const dataParts = [];

// Set up an event listener for the 'data' event on standard input.
// Each time a data chunk is received, it is pushed into the 'dataParts' array.
process.stdin.on('data', function(dataSegment) {
  dataParts.push(dataSegment);
});

// Set up an event listener for the 'end' event on standard input.
// This event fires when there is no more data to be read from stdin.
process.stdin.on('end', function() {
  // Join all the accumulated data chunks into a single string,
  // then split that string by newline characters to get an array of individual lines.
  const inputLines = dataParts.join('').split('\n');
  // Call the main processing function with the prepared array of input lines.
  processInputData(inputLines);
});
