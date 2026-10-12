// This file contains various utility functions for JavaScript programming.
// It includes array manipulations, mathematical operations, and string utilities.

const isDebuggingActive = false; // Flag to control debug output.
const maxSafeInt = Number.MAX_SAFE_INTEGER; // Represents the largest safe integer in JavaScript.
const moduloVal = 1000000007; // A common modulo value used in competitive programming.

/**
 * Main entry point for processing input.
 * Reads a number from stdin, performs prime factorization,
 * and calculates a sum based on triangular numbers.
 * @param {string} rawData - The raw input string from stdin.
 */
function ProcessInput(rawData) {
  // Convert the input string to a numerical value.
  let numericInput = Number(rawData);

  /**
   * Calculates the number of steps required to reach or exceed a target value
   * by summing consecutive integers (triangular numbers).
   * For example, if targetValue is 6, steps are 1+2+3 = 6, so 3 steps.
   * If targetValue is 7, steps are 1+2+3+4 = 10, so 4 steps.
   * @param {number} targetValue - The value to reach or exceed.
   * @returns {number} The count of steps (i.e., the last integer added).
   */
  function calculateTriangularSumSteps(targetValue) {
    let currentSum = 0; // Accumulator for the sum of integers.
    let stepCount = 0; // Counter for the number of steps.

    // Loop until the current sum is greater than or equal to the target value.
    for (stepCount = 1; currentSum < targetValue; stepCount++) {
      currentSum += stepCount; // Add the next integer to the sum.
      // console.log(currentSum, targetValue); // Original debug line, commented out.
    }
    return stepCount - 1; // Return the last integer added (which is stepCount - 1).
  }

  // Perform prime factorization on the numeric input.
  const primeFactorsMap = primeFactorize(numericInput);
  let totalSteps = 0; // Initialize the total steps accumulator.

  // Iterate over each prime factor and its count.
  Object.keys(primeFactorsMap).forEach(function (factorKey) {
    // For each prime factor's count, calculate the triangular sum steps
    // and add it to the total steps.
    totalSteps += calculateTriangularSumSteps(primeFactorsMap[factorKey]);
  });

  // Output the final calculated total steps.
  console.log(totalSteps);
}

// Execute the main function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/**
 * Calculates the lexicographical index of a given sequence.
 * This function seems incomplete or dependent on a global 'input' variable
 * which is not defined in this scope.
 * @param {Array<number>} sequence - The input sequence of numbers.
 * @returns {number} The lexicographical index.
 */
function lexicographicalIndex(sequence) {
  // This part assumes 'input' is a global array, which is not ideal.
  // Assuming input[0] is the total number of elements for permutations.
  let availableNumbers = [];
  for (let i = 0; i < input[0]; i++) { // 'input' is not defined here. This will cause a runtime error.
    availableNumbers.push(i + 1);
  }

  let lexIndex = 0;
  for (let i = 0; i < sequence.length; i++) {
    const foundIndex = availableNumbers.findIndex(val => val == sequence[i]);
    lexIndex += computeFactorial(sequence.length - 1 - i) * foundIndex;
    availableNumbers.splice(foundIndex, 1);
  }
  return lexIndex;
}

/**
 * Computes the sum of all numeric elements in an array.
 * Elements are converted to numbers before summing.
 * @param {Array<string|number>} inputArr - The array whose elements are to be summed.
 * @returns {number} The total sum of the array elements.
 */
function sumArrayElements(inputArr) {
  let totalSum = 0;
  // Loop through the array, converting each element to a number and adding it to the sum.
  for (let i = 0, arrayLength = inputArr.length; i < arrayLength; ++i) {
    totalSum += inputArr[i] - 0; // Using '- 0' for explicit type coercion to number.
  }
  return totalSum;
}

/**
 * Logs a message to the console only if debugging is active.
 * @param {*} messageContent - The content to log.
 */
function logDebugMessage(messageContent) {
  if (isDebuggingActive === true) {
    console.log(messageContent);
  }
}

/**
 * Finds the index of the maximum element in an array.
 * If the array is empty, returns -1.
 * @param {Array<number>} dataArray - The array to search.
 * @returns {number} The index of the maximum element, or -1 if array is empty.
 */
