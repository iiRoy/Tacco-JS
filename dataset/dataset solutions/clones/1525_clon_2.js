"use strict";

/**
 * This function serves as the primary entry point for processing input text.
 * It reads numerical data, performs calculations, and outputs the highest result.
 * @param {string} rawInputContent The complete raw string obtained from the input source.
 */
function HandleInputAndCompute(rawInputContent) {
  // First, sanitize the input: remove leading/trailing whitespace and split into individual lines.
  rawInputContent = rawInputContent.trim().split("\n");

  // The first line of input is expected to contain four space-separated numerical tokens.
  // JavaScript's multiplication operator will automatically coerce string values to numbers.
  const numericalTokens = rawInputContent[0].split(" ", 4);

  let firstNum = numericalTokens[0];
  let secondNum = numericalTokens[1];
  let thirdNum = numericalTokens[2];
  let fourthNum = numericalTokens[3];

  // An array to accumulate the results of various product calculations.
  let computedProducts = [];

  /**
   * A helper function designed to identify the greater of two numeric arguments.
   * This function is specifically tailored for use with array reduction methods.
   * @param {number} valOne The first numeric value for comparison.
   * @param {number} valTwo The second numeric value for comparison.
   * @returns {number} The larger of the two input numbers.
   */
  const determineLargestOfTwo = function (valOne, valTwo) {
    return Math.max(valOne, valTwo);
  };

  // Calculate all four possible products from the two pairs of numbers and store them.
  computedProducts.push(firstNum * thirdNum);
  computedProducts.push(firstNum * fourthNum);
  computedProducts.push(secondNum * thirdNum);
  computedProducts.push(secondNum * fourthNum);

  // Find the single largest value within the array of computed products using the reducer function.
  let finalMaximumValue = computedProducts.reduce(determineLargestOfTwo);

  // Print the ultimate maximum product to the standard output.
  console.log(finalMaximumValue);
}

// The following code block is responsible for reading from standard input and invoking the main processing function.
// It should not be altered as it manages the interaction with the execution environment.
HandleInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));