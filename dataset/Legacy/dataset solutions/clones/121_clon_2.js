// This JavaScript module processes input data to find combinations of digits that sum to a target value.
// It reads multiple lines of input, where each line specifies the number of digits (n) and the target sum (s).
(function(rawData) {
  // Prepare the input: remove any trailing newline character and then split the string into an array of lines.
  var linesOfData = rawData.replace(/\n$/, '').split('\n');

  // Continuously process input lines until a termination condition is met.
  while (true) {
    // Extract the first line from the array, split it by space, and convert each part to a number.
    var currentNumbers = linesOfData.shift().split(' ').map(Number);

    // The first number in the line represents the count of digits to use.
    var numDigits = currentNumbers.shift();
    // The second number represents the desired sum.
    var targetSum = currentNumbers.shift();

    // If both 'numDigits' and 'targetSum' are zero, it signifies the end of input.
    if (numDigits === 0 && targetSum === 0) {
      return; // Exit the immediately invoked function expression.
    }

    // Calculate the total number of valid combinations and print the result to the console.
    console.log(calculateCombinations(numDigits, targetSum));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read all input from standard input as a UTF-8 string.

/**
 * Initiates the recursive process to find combinations of unique digits (0-9) that sum up to a specific target.
 *
 * @param {number} numDigits - The total number of digits that must be used in each combination.
 * @param {number} targetSum - The sum that the chosen digits must equal.
 * @returns {number} The total count of distinct combinations found.
 */
function calculateCombinations(numDigits, targetSum) {
  // Start the recursive search for combinations, beginning with the digit 0.
  return recursiveSumFinder(0, numDigits, targetSum);
}

/**
 * A recursive helper function that explores combinations of digits.
 * It uses a backtracking-like approach, but with a specific modification
 * where the 'targetSum' is cumulatively reduced across iterations within the same loop.
 *
 * @param {number} startIndex - The smallest digit allowed to be picked in the current recursive call (inclusive, 0-9).
 * @param {number} numDigits - The remaining number of digits that still need to be selected.
 * @param {number} targetSum - The remaining sum that needs to be achieved with the 'numDigits' digits.
 * @returns {number} The count of valid combinations found from this particular state.
 */
function recursiveSumFinder(startIndex, numDigits, targetSum) {
  var combinationCount = 0; // Initialize a counter for combinations found in this branch.

  // Iterate through possible digits, starting from 'startIndex' up to 9.
  for (var currentDigit = startIndex; currentDigit < 10; currentDigit++) {
    // Subtract the current digit from the remaining target sum.
    // Note: 'targetSum' is modified in place for subsequent loop iterations within this function call.
    targetSum = targetSum - currentDigit;

    // Check if this is the last digit to be picked for the current combination.
    if (numDigits === 1) {
      // If it's the last digit and the remaining sum is exactly zero, a valid combination is found.
      if (targetSum === 0) {
        combinationCount++; // Increment the total count.
      }
    } else {
      // If more digits are required, make a recursive call:
      // - Start searching for the next digit from 'currentDigit + 1' (to ensure unique, increasing digits).
      // - Decrement 'numDigits' as one digit has been chosen.
      // - Pass the updated 'targetSum'.
      combinationCount += recursiveSumFinder(currentDigit + 1, numDigits - 1, targetSum);
    }
  }
  // Return the total count of combinations found in this recursive branch.
  return combinationCount;
}
