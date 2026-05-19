'use strict';

// This function serves as the primary entry point for processing the input data.
const ProcessInput = (inputString) => {
  // Trim any leading/trailing whitespace from the input and split it into an array of lines.
  let lines = inputString.trim().split('\n');

  // Parse the first line to extract two numerical values: totalItems and blueItems.
  // The first number is 'n', representing the total number of items.
  let totalItems = lines[0].split(' ').map(Number)[0];
  // The second number is 'k', representing the number of blue items.
  let blueItems = lines[0].split(' ').map(Number)[1];

  // For context: 'blueItems' is 'k', and 'totalItems - blueItems' would be 'red items'.
  // console.log({ totalItems, blueItems }); // Debugging line, kept commented as in original.

  // Define the modulo value to be used in calculations, often a large prime number.
  const moduloValue = 1000000007; // Renamed from 'mod', value is identical to 1e9 + 7.

  /**
   * Computes the number of combinations (nCk), often read as "n choose k".
   * This function calculates 'upperBound' choose 'lowerBound'.
   * @param {number} upperBound - The total number of items available (n).
   * @param {number} lowerBound - The number of items to choose (k).
   * @returns {number} The result of the combination calculation.
   */
  const calculateCombinations = (upperBound, lowerBound) => {
    // An optimization for combinations (C(n, k) = C(n, n-k)) is commented out,
    // as it was not part of the original executable logic.
    // lowerBound = Math.min(lowerBound, upperBound - lowerBound);

    let numProduct = 1; // Variable to store the product for the numerator.
    let denProduct = 1; // Variable to store the product for the denominator.

    // Calculate the numerator part: upperBound * (upperBound - 1) * ... * (upperBound - lowerBound + 1)
    for (let idxA = upperBound; idxA > upperBound - lowerBound; idxA--) {
      numProduct *= idxA;
    }

    // Calculate the denominator part: lowerBound * (lowerBound - 1) * ... * 1 (i.e., lowerBound!)
    for (let idxB = lowerBound; idxB > 0; idxB--) {
      denProduct *= idxB;
    }

    // The combination result is the numerator divided by the denominator.
    let resultCombination = numProduct / denProduct;
    return resultCombination;
  };

  // Loop from 1 up to the number of blue items (inclusive).
  // In each iteration, 'currentCount' represents 'i' from the original problem.
  for (let currentCount = 1; currentCount <= blueItems; currentCount++) {
    // Calculate the specific combinatorial expression:
    // C(totalItems - blueItems + 1, currentCount) * C(blueItems - 1, currentCount - 1)
    let finalResult = calculateCombinations(totalItems - blueItems + 1, currentCount) *
                      calculateCombinations(blueItems - 1, currentCount - 1);

    // Apply the modulo operation to the result and round it to the nearest integer.
    finalResult = Math.round(finalResult % moduloValue);

    // Ensure that a result of -0 (which can occur with floating point modulo) is treated as 0.
    finalResult = (finalResult === -0) ? 0 : finalResult;

    // Print the calculated result for the current iteration to standard output.
    console.log(finalResult);
  }
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
