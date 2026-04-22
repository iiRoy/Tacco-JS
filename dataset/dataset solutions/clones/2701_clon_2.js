/*
 * Collection of helper routines:
 * - convertOneDToTwoD(inputArray): Transforms a 1D array into a 2D matrix.
 * - getPrimeFactors(numberValue): Returns an object containing prime factors of 'numberValue'.
 * - calculateGreatestCommonDivisor(valX, valY): Determines the GCD of two integers.
 * - determineLeastCommonMultiple(valX, valY): Computes the LCM of two integers.
 * - numericSortComparator(valA, valB): Provides (valA - valB) for sorting purposes.
 * - isNumberPrime(num): Checks if a number is prime, returns boolean.
 * - checkValueIsNumeric(value): Verifies if a given value is a number.
 * - sumAllArrayElements(dataArray): Calculates the total sum of array elements.
 * - findLargestElementIndexBelowOrEqual(sortedArray, threshold): Finds the index of the largest element less than or equal to 'threshold'.
 * - parseInputByNewline(rawString): Splits a string by newline characters.
 */
const verboseFlag = false;
const maxVal = Number.MAX_SAFE_INTEGER; /* Represents the maximum safe integer value */

function ExecuteLogic(rawData) {
  // Initial parsing of the raw input data
  let processedLines = rawData.split("\n");
  let totalScore = 0; // Accumulator for the final result
  const firstArray = processedLines[1].split(" ").map(Number); // Convert first data line to numbers
  let secondArray = processedLines[2].split(" ").map(Number); // Convert second data line to numbers

  // Debugging: Output the parsed arrays if verboseFlag is true
  // if (verboseFlag) console.log("Parsed arrays:", firstArray, secondArray);

  // Main processing loop iterating through the second array
  for (let idx = 0; idx < secondArray.length; idx++) {
    if (firstArray[idx] >= secondArray[idx]) {
      totalScore += secondArray[idx];
    } else if (secondArray[idx] - firstArray[idx] <= firstArray[idx + 1]) {
      totalScore += secondArray[idx];
      firstArray[idx + 1] -= secondArray[idx] - firstArray[idx];
    } else {
      totalScore += firstArray[idx] + firstArray[idx + 1];
      firstArray[idx + 1] = 0;
    }
    // Debugging: Display the intermediate score after each iteration
    // if (verboseFlag) console.log(`Current total score: ${totalScore}`);
  }

  // Output the final computed result to the console
  console.log(totalScore);
}

// Invoke the primary function with content read from standard input
ExecuteLogic(
  require("node:fs").readFileSync("/dev/stdin", "utf8").trim()
);