function processInput(rawData) {
  // Declare a constant for the number of elements, parsed from the first line of input.
  const countElements = parseInt(rawData[0], 10);

  // Initialize an object to track the frequency of each number.
  let frequencyTracker = {};
  // Initialize a variable to keep track of the maximum number encountered in the input.
  let maxValue = 0;

  // Process the second line of input.
  // It's split by spaces, and each resulting string item is processed.
  rawData[1].split(" ").forEach(itemString => {
    // Convert the string item to a numerical value.
    const currentNumber = Number(itemString);
    // Increment the count for the current number in the frequency tracker.
    // If the number hasn't been seen before, initialize its count to 1.
    frequencyTracker[currentNumber] = (frequencyTracker[currentNumber] || 0) + 1;
    // Update the maximum value if the current number is larger.
    maxValue = Math.max(maxValue, currentNumber);
  });

  // Initialize the variable that will store the final calculated result.
  let finalResult = 1;

  // This object is declared and initialized but not used in the subsequent calculation.
  // It is preserved as per Type II cloning rules.
  const intermediateProducts = {};
  intermediateProducts[-1] = 1; // Assigning a value to an unused property.

  // Loop from 1 up to the maximum value found in the input.
  for (let loopIndex = 1; loopIndex <= maxValue; loopIndex++) {
    // Multiply the current result by the power of frequencies.
    // The base is the frequency of (loopIndex - 1), and the exponent is the frequency of loopIndex.
    // If a number is not present in the input, its frequency in `frequencyTracker` will be `undefined`.
    // `Math.pow(undefined, X)` or `Math.pow(X, undefined)` results in `NaN`.
    // This behavior is preserved from the original code.
    finalResult *= Math.pow(frequencyTracker[loopIndex - 1], frequencyTracker[loopIndex]);
    // Apply the modulo operation to keep the result within the specified range.
    finalResult %= 998244353;
  }

  // Output the final computed result to the console.
  console.log(finalResult);
}

// A cache object to store pre-calculated factorial values for memoization.
let factorialCache = {};

/**
 * Recursively calculates the factorial of a given positive integer.
 * It uses memoization to store and retrieve previously computed factorials,
 * improving performance for repeated calls with the same number.
 *
 * @param {number} num The integer for which to calculate the factorial.
 * @returns {number} The factorial of the input number.
 */
function calculateFactorial(num) {
  // Base case: The factorial of 1 is 1.
  if (num === 1) {
    return 1;
  }
  // Check if the factorial for 'num' is already stored in the cache.
  if (factorialCache[num]) {
    return factorialCache[num];
  }
  // If not in cache, calculate it recursively and store it before returning.
  return factorialCache[num] = num * calculateFactorial(num - 1);
}

// Read the entire input from standard input, decode it as UTF-8,
// split it into an array of strings by newline characters,
// and then pass this array to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
