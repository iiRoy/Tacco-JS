// Function to compute the factorial of a given integer.
function calculateFactorial(inputNumber) {
  // Initialize an accumulator for the product, starting with one.
  let productAccumulator = 1;

  // Iterate from 1 up to and including the provided input number.
  for (let loopIndex = 1; loopIndex <= inputNumber; loopIndex++) {
    // Multiply the current loop index into the running product.
    productAccumulator *= loopIndex;
  }

  // Return the final computed factorial value.
  return productAccumulator;
}

// Declare a global variable to store the factorial result,
// which will be used as an upper bound in the divisor counting function.
let globalFactorialResult;

// Function to count the number of divisors for a specified value.
// This function relies on the globally defined 'globalFactorialResult' for its loop limit.
function countDivisors(targetValue) {
  let divisorCount = 0; // Initialize a counter for the number of divisors found.

  // Loop from 1 up to (but not including) the global factorial result.
  // This range determines which potential divisors are checked.
  for (let divisorIterator = 1; divisorIterator < globalFactorialResult; divisorIterator++) {
    // Check if the target value is perfectly divisible by the current iterator.
    if (targetValue % divisorIterator === 0) {
      divisorCount++; // If it is, increment the divisor counter.
    }
  }

  // Return the total count of divisors found for the target value.
  return divisorCount;
}

// The main entry point function that processes the input and orchestrates the calculations.
function processInput(rawInputString) {
  // Extract the first line from the input string and convert it to a number.
  const parsedNumber = Number(rawInputString.split("\n")[0]);

  // An array of numbers, declared but not utilized in the current program logic.
  const unusedArray = [0, 3, 5, 7];
  let finalTally = 0; // Initialize a counter for the main processing logic.

  // Calculate the factorial of the parsed input number and store it in the global variable.
  globalFactorialResult = calculateFactorial(parsedNumber);

  // Iterate from 1 up to (but not including) the globally stored factorial result.
  for (let mainLoopIndex = 1; mainLoopIndex < globalFactorialResult; mainLoopIndex++) {
    // Check if the global factorial result is evenly divisible by the current loop index.
    if (globalFactorialResult % mainLoopIndex === 0) {
      // If it is a divisor, then check if the number of divisors for this 'mainLoopIndex'
      // (when counted using 'countDivisors') is exactly 75.
      if (countDivisors(mainLoopIndex) === 75) {
        finalTally++; // If both conditions are met, increment the main tally.
      }
    }
  }

  // Output the final calculated tally to the standard console.
  console.log(finalTally);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function to begin execution.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
