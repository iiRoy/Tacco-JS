/*
 * Utility functions collection for various data manipulations and calculations.
 *
 * Function List:
 * - convertStringArrayToNumberMatrix(Array): Transforms a 1D array of space-separated strings into a 2D array of numbers.
 * - primeFactorizeObject(N): Returns an object representing the prime factorization of N.
 * - findGreatestCommonDivisor(a, b): Computes the greatest common divisor of two numbers.
 * - findLeastCommonMultiple(a, b): Calculates the least common multiple of two numbers.
 * - subtractNumbers(a, b): Returns the difference a - b, useful for sorting.
 * - checkIfPrime(n): Determines if a number is prime, returning a boolean.
 * - isNumericString(n): Checks if a string represents a number, returning a boolean.
 * - computeArraySum(arr): Calculates the sum of elements in an array.
 * - binarySearchClosest(arr, n): Finds the index of the largest number less than or equal to n in a sorted array.
 * - splitByNewline(input): Splits an input string by newline characters.
 */

// Flag to enable or disable debug logging throughout the application.
const traceFlag = false;

// Represents a very large integer, used for initialization of minimum values.
const maxVal = Number.MAX_SAFE_INTEGER;

/**
 * Main processing function for the application.
 * It reads an integer input and calculates a specific value based on its factors.
 *
 * @param {number} dataValue - The integer input to be processed.
 */
function ProcessInput(dataValue) {
  // Initialize the smallest sum of factors found so far to a very large number.
  let smallestSum = maxVal;

  // Iterate from 1 up to the square root of the input number.
  // This efficiently finds factor pairs (idx, dataValue / idx).
  for (let idx = 1; idx <= Math.sqrt(dataValue); idx++) {
    // Initialize the current sum of factors for this iteration.
    let currentSum = maxVal;

    // Check if 'idx' is a factor of 'dataValue'.
    if (dataValue % idx === 0) {
      // If it is, calculate the sum of the factor pair.
      currentSum = idx + dataValue / idx;
    }

    // If the current sum of factors is smaller than the smallest sum found so far, update it.
    if (smallestSum > currentSum) {
      smallestSum = currentSum;
      // Optional: console.log(idx, dataValue / idx); // Debugging line to see factor pairs
    }
  }

  // The problem asks for the minimum sum of factors minus 2.
  console.log(smallestSum - 2);
}

// Read input from standard input, convert it to a string, trim whitespace, and then pass to Main.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/**
 * Placeholder function for future use, currently does nothing.
 *
 * @param {*} matrix - A generic matrix parameter.
 * @param {*} currentPos - A generic position parameter.
 */
function getNextElement(matrix, currentPos) {
  // This function is intentionally left empty as per original code structure.
}

/**
 * Calculates the lexicographical index of a given sequence.
 * Assumes the sequence is a permutation of numbers from 1 to N.
 *
 * @param {Array<number>} sequence - The input sequence of numbers.
 * @returns {number} The lexicographical index of the sequence.
 */
function calculateLexicographicalIndex(sequence) {
  // Create an array of available numbers from 1 to the length of the input sequence.
  const availableNumbers = [];
  for (let i = 0; i < sequence.length; i++) {
    availableNumbers.push(i + 1);
  }

  let totalIndex = 0;
  // Iterate through the input sequence.
  for (let i = 0; i < sequence.length; i++) {
    // Find the index of the current element in the available numbers.
    const foundIndex = availableNumbers.findIndex(itemValue => itemValue === sequence[i]);
    // Add the contribution of this element to the total index.
    totalIndex += calculateFactorial(sequence.length - 1 - i) * foundIndex;
    // Remove the current element from the available numbers.
    availableNumbers.splice(foundIndex, 1);
  }
  return totalIndex;
}

/**
 * Computes the sum of all numeric elements in an array.
 *
 * @param {Array<number|string>} inputArray - The array containing numbers or numeric strings.
 * @returns {number} The total sum of the array elements.
 */
function computeArraySum(inputArray) {
  let totalSum = 0;
  // Iterate through the array and add each element (converted to number) to the sum.
  for (let i = 0, arrayLength = inputArray.length; i < arrayLength; ++i) {
    totalSum += inputArray[i] - 0; // Convert to number using subtraction by 0.
  }
  return totalSum;
}

/**
 * Logs a message to the console only if debug mode is enabled.
 *
 * @param {*} messageContent - The content to be logged.
 */
