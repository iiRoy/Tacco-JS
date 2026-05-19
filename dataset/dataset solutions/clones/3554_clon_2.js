'use strict';

/**
 * Processes the raw input data to calculate the greatest common divisor (GCD)
 * of absolute differences between numbers in a list and a target value.
 * @param {string} rawData - The input string containing N, X, and the list of numbers.
 */
function ProcessInput(rawData) {
  // Split the input string into lines and then parse the first line for N and X.
  const inputLines = rawData.split('\n');
  const firstLineParts = inputLines[0].split(' ');

  // Extract the count of elements and the target value.
  const countElements = Number(firstLineParts[0]);
  const targetValue = Number(firstLineParts[1]);

  // Parse the second line to create an array of absolute differences.
  // Each number in the list is converted to its absolute difference from the target value.
  let diffsArray = inputLines[1].split(' ').map(numStr => Math.abs(Number(numStr) - targetValue));

  // Sort the array of differences in ascending order.
  // This is not strictly necessary for GCD calculation but matches the original structure.
  diffsArray.sort((a, b) => (a > b ? 1 : -1));

  /**
   * Calculates the greatest common divisor (GCD) of two non-negative integers
   * using the Euclidean algorithm.
   * @param {number} valA - The first integer.
   * @param {number} valB - The second integer.
   * @returns {number} The GCD of valA and valB.
   */
  const calculateGCD = (valA, valB) => {
    if (valB === 0) {
      return valA;
    } else {
      return calculateGCD(valB, valA % valB);
    }
  };

  // Determine the final GCD based on the number of elements in the differences array.
  if (diffsArray.length === 1) {
    // If there's only one difference, that difference is the GCD.
    console.log(diffsArray[0]);
  } else {
    // If there are multiple differences, calculate the GCD iteratively.
    // Start with the GCD of the first two elements.
    let finalGCDResult = calculateGCD(diffsArray[0], diffsArray[1]);

    // Iterate through the rest of the array, updating the GCD.
    for (let idx = 2; idx < countElements; idx++) {
      finalGCDResult = calculateGCD(finalGCDResult, diffsArray[idx]);
    }
    // Output the final calculated GCD.
    console.log(finalGCDResult);
  }
}

// Read input from standard input, decode it as UTF-8, trim whitespace,
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