function findMaxElementIndex(dataArray) {
  let currentMax = Number.MIN_SAFE_INTEGER; // Initialize with the smallest possible number.
  let maxIndex = -1; // Initialize index to -1 (not found).

  // Iterate through the array to find the maximum element and its index.
  for (let i = 0; i < dataArray.length; i++) {
    if (currentMax < dataArray[i]) {
      currentMax = dataArray[i];
      maxIndex = i;
    }
  }
  return maxIndex;
}

/**
 * Finds the index of the minimum element in an array.
 * If the array is empty, returns -1.
 * @param {Array<number>} dataArray - The array to search.
 * @returns {number} The index of the minimum element, or -1 if array is empty.
 */
function findMinElementIndex(dataArray) {
  let currentMin = Number.MAX_SAFE_INTEGER; // Initialize with the largest possible number.
  let minIndex = -1; // Initialize index to -1 (not found).

  // Iterate through the array to find the minimum element and its index.
  for (let i = 0; i < dataArray.length; i++) {
    if (currentMin > dataArray[i]) {
      currentMin = dataArray[i];
      minIndex = i;
    }
  }
  return minIndex;
}

/**
 * Converts a 1D array of strings into a 2D array of characters.
 * Each string element in the input array is split into an array of characters.
 * @param {Array<string>} stringArray - The 1D array of strings.
 * @returns {Array<Array<string>>} The 2D array of characters.
 */
function convert1dTo2dArray(stringArray) {
  for (let i = 0; i < stringArray.length; i++) {
    stringArray[i] = stringArray[i].split(""); // Split each string into an array of characters.
  }
  return stringArray;
}

/**
 * Checks if a given number is prime.
 * @param {number} numberToCheck - The number to test for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkIfPrime(numberToCheck) {
  // Ensure the input is an integer.
  if (false === Number.isInteger(numberToCheck)) {
    return false;
  }
  // 1 and numbers less than 1 are not prime.
  if (numberToCheck <= 1) {
    return false;
  }
  // 2 is the only even prime number.
  if (2 === numberToCheck) {
    return true;
  }
  // All other even numbers are not prime.
  if (0 === numberToCheck % 2) {
    return false;
  }

  // Check for divisibility by odd numbers up to its square root.
  const sqrtVal = Math.floor(Math.sqrt(numberToCheck));
  for (let i = 3; i <= sqrtVal; i += 2) {
    if (0 === numberToCheck % i) {
      return false; // Found a divisor, so not prime.
    }
  }
  return true; // No divisors found, it's prime.
}

/**
 * Validates if a given string represents a non-negative integer.
 * @param {string} inputString - The string to validate.
 * @returns {boolean} True if the string is a non-negative integer, false otherwise.
 */
function validateIsNumeric(inputString) {
  // Regular expression to match non-negative integers (0 or positive integers).
  const numericPattern = /^([1-9]\d*|0)$/;
  return numericPattern.test(inputString);
}

/**
 * Computes the factorial of a non-negative integer.
 * Uses recursion.
 * @param {number} inputNumber - The non-negative integer.
 * @returns {number} The factorial of the input number.
 */
function computeFactorial(inputNumber) {
  if (inputNumber === 0) {
    return 1; // Base case: 0! is 1.
  }
  return inputNumber * computeFactorial(inputNumber - 1); // Recursive step.
}

/**
 * Rotates a 2D matrix 90 degrees clockwise.
 * @param {Array<Array<any>>} originalMatrix - The matrix to rotate.
 * @returns {Array<Array<any>>} The rotated matrix.
 */
function rotateMatrix(originalMatrix) {
  const numRows = originalMatrix.length;
  const numCols = originalMatrix[0].length;
  const lastRowIndex = numRows - 1; // Index of the last row.

  // Create a new matrix with dimensions swapped (COL x ROW).
  let rotatedMatrix = new Array(numCols);
  for (let colIter = 0; colIter < numCols; colIter++) {
    rotatedMatrix[colIter] = new Array(numRows);
    for (let rowIter = 0; rowIter < numRows; rowIter++) {
      // The element at (r, c) in the original matrix moves to (c, ROW - 1 - r) in the rotated matrix.
      rotatedMatrix[colIter][rowIter] = originalMatrix[lastRowIndex - rowIter][colIter];
    }
  }
  return rotatedMatrix;
}