function logTrace(messageContent) {
  if (traceFlag === true) {
    console.log(messageContent);
  }
}

/**
 * Finds the index of the maximum element in an array.
 *
 * @param {Array<number>} dataArray - The array to search.
 * @returns {number} The index of the maximum element, or -1 if the array is empty.
 */
function findMaxElementIndex(dataArray) {
  let maxValue = Number.MIN_SAFE_INTEGER;
  let maxIdx = -1;
  for (let i = 0; i < dataArray.length; i++) {
    if (maxValue < dataArray[i]) {
      maxValue = dataArray[i];
      maxIdx = i;
    }
  }
  return maxIdx;
}

/**
 * Finds the index of the minimum element in an array.
 *
 * @param {Array<number>} dataArray - The array to search.
 * @returns {number} The index of the minimum element, or -1 if the array is empty.
 */
function findMinElementIndex(dataArray) {
  let minValue = Number.MAX_SAFE_INTEGER;
  let minIdx = -1;
  for (let i = 0; i < dataArray.length; i++) {
    if (minValue > dataArray[i]) {
      minValue = dataArray[i];
      minIdx = i;
    }
  }
  return minIdx;
}

/**
 * Converts a 1D array of strings into a 2D array (matrix) where each string is split into characters.
 * Note: This function is duplicated and overwritten later in the original code.
 *
 * @param {Array<string>} oneDArray - The 1D array of strings.
 * @returns {Array<Array<string>>} The 2D array of characters.
 */
function convertStringArrayToCharMatrix(oneDArray) {
  for (let i = 0; i < oneDArray.length; i++) {
    oneDArray[i] = oneDArray[i].split("");
  }
  return oneDArray;
}

/**
 * Checks if a given number is prime.
 *
 * @param {number} testNumber - The number to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkIfPrime(testNumber) {
  if (false === Number.isInteger(testNumber)) {
    return false;
  }
  if (testNumber <= 1) {
    return false;
  }
  if (2 === testNumber) {
    return true;
  }
  if (0 === testNumber % 2) {
    return false;
  }
  const sqrtVal = Math.floor(Math.sqrt(testNumber));
  for (let i = 3; i <= sqrtVal; i += 2) {
    if (0 === testNumber % i) {
      return false;
    }
  }
  return true;
}

/**
 * Determines if a given string value represents a valid number.
 *
 * @param {string} stringValue - The string to validate.
 * @returns {boolean} True if the string is a number, false otherwise.
 */
function isNumericString(stringValue) {
  const numericPattern = /^([1-9]\d*|0)$/;
  return numericPattern.test(stringValue);
}

/**
 * Converts a 1D array of strings into a 2D array (matrix) where each string is split into characters.
 * Note: This function is a duplicate of `convertStringArrayToCharMatrix` and is overwritten later.
 *
 * @param {Array<string>} oneDArray - The 1D array of strings.
 * @returns {Array<Array<string>>} The 2D array of characters.
 */
function duplicateConvertStringArrayToCharMatrix(oneDArray) {
  for (let i = 0; i < oneDArray.length; i++) {
    oneDArray[i] = oneDArray[i].split("");
  }
  return oneDArray;
}

/**
 * Calculates the factorial of a non-negative integer.
 *
 * @param {number} inputNum - The number for which to calculate the factorial.
 * @returns {number} The factorial of the input number.
 */
function calculateFactorial(inputNum) {
  if (inputNum === 0) {
    return 1;
  }
  return inputNum * calculateFactorial(inputNum - 1);
}

/**
 * Converts a 1D array of strings into a 2D array (matrix) of numbers.
 * Each string is split by space and then mapped to a number.
 * Note: This is the final definition of `arr1dto2d` in the original code, effectively overwriting previous ones.
 *
 * @param {Array<string>} dataCollection - The 1D array of strings, where each string contains space-separated numbers.
 * @returns {Array<Array<number>>} The 2D array of numbers.
 */
function convertStringArrayToNumberMatrix(dataCollection) {
  for (let i = 0; i < dataCollection.length; i++) {
    dataCollection[i] = dataCollection[i].split(" ").map(Number);
  }
  return dataCollection;
}

/**
 * Rotates a 2D matrix 90 degrees clockwise.
 *
 * @param {Array<Array<any>>} originalMatrix - The matrix to rotate.
 * @returns {Array<Array<any>>} The rotated matrix.
 */
