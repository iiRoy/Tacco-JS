function calculateDivisorCount(upperBound, thresholdValue) {
  // This nested function recursively counts divisors based on specific criteria.
  function recursiveDivisorCounter(currentDivisor) {
    // Base case: if the square of the current divisor exceeds the upper bound, stop.
    if (currentDivisor * currentDivisor > upperBound) {
      return 0;
    }

    // Check if currentDivisor is a divisor of upperBound and if the other divisor is less than 10.
    if (upperBound % currentDivisor === 0 && upperBound / currentDivisor < 10) {
      // Calculate the 'other' divisor.
      const otherDivisor = upperBound / currentDivisor;
      // Determine if 2 should be added (if conditions met) or 1 (otherwise).
      // The condition checks if (otherDivisor * 10 + currentDivisor) is less than thresholdValue
      // AND if currentDivisor is not equal to otherDivisor (to avoid double counting for perfect squares).
      return recursiveDivisorCounter(currentDivisor + 1) + (otherDivisor * 10 + currentDivisor < thresholdValue && otherDivisor !== currentDivisor ? 2 : 1);
    }
    // If currentDivisor is not a divisor or the other divisor is not less than 10, continue to the next divisor.
    else {
      return recursiveDivisorCounter(currentDivisor + 1);
    }
  }

  // Main logic for calculateDivisorCount:
  // If upperBound is less than 4, there are no valid divisors to count under the given rules.
  if (upperBound < 4) {
    return 0;
  }
  // Otherwise, start the recursive counting from 2 and add the result of calling
  // calculateDivisorCount for (upperBound - 1).
  else {
    return recursiveDivisorCounter(2) + calculateDivisorCount(upperBound - 1, thresholdValue);
  }
}

/**
 * Processes the input string, parses the parameters, and prints the calculated result.
 * @param {string} rawData - The raw input string, typically from standard input.
 */
function ProcessInput(rawData) {
  // Split the input string by space to get individual parameter strings.
  let processedData = rawData.split(" ");

  // Parse the first parameter as an integer with base 10.
  const firstParam = parseInt(processedData[0], 10);
  // Parse the second parameter as an integer with base 10.
  const secondParam = parseInt(processedData[1], 10);

  // Output the final computed value to the console, formatted as a decimal integer.
  console.log('%d', calculateDivisorCount(firstParam, secondParam));
}

// This line handles reading from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