/**
 * Inserts elements from one array into another at a specified starting index.
 * Modifies the base array in place.
 * @param {Array<any>} baseArray - The array to insert into.
 * @param {Array<any>} elementsToInsert - The elements to insert.
 * @param {number} startIndex - The starting index in the base array for insertion.
 * @returns {Array<any>} The modified base array.
 */
function insertPartialArray(baseArray, elementsToInsert, startIndex) {
  for (let baseIdx = startIndex, pushIdx = 0; pushIdx < elementsToInsert.length; baseIdx++, pushIdx++) {
    baseArray[baseIdx] = elementsToInsert[pushIdx];
  }
  return baseArray;
}

/**
 * Reverses a portion of an array between two specified indices (1-based).
 * @param {Array<any>} targetArray - The array to modify.
 * @param {number} startPos - The 1-based starting index of the segment to reverse.
 * @param {number} endPos - The 1-based ending index of the segment to reverse.
 * @returns {Array<any>} The modified array.
 */
function reversePartialArray(targetArray, startPos, endPos) {
  // Extract the sub-array to be reversed (0-based indexing for slice).
  let subArrayToReverse = targetArray.slice(startPos - 1, endPos);
  subArrayToReverse.reverse(); // Reverse the extracted sub-array.
  // Insert the reversed sub-array back into the target array.
  targetArray = insertPartialArray(targetArray, subArrayToReverse, startPos - 1);
  return targetArray;
}

/**
 * Pads a number with leading zeros to reach a desired length.
 * Note: This implementation uses string concatenation and slice,
 * which might not be suitable for very large numbers or specific formatting needs.
 * It effectively truncates if the number string is already longer than length.
 * @param {number|string} valueToPad - The number or string to pad.
 * @param {number} desiredLength - The total desired length of the padded string.
 * @returns {string} The zero-padded string.
 */
function padNumberWithZeros(valueToPad, desiredLength) {
  // Concatenate the number with a long string of zeros and then slice.
  // This effectively pads or truncates to the desired length.
  return (valueToPad + '000000000000000000000000000000000').slice(0, desiredLength);
}

/**
 * Performs prime factorization of a given integer.
 * Returns an object where keys are prime factors and values are their counts.
 * @param {number} inputNum - The integer to factorize.
 * @returns {Object<string, number>} An object mapping prime factors to their exponents.
 */
function primeFactorize(inputNum) {
  let factorCounts = {}; // Object to store prime factors and their counts.

  // Special case for 1.
  if (inputNum === 1) {
    return { "1": 1 };
  }

  let currentDivisor = 2; // Start checking divisibility from 2.

  // Continue factorization until the number becomes 1.
  while (inputNum !== 1) {
    let divisorCandidate = currentDivisor;
    // Loop to find the smallest prime divisor.
    while (divisorCandidate < maxSafeInt) { // Using maxSafeInt as a safeguard.
      if (inputNum % divisorCandidate === 0) {
        // Found a divisor.
        inputNum /= divisorCandidate; // Divide the number by the divisor.
        // Increment the count for this prime factor.
        if (!(factorCounts[divisorCandidate] > 0)) {
          factorCounts[divisorCandidate] = 0;
        }
        factorCounts[divisorCandidate]++;
        break; // Move to the next iteration of the outer while loop with the new inputNum.
      }
      divisorCandidate++; // Try the next potential divisor.
    }
    currentDivisor = divisorCandidate; // Update the starting divisor for the next iteration.
  }
  return factorCounts;
}

/**
 * Computes the greatest common divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm.
 * @param {number} numA - The first non-negative integer.
 * @param {number} numB - The second non-negative integer.
 * @returns {number} The greatest common divisor of numA and numB.
 */
function greatestCommonDivisor(numA, numB) {
  if (numB === 0) {
    return numA; // Base case: GCD(a, 0) = a.
  }
  return greatestCommonDivisor(numB, numA % numB); // Recursive step.
}

/**
 * Computes the least common multiple (LCM) of two non-negative integers.
 * Uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} valA - The first non-negative integer.
 * @param {number} valB - The second non-negative integer.
 * @returns {number} The least common multiple of valA and valB.
 */
function leastCommonMultiple(valA, valB) {
  // Helper function for GCD, defined inline.
  const gcdHelper = (paramN, paramM) => paramM ? gcdHelper(paramM, paramN % paramM) : paramN;
  return (valA * valB) / gcdHelper(valA, valB);
}

