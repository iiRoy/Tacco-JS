/**
 * Computes the prime factorization of a given positive integer.
 * This function is currently unused in the main program flow.
 * @param {number} inputNumber The number to factorize.
 * @returns {number[]} An array of prime factors.
 */
function primeDecomposition(inputNumber) {
  // Initialize the current divisor, starting from the smallest prime.
  let currentDivisor = 2;
  // Keep track of the value that still needs to be factored.
  let remainingValue = inputNumber;
  // This array will store all the prime factors found.
  const resultFactors = [];

  // Continue as long as there's a value greater than 1 to factor.
  while (remainingValue > 1) {
    // If the current divisor perfectly divides the remaining value,
    if (remainingValue % currentDivisor === 0) {
      // Divide the remaining value by this divisor.
      remainingValue /= currentDivisor;
      // Add the divisor to our list of factors.
      resultFactors.push(currentDivisor);
    } else {
      // If not divisible, try the next potential divisor.
      currentDivisor++;
    }

    // Optimization: If the square of the current divisor is greater than
    // the remaining value, it means the remaining value itself must be prime.
    if (currentDivisor ** 2 > remainingValue) {
      // Add the remaining value as the last prime factor.
      resultFactors.push(remainingValue);
      // Exit the loop as factorization is complete.
      break;
    }
  }
  // Return the collected prime factors.
  return resultFactors;
}

/**
 * Main entry point for processing input data.
 * Reads three numeric values from the first line of input and performs a calculation.
 * @param {string} rawData The raw input string, typically from stdin.
 */
function ProcessInput(rawData) {
  // Split the input string into an array of lines.
  rawData = rawData.split('\n');

  // If the last line is empty, remove it (common for Unix-style inputs).
  if (rawData[rawData.length - 1] === '') {
    rawData.pop();
  }

  // Parse the first line to extract three numeric values.
  // The '- 0' trick converts string to number.
  const firstVal = rawData[0].split(' ')[0] - 0;
  const secondVal = rawData[0].split(' ')[1] - 0;
  const thirdVal = rawData[0].split(' ')[2] - 0;

  // Perform a specific trigonometric calculation and print the result.
  // This calculation seems to convert radians to degrees (180/Math.PI)
  // and then computes the arctangent of a derived value.
  console.log(180 / Math.PI * Math.atan(firstVal * secondVal * secondVal / thirdVal / 2));
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
