"use strict"; // Enforce strict parsing and error handling in the script.

/**
 * Computes the greatest common divisor (GCD) for a list of numbers.
 * This function iterates through the provided array, calculating the GCD
 * of the current result with the next element.
 * @param {number[]} numberList - An array of integers.
 * @returns {number} The GCD of all numbers in the list.
 */
const calculateCommonDivisorForList = (numberList) => {
  let listLength; // Variable to store the total number of elements.
  let currentDivisor; // Holds the running GCD value.
  let nextNumber; // Stores the next number from the array for GCD calculation.

  listLength = numberList.length; // Determine the size of the input array.
  currentDivisor = numberList[0]; // Initialize the GCD with the first element.

  // Loop through the array starting from the second element.
  for (let idx = 1; idx < listLength; idx++) {
    nextNumber = numberList[idx]; // Get the current element.
    currentDivisor = findGreatestCommonDivisor(currentDivisor, nextNumber); // Update the GCD.
  }

  return currentDivisor; // Return the final computed GCD.
};

/**
 * Recursively calculates the greatest common divisor (GCD) of two numbers
 * using the Euclidean algorithm.
 * @param {number} firstNum - The first integer.
 * @param {number} secondNum - The second integer.
 * @returns {number} The GCD of the two input numbers.
 */
const findGreatestCommonDivisor = (firstNum, secondNum) => {
  // If the first number is non-zero, recurse with (secondNum % firstNum, firstNum).
  // Otherwise, the second number is the GCD.
  return firstNum ? findGreatestCommonDivisor(secondNum % firstNum, firstNum) : secondNum;
};

/**
 * Main function to process input, perform calculations, and output the result.
 * It reads N and K, an array A, then determines if K can be reached.
 * @param {string} inputData - The raw input string from stdin.
 */
const processInputAndSolve = (inputData) => {
  // Clean and split the input string into lines.
  inputData = inputData.trim().split("\n");

  // Parse N and K from the first line of input.
  const countOfElements = parseInt(inputData[0].split(" ")[0]); // N
  const targetValue = parseInt(inputData[0].split(" ")[1]); // K

  // Parse the array A from the second line, convert to numbers, and sort in descending order.
  let numericArray = inputData[1].split(" ").map((item) => parseInt(item)).sort((valA, valB) => valB - valA);

  // Get the largest element from the sorted array.
  const maximumElement = numericArray[0];
  // Calculate the GCD of all elements in the array.
  let computedGcd = calculateCommonDivisorForList(numericArray);

  // Check if the maximum element is less than the target value K.
  if (maximumElement < targetValue) {
    console.log("IMPOSSIBLE"); // If so, K cannot be reached.
    return; // Exit the function early.
  }

  // Determine if K is a multiple of the computed GCD.
  // If K % computedGcd is 0, it's POSSIBLE; otherwise, it's IMPOSSIBLE.
  console.log(targetValue % computedGcd === 0 ? "POSSIBLE" : "IMPOSSIBLE");
};

// Read input from standard input and pass it to the main processing function.
processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