function rotateMatrix90Deg(originalMatrix) {
  const numRows = originalMatrix.length;
  const numCols = originalMatrix[0].length;
  const lastRowIdx = numRows - 1; // Index of the last row.

  // Create a new matrix with dimensions swapped (COL x ROW).
  const rotatedMatrix = new Array(numCols);
  for (let colIdx = 0; colIdx < numCols; colIdx++) {
    rotatedMatrix[colIdx] = new Array(numRows);
    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
      // Perform the rotation: new_matrix[c][r] = old_matrix[last_row - r][c]
      rotatedMatrix[colIdx][rowIdx] = originalMatrix[lastRowIdx - rowIdx][colIdx];
    }
  }
  return rotatedMatrix;
}

/**
 * Inserts elements from one array into another at a specified starting index.
 *
 * @param {Array<any>} targetArray - The base array to modify.
 * @param {Array<any>} elementsToInsert - The elements to insert.
 * @param {number} startIndex - The starting index in the base array for insertion.
 * @returns {Array<any>} The modified base array.
 */
function insertPartialArray(targetArray, elementsToInsert, startIndex) {
  for (let i = startIndex, pushIdx = 0; pushIdx < elementsToInsert.length; i++, pushIdx++) {
    targetArray[i] = elementsToInsert[pushIdx];
  }
  return targetArray;
}

/**
 * Reverses a partial section of an array between specified start and end positions (1-indexed).
 *
 * @param {Array<any>} workingArray - The array to modify.
 * @param {number} startPos - The 1-indexed start position of the section to reverse.
 * @param {number} endPos - The 1-indexed end position of the section to reverse.
 * @returns {Array<any>} The array with the specified section reversed.
 */
function reversePartialArray(workingArray, startPos, endPos) {
  // Extract the sub-array to be reversed (0-indexed slice).
  const subArrayToReverse = workingArray.slice(startPos - 1, endPos);
  subArrayToReverse.reverse(); // Reverse the extracted sub-array.
  // Insert the reversed sub-array back into the working array.
  workingArray = insertPartialArray(workingArray, subArrayToReverse, startPos - 1);
  return workingArray;
}

/**
 * Pads a number with leading zeros to reach a desired length.
 *
 * @param {number|string} valueToPad - The number or string to pad.
 * @param {number} desiredLength - The total desired length of the padded string.
 * @returns {string} The zero-padded string.
 */
function padNumberWithZeros(valueToPad, desiredLength) {
  // Concatenate the number with a long string of zeros and then slice to the desired length.
  return (valueToPad + '000000000000000000000000000000000').slice(0, desiredLength);
}

/**
 * Calculates the sum of all numeric elements in an array.
 * Note: This is a duplicate of `computeArraySum`.
 *
 * @param {Array<number|string>} numericArray - The array containing numbers or numeric strings.
 * @returns {number} The total sum of the array elements.
 */
function sumElementsInArray(numericArray) {
  let totalSum = 0;
  for (let i = 0, arrayLength = numericArray.length; i < arrayLength; ++i) {
    totalSum += numericArray[i] - 0; // Convert to number using subtraction by 0.
  }
  return totalSum;
}

/**
 * Performs prime factorization of a number and returns the factors and their counts as an object.
 *
 * @param {number} inputNumber - The number to factorize.
 * @returns {Object<string, number>} An object where keys are prime factors and values are their exponents.
 */
function primeFactorizeObject(inputNumber) {
  const factorCounts = {};

  if (inputNumber === 1) {
    return {
      "1": 1
    };
  }

  let currentDivisor = 2; // Start checking for divisibility from 2.

  while (inputNumber !== 1) {
    let divisorCandidate = currentDivisor;
    // Loop to find the smallest prime factor of the remaining inputNumber.
    while (divisorCandidate < Number.MAX_SAFE_INTEGER) {
      if (inputNumber % divisorCandidate === 0) {
        inputNumber /= divisorCandidate; // Divide inputNumber by the found factor.
        // Increment the count for this prime factor.
        if (!(factorCounts[divisorCandidate] > 0)) {
          factorCounts[divisorCandidate] = 0;
        }
        factorCounts[divisorCandidate]++;
        break; // Move to the next factor for the reduced inputNumber.
      }
      divisorCandidate++;
    }
    currentDivisor = divisorCandidate; // Update the starting point for the next search.
  }
  return factorCounts;
}

/**
 * Calculates the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 *
 * @param {number} firstNum - The first number.
 * @param {number} secondNum - The second number.
 * @returns {number} The greatest common divisor.
 */
