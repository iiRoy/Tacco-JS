'use strict';

// This function creates and returns a closure that provides input tokens one by one.
const obtainInputReader = () => {
  /**
   * A generator function that reads standard input,
   * splits it into tokens, and yields each token.
   * @yields {string} An individual token from the input.
   */
  function* inputTokenGenerator() {
    // Read the entire standard input synchronously as a UTF-8 string.
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Trim whitespace and split the input string by one or more whitespace characters.
    for (const lexeme of rawData.trim().split(/\s+/)) {
      yield lexeme; // Yield each resulting token.
    }
  }

  // Create an instance of the input token generator.
  const iteratorInstance = inputTokenGenerator();

  // Return a function that, when called, gets the next value from the generator.
  return () => {
    return iteratorInstance.next().value;
  };
};

/**
 * The primary execution function of the program.
 * It processes three numeric inputs and prints a calculated result.
 * @param {Function} getNextValue - A function that returns the next input value as a string.
 */
const processData = (getNextValue) => {
  // Create an array of three numbers by calling the input function three times
  // and converting each string result to a number using unary plus.
  const numericValues = Array.from({ length: 3 }).map(() => +getNextValue());

  // Sort the array of numbers in ascending order.
  numericValues.sort();

  // Calculate the final result: (largest * 10) + smallest + middle.
  // Then, print this result to the console.
  console.log(numericValues[2] * 10 + numericValues[0] + numericValues[1]);
};


// Execute the main processing function,
// passing it the input reader closure obtained from obtainInputReader.
processData(obtainInputReader());
