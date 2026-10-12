'use strict'; // Enforce strict mode for cleaner code.

/**
 * Main entry point function to process the input data.
 * It reads numbers, sorts them, and calculates their Greatest Common Divisor (GCD).
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function ProcessInput(rawData) {
  // Parse the raw string input into an array of numeric values.
  rawData = ParseNumericInput(rawData);

  // The first number in the input array represents the count of subsequent elements.
  let countElements = rawData.shift();

  // Sort the remaining numbers using a custom binary insertion sort algorithm.
  rawData = SortWithBinaryInsertion(rawData);

  // Assign the processed and sorted array to a more descriptive constant.
  const sortedNumbers = rawData;

  // Handle the special case where there is only a single number.
  if (countElements === 1) {
    console.log(sortedNumbers[0]); // Output that single number directly.
    return; // Terminate function execution.
  }

  // Initialize the greatest common divisor with the first element of the sorted array.
  let greatestCommonDivisor = sortedNumbers[0];

  // Iterate through the rest of the array to compute the GCD of all elements.
  for (let idx = 0; idx < countElements - 1; idx++) {
    // Continuously update the GCD using the next element in the array.
    greatestCommonDivisor = CalculateGCD(sortedNumbers[idx + 1], greatestCommonDivisor);
  }

  // Output the final calculated greatest common divisor.
  console.log(greatestCommonDivisor);
}

/**
 * Computes the Greatest Common Divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm.
 * @param {number} valA - The first integer.
 * @param {number} valB - The second integer.
 * @returns {number} The greatest common divisor of valA and valB.
 */
function CalculateGCD(valA, valB) {
  // Loop until one of the values becomes zero.
  while (!(valA === 0 || valB === 0)) {
    // If valA is greater, replace it with its remainder when divided by valB.
    if (valA > valB) {
      valA = valA % valB;
    } else {
      // Otherwise, replace valB with its remainder when divided by valA.
      valB = valB % valA;
    }
  }
  // The GCD is the non-zero value remaining, or zero if both were initially zero.
  const maxVal = Math.max(valA, valB);
  return maxVal; // Return the result.
}

/**
 * Parses a string containing numbers separated by spaces or newlines
 * into an array of integers.
 * @param {string} inputString - The string to parse.
 * @returns {number[]} An array of parsed integers.
 */
function ParseNumericInput(inputString) {
  let parsedNumbers = []; // Array to hold the extracted numbers.
  let currentIdx = 0; // Index for inserting into the parsedNumbers array.

  // Regular expression to find a sequence of digits, possibly preceded by a minus sign.
  const numPattern = /^-*\d+/;
  // Regular expression to find one or more spaces or newline characters.
  const spacePattern = / +|\n+/;

  // Continue processing as long as the input string is not empty.
  while (inputString.length > 0) {
    // Attempt to match a number at the beginning of the string.
    if (inputString.match(numPattern) !== null) {
      // If a number is found, convert it to an integer and store it.
      parsedNumbers[currentIdx] = parseInt(inputString.match(numPattern)[0]);
      // Remove the matched number from the input string.
      inputString = inputString.replace(numPattern, "");
      currentIdx++; // Move to the next index for the parsed numbers.
      continue; // Proceed to the next iteration of the loop.
    }

    // If no number was found, it must be whitespace; remove it.
    inputString = inputString.replace(spacePattern, "");
    continue; // Proceed to the next iteration.
  }
  // Return the array of parsed numbers, also assigning it to inputString as per original logic.
  return inputString = parsedNumbers;
}

/**
 * Sorts an array of numbers using a binary insertion sort algorithm.
 * Note: This implementation contains a logical flaw in its binary search
 * that may lead to an infinite loop for certain inputs, replicating the
 * behavior of the original code.
 * @param {number[]} sourceArray - The array of numbers to be sorted.
 * @returns {number[]} A new array containing the sorted numbers.
 */
function SortWithBinaryInsertion(sourceArray) {
  const arrayLength = sourceArray.length; // Store the length of the source array.
  let resultArray = []; // Initialize an empty array to build the sorted list.

  // Iterate through each element of the original array.
  for (let outerLoopIdx = 0; outerLoopIdx < arrayLength; outerLoopIdx++) {
    // Initialize variables for the binary search within the resultArray.
    let lowerBound = 0;
    let midPoint = 0;
    let upperBound = arrayLength - 1; // This initialization is critical for replicating original behavior.

    // Calculate the initial midpoint.
    midPoint = Math.floor((lowerBound + upperBound) / 2);

    // Perform binary search to find the insertion point.
    // This loop's termination condition and logic are preserved from the original.
    while (!(lowerBound > upperBound)) {
      // Compare the current element from sourceArray with an element in resultArray.
      if (resultArray[midPoint] < sourceArray[outerLoopIdx]) {
        lowerBound = midPoint + 1; // Adjust lower bound if current element is larger.
      } else {
        upperBound = midPoint - 1; // Adjust upper bound if current element is smaller or undefined.
      }
      // Recalculate the midpoint.
      midPoint = Math.floor((lowerBound + upperBound) / 2);
    }
    // Insert the current element into the resultArray at the determined position.
    resultArray.splice(midPoint + 1, 0, sourceArray[outerLoopIdx]);
  }
  return resultArray; // Return the array after all elements have been inserted and sorted.
}

// Execute the main processing function with input read from standard input.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