function findGreatestCommonDivisor(firstNum, secondNum) {
  if (secondNum === 0) {
    return firstNum;
  }
  return findGreatestCommonDivisor(secondNum, firstNum % secondNum);
}

/**
 * Calculates the least common multiple (LCM) of two numbers.
 *
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The least common multiple.
 */
function findLeastCommonMultiple(valA, valB) {
  // Inner function to calculate GCD, used by LCM.
  const gcdFunction = (num1, num2) => num2 ? gcdFunction(num2, num1 % num2) : num1;
  return (valA * valB) / gcdFunction(valA, valB);
}

/**
 * Returns the difference between two numbers (a - b).
 * Useful as a comparison function for sorting in descending order.
 *
 * @param {number} operandA - The first operand.
 * @param {number} operandB - The second operand.
 * @returns {number} The result of operandA - operandB.
 */
function subtractNumbers(operandA, operandB) {
  return operandA - operandB;
}

/**
 * Performs a binary search on a sorted array to find the index of the largest element
 * that is less than or equal to the target value.
 *
 * @param {Array<number>} sortedArray - The sorted array to search within.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the element, or the insertion point if not found.
 */
function binarySearchClosest(sortedArray, targetValue) {
  let resultIndex = -1;

  // Left boundary of the search range.
  let leftBound = 0;

  // Right boundary of the search range.
  let rightBound = sortedArray.length - 1;

  // Continue searching as long as the boundaries are valid.
  while (leftBound <= rightBound) {
    // Calculate the middle index.
    const midPoint = Math.floor((leftBound + rightBound) / 2);

    // Compare the middle element with the target value.
    if (sortedArray[midPoint] === targetValue) {
      // If found, store the index and exit.
      resultIndex = midPoint;
      break;
    } else if (sortedArray[midPoint] < targetValue) {
      // If middle is less than target, search in the right half.
      leftBound = midPoint + 1;
    } else {
      // If middle is greater than target, search in the left half.
      rightBound = midPoint - 1;
    }
  }
  // If the exact value was found, return its index. Otherwise, return 'leftBound'
  // which represents the insertion point for 'targetValue' to maintain sorted order.
  if (resultIndex !== -1) return resultIndex;
  else return leftBound;
}

/**
 * Splits a raw input string into an array of strings based on newline characters.
 *
 * @param {string} rawInputString - The input string containing newlines.
 * @returns {Array<string>} An array of strings, each representing a line.
 */
function splitByNewline(rawInputString) {
  return rawInputString.split("\n");
}

/**
 * Checks if an array of numbers is sorted in non-decreasing order.
 *
 * @param {Array<number>} dataArray - The array to check.
 * @returns {boolean} True if the array is sorted, false otherwise.
 */
function checkIfSorted(dataArray) {
  let isSortedFlag = true;
  for (let i = 1; i < dataArray.length; i++) {
    if (dataArray[i - 1] > dataArray[i]) {
      isSortedFlag = false;
      break;
    }
  }
  return isSortedFlag;
}

/**
 * Performs detailed prime factorization of a number, returning an object
 * with prime factors as keys and their exponents as values.
 *
 * @param {number} numberToFactor - The number to factorize.
 * @returns {Object<string, number>} An object mapping prime factors to their counts.
 */
function detailedPrimeFactorization(numberToFactor) {
  // Calculate the integer part of the square root of the number.
  const sqrtOfN = Math.floor(Math.sqrt(numberToFactor));

  let exponentCount = 0; // Counter for the exponent of a prime factor.

  const primeFactorsMap = {}; // Object to store prime factors and their exponents.

  // Iterate from 2 up to the square root of the number to find prime factors.
  for (let currentFactor = 2; currentFactor <= sqrtOfN; currentFactor++) {
    if ((numberToFactor % currentFactor) === 0) {
      exponentCount = 0; // Reset exponent counter for the new prime factor.

      // Keep dividing by currentFactor as long as it's a factor.
      do {
        exponentCount++; // Increment exponent.
        numberToFactor = numberToFactor / currentFactor; // Reduce the number.
      } while ((numberToFactor % currentFactor) === 0);

      // Store the prime factor and its exponent.
      primeFactorsMap[currentFactor] = exponentCount;
    }
  }

  // If after all divisions, numberToFactor is still greater than 1 (and greater than sqrtOfN),
  // it means the remaining number is a prime factor itself.
  if (numberToFactor > 1) {
    primeFactorsMap[numberToFactor] = 1;
  }

  return primeFactorsMap;
}
