let collectedInputLines = [];

const consoleInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each incoming line of text from the standard input.
consoleInterface.on('line', (currentInputSegment) => {
  // Append the received line to our internal buffer for later processing.
  collectedInputLines.push(currentInputSegment);
});

// Event listener triggered when the input stream has ended.
consoleInterface.on('close', () => {
  // Verify that there is at least one line of input to process.
  if (collectedInputLines.length === 0) {
    console.error("Input processing terminated: No data lines were provided.");
    return; // Halt execution if no input.
  }

  // Attempt to parse the first line, which is expected to contain the total number of subsequent values.
  const expectedNumberCount = parseInt(collectedInputLines[0], 10);

  // Validate the parsed count to ensure it's a non-negative integer.
  if (isNaN(expectedNumberCount) || expectedNumberCount < 0) {
    console.error(`Input processing terminated: Invalid number count '${collectedInputLines[0]}' specified.`);
    return;
  }

  // Prepare a list of numeric values from the input, excluding the initial count line.
  // We take exactly 'expectedNumberCount' lines following the first one.
  const numericValuesForProcessing = collectedInputLines
    .slice(1, expectedNumberCount + 1) // Extract the relevant data lines.
    .map(str => parseInt(str, 10))     // Convert each string line to an integer.
    .filter(val => !isNaN(val));       // Discard any lines that did not parse to a valid number.

  // Initialize a counter for prime numbers found.
  let confirmedPrimeOccurrences = 0;

  // Iterate over the cleaned list of numbers to determine primality.
  for (const currentCandidate of numericValuesForProcessing) {
    // Invoke the primality test function for each candidate number.
    if (evaluatePrimality(currentCandidate)) {
      confirmedPrimeOccurrences++; // Increment the counter if the number is prime.
    }
  }

  // Display the final tally of prime numbers found to the standard output.
  console.log(confirmedPrimeOccurrences);
});

/**
 * Determines whether a given integer is a prime number.
 * A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.
 *
 * @param {number} inputNumber - The integer to be subjected to the primality test.
 * @returns {boolean} - Returns `true` if the `inputNumber` is prime, `false` otherwise.
 */
function evaluatePrimality(inputNumber) {
  // Preliminary validation: Ensure the input is a valid integer.
  // Non-numeric or non-integer inputs are not considered prime.
  if (typeof inputNumber !== 'number' || !Number.isInteger(inputNumber)) {
    // Optionally, could log an error or throw an exception here for strict validation.
    return false;
  }

  // Handle edge cases for primality:
  // Numbers less than or equal to 1 are, by definition, not prime.
  if (inputNumber <= 1) {
    return false;
  }
  // The number 2 is the smallest and only even prime number.
  if (inputNumber === 2) {
    return true;
  }
  // All other even numbers (greater than 2) are composite (not prime).
  if (inputNumber % 2 === 0) {
    return false;
  }

  // Optimized check for divisors:
  // We only need to test for odd divisors up to the square root of the input number.
  // Any factor greater than the square root would have a corresponding factor smaller than the square root.
  const upperDivisorLimit = Math.floor(Math.sqrt(inputNumber));

  // Loop through odd numbers starting from 3 up to the calculated limit.
  // If `inputNumber` is perfectly divisible by any of these, it is not prime.
  for (let potentialDivisor = 3; potentialDivisor <= upperDivisorLimit; potentialDivisor += 2) {
    if (inputNumber % potentialDivisor === 0) {
      return false; // Found a divisor, so the number is not prime.
    }
  }

  // If no divisors were found within the optimized range, the number is prime.
  return true;
}