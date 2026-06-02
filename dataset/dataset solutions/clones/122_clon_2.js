var fileSystem = require('fs');

// This section handles reading input from standard input.
// It determines the size of the input, reads it into a buffer,
// converts it to a string, and then processes it into an array of lines.
var dataSize = fileSystem.fstatSync(process.stdin.fd).size;
var rawData = Buffer.alloc(dataSize); // Using Buffer.alloc for modern Node.js
var readBytes = fileSystem.readSync(process.stdin.fd, rawData, 0, dataSize, 0);
var linesOfInput = rawData.toString('utf8', 0, readBytes).trim().split('\n');

// Initiate the primary data processing routine.
processData();

/**
 * Main function to iterate through input lines and calculate combinations.
 * It processes each line until a specific termination condition is met.
 */
function processData() {
  for (var idx = 0, totalLines = linesOfInput.length; idx < totalLines; idx++) {
    // Check for the termination signal "0 0"
    if (linesOfInput[idx] === '0 0') {
      break;
    }

    // Split the current input line into its constituent parts
    var parts = linesOfInput[idx].split(' ');
    var firstNum = parseInt(parts[0], 10); // Parse the first number
    var secondNum = parseInt(parts[1], 10); // Parse the second number

    var foundCombinations = 0; // Initialize counter for valid combinations

    // Iterate downwards from 9 to the first number (inclusive)
    for (var currentDigit = 9; currentDigit >= firstNum; currentDigit--) {
      // Accumulate results from the recursive combination calculation function
      foundCombinations += calculateCombinations(currentDigit, secondNum - currentDigit, firstNum - 1);
    }
    // Output the total number of combinations found for the current input line
    console.log(foundCombinations);
  }
}

/**
 * Recursively calculates the number of combinations of digits that sum up to a target.
 * This function is designed to find combinations of distinct digits in decreasing order.
 *
 * @param {number} startVal The maximum digit allowed for the current step.
 * @param {number} remainingSum The sum that still needs to be achieved.
 * @param {number} remainingDigits The number of digits that still need to be chosen.
 * @returns {number} The count of valid combinations.
 */
function calculateCombinations(startVal, remainingSum, remainingDigits) {
  var comboCount = 0; // Initialize the count for this recursive call

  // Base case: If no more digits are needed and the sum is zero, a valid combination is found.
  if (remainingDigits === 0 && remainingSum === 0) {
    return 1;
  }

  // Pruning cases: If any parameter indicates an impossible state, return 0.
  if (startVal < 0 || remainingSum < 0 || remainingDigits < 0) {
    return comboCount;
  }

  // Recursive step: Try choosing the next digit, which must be less than startVal.
  // The loop iterates downwards to ensure digits are chosen in decreasing order.
  for (var digitIter = startVal - 1; digitIter >= remainingDigits - 1; digitIter--) {
    comboCount += calculateCombinations(digitIter, remainingSum - digitIter, remainingDigits - 1);
  }

  return comboCount;
}
