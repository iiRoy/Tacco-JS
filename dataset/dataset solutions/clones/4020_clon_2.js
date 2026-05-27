// This utility function computes the sum of the individual digits of a given numerical value.
const digitSumCalculator = (numVal) => {
  // First, convert the numeric input into its string representation.
  // Then, split the string into an array of single-character strings (digits).
  // Finally, use the 'reduce' method to iterate through these digit characters,
  // converting each to an integer and accumulating their sum.
  return ('' + numVal).split('').reduce((currentSum, digitChar) => {
    // The '~~' operator is a compact way to perform a bitwise NOT twice,
    // effectively truncating a number to an integer or converting a string to an integer.
    return ~~currentSum + ~~digitChar;
  });
};

/**
 * The primary function responsible for processing an input value.
 * It iterates through a sequence of numbers derived from the input,
 * calculates the sum of digits for each, and identifies the highest sum found.
 *
 * @param {string} initialValue - The starting value provided as a string, which will be coerced to a number.
 */
function ProcessInput(initialValue) {
  // Declare and initialize a variable to store the maximum digit sum encountered during the process.
  let maximumSum = 0;

  // Begin a loop that iterates downwards.
  // The original loop 'for(i=input;i--;)' effectively starts processing from 'input - 1' down to '0'.
  // We replicate this behavior by initializing 'counter' to 'initialValue - 1' and continuing as long as 'counter' is non-negative.
  for (let counter = initialValue - 1; counter >= 0; counter--) {
    // For the current number in the iteration, calculate the sum of its digits.
    const currentDigitSum = digitSumCalculator(counter);

    // Compare the newly calculated digit sum with the current maximum.
    // If the current sum is greater, update 'maximumSum'.
    if (maximumSum < currentDigitSum) {
      maximumSum = currentDigitSum;
    }
  }

  // After the loop completes, output the final maximum digit sum to the standard console.
  console.log(maximumSum);
}

// Read the input from the standard input stream.
// The 'require("fs").readFileSync("/dev/stdin", "utf8")' call reads the entire content
// of '/dev/stdin' as a UTF-8 encoded string.
// This string input is then passed to the 'ProcessInput' function, where JavaScript's
// type coercion will convert it to a number as needed for arithmetic operations.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