/**
 * A simple comparison function for sorting numbers in ascending order.
 * Returns the difference between the first and second number.
 * @param {number} firstNum - The first number.
 * @param {number} secondNum - The second number.
 * @returns {number} A negative value if firstNum < secondNum,
 *                   a positive value if firstNum > secondNum,
 *                   or 0 if they are equal.
 */
function compareNumbers(firstNum, secondNum) {
  return firstNum - secondNum;
}

/**
 * Performs a binary search on a sorted array to find the index of the target value.
 * If the target value is not found, it returns the index where the target value
 * would be inserted to maintain sorted order (i.e., the index of the first element
 * greater than or equal to the target value).
 * @param {Array<number>} sortedArray - The sorted array to search within.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the target value if found, or the insertion point.
 */
function binarySearchClosest(sortedArray, targetValue) {
  let foundIndex = -1; // Initialize index to -1 (not found).

  let leftBound = 0; // Left boundary of the search range.
  let rightBound = sortedArray.length - 1; // Right boundary of the search range.

  // Continue searching as long as the left boundary does not exceed the right boundary.
  while (leftBound <= rightBound) {
    const midPoint = Math.floor((leftBound + rightBound) / 2); // Calculate the middle index.

    // Compare the middle element with the target value.
    if (sortedArray[midPoint] === targetValue) {
      foundIndex = midPoint; // Target found.
      break; // Exit the loop.
    } else if (sortedArray[midPoint] < targetValue) {
      // If middle element is less than target, search in the right half.
      leftBound = midPoint + 1;
    } else {
      // If middle element is greater than target, search in the left half.
      rightBound = midPoint - 1;
    }
  }

  // If the target was found, return its index.
  // Otherwise, 'leftBound' will be the insertion point (index of the first element >= targetValue).
  if (foundIndex !== -1) {
    return foundIndex;
  } else {
    return leftBound;
  }
}

/**
 * Splits a raw input string into an array of strings using the newline character as a delimiter.
 * @param {string} rawInputString - The input string containing newline-separated values.
 * @returns {Array<string>} An array of strings, each representing a line from the input.
 */
function splitByNewline(rawInputString) {
  return rawInputString.split("\n");
}

/**
 * Checks if an array of numbers is sorted in non-decreasing order.
 * @param {Array<number>} inputArray - The array to check.
 * @returns {boolean} True if the array is sorted, false otherwise.
 */
function checkIfSorted(inputArray) {
  let isSortedFlag = true; // Assume sorted initially.
  // Iterate from the second element, comparing with the previous one.
  for (let i = 1; i < inputArray.length; i++) {
    if (inputArray[i - 1] > inputArray[i]) {
      isSortedFlag = false; // Found an unsorted pair.
      break; // No need to check further.
    }
  }
  return isSortedFlag;
}

/**
 * Performs a detailed prime factorization of a given integer.
 * Returns an object where keys are prime factors and values are their counts.
 * This implementation uses a different approach than `primeFactorize`.
 * @param {number} numberToFactor - The integer to factorize.
 * @returns {Object<string, number>} An object mapping prime factors to their exponents.
 */
function detailedPrimeFactorization(numberToFactor) {
  // Calculate the square root of the number.
  let sqrtOfN = Math.floor(Math.sqrt(numberToFactor));

  let exponentCount = 0; // Counter for the exponent of a prime factor.
  let factorizationResult = {}; // Object to store prime factors and their counts.

  // Iterate from 2 up to the square root of the number.
  for (let currentFactor = 2; currentFactor <= sqrtOfN; currentFactor++) {
    if ((numberToFactor % currentFactor) === 0) {
      exponentCount = 0; // Reset exponent counter for the new prime factor.
      // Keep dividing by currentFactor as long as it's a divisor.
      do {
        exponentCount++; // Increment exponent.
        numberToFactor = numberToFactor / currentFactor; // Divide the number.
      } while ((numberToFactor % currentFactor) === 0);

      // Store the prime factor and its exponent.
      factorizationResult[currentFactor] = exponentCount;
    }
  }

  // If after dividing by all factors up to sqrt(N), the numberToFactor is still
  // greater than 1, it means the remaining number is a prime factor itself.
  if (numberToFactor > 1) {
    factorizationResult[numberToFactor] = 1;
  }

  return factorizationResult;
}
