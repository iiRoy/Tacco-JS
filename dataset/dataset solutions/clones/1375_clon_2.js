/*
 * This module processes multi-line input to find specific numeric combinations.
 * It reads data from standard input, parses each line, and calculates
 * the number of unique triplets (a, b, c) such that a < b < c and a + b + c equals a target value.
 */
function processInputData(inputRows) { // Primary routine to handle all input lines
  let rowIndex = 0; // Initialize an index to track the current input line
  for (;; rowIndex++) { // Loop indefinitely until a specific termination condition is met
    // Check for the termination sequence, which signals the end of input sets.
    if (inputRows[rowIndex] === '0 0') {
      break; // Exit the loop if the termination sequence is encountered
    }

    // Split the current line into its constituent numeric parts using whitespace as a delimiter.
    const parsedNumbers = inputRows[rowIndex].split(/\s+/);
    // The first number represents the upper bound for our combination elements.
    const upperLimit = parseInt(parsedNumbers[0], 10);
    // The second number is the target sum we are looking for.
    const targetSum = parseInt(parsedNumbers[1], 10);

    let validCombinationsCount = 0; // Initialize a counter for combinations that meet the criteria.

    // Begin the nested loops to find unique combinations of three distinct numbers.
    // The first component of the triplet.
    for (let firstComponent = 1; firstComponent <= upperLimit; firstComponent++) {
      // The second component must be greater than the first to ensure uniqueness and order.
      for (let secondComponent = firstComponent + 1; secondComponent <= upperLimit; secondComponent++) {
        // The third component must be greater than the second, maintaining strict ascending order.
        for (let thirdComponent = secondComponent + 1; thirdComponent <= upperLimit; thirdComponent++) {
          // Check if the sum of the three components equals the desired target sum.
          if (firstComponent + secondComponent + thirdComponent === targetSum) {
            validCombinationsCount++; // Increment the counter if a valid combination is found.
          }
        }
      }
    }
    // Output the total number of valid combinations found for the current input set.
    console.log(validCombinationsCount);
  }
}

// Array to store incoming data segments from standard input.
const dataBuffers = [];

// Set up an event listener to capture 'data' events from standard input.
process.stdin.on('data', function(dataSegment) {
  dataBuffers.push(dataSegment); // Append each received data segment to our buffer array.
});

// Set up an event listener for the 'end' event, which signifies the end of standard input.
process.stdin.on('end', () => {
  // Join all buffered data segments into a single string, then split by newline characters
  // to obtain an array of individual input lines.
  const inputLines = dataBuffers.join('').split('\n');
  // Pass the processed lines to our main routine for combination calculation.
  processInputData(inputLines);
});