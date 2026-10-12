"use strict";

/**
 * This function processes an input string containing four space-separated integers.
 * It calculates the maximum possible product of any two numbers chosen from the first two
 * and the last two integers, respectively.
 *
 * @param {string} inputString - The raw string input, expected to contain four numbers.
 */
const processInput = (inputString) => {
  // First, remove any leading or trailing whitespace from the input.
  // Then, split the string into an array of string representations of numbers.
  // Finally, map each string representation to its integer equivalent.
  const [val1, val2, val3, val4] = inputString
    .trim()
    .split(' ')
    .map((currentValue) => {
      // Convert the string part to an integer, specifying base 10.
      return parseInt(currentValue, 10);
    });

  // Initialize a variable to store the largest product found so far.
  // We start with the product of the first and third values as an initial candidate.
  let maximumProduct = val1 * val3;

  // Check if the product of the first and fourth values is greater than the current maximum.
  // If it is, update maximumProduct.
  if (val1 * val4 > maximumProduct) {
    maximumProduct = val1 * val4;
  }

  // Check if the product of the second and third values is greater.
  // Update if a new maximum is found.
  if (val2 * val3 > maximumProduct) {
    maximumProduct = val2 * val3;
  }

  // Finally, check the product of the second and fourth values.
  // Update maximumProduct one last time if this product is the largest.
  if (val2 * val4 > maximumProduct) {
    maximumProduct = val2 * val4;
  }

  // Convert the final maximum product to a string and print it to the console.
  console.log(maximumProduct.toString());
};

// Read the entire content of the standard input stream as a UTF-8 encoded string.
// Then, pass this string to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
