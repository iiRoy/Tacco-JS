/*
 * Utility functions collection for various programming challenges.
 *
 * This file contains a set of helper functions:
 * - convertArray1DTo2D(Array): Transforms a 1D array into a 2D array.
 * - getPrimeFactorsMap(N): Returns an object with prime factors and their counts.
 * - calculateGCD(a, b): Computes the greatest common divisor of two numbers.
 * - calculateLCM(a, b): Computes the least common multiple of two numbers.
 * - compareNumericValues(a, b): Returns a - b, useful for sorting.
 * - isValuePrime(n): Checks if a number is prime, returns boolean.
 * - isInputNumeric(n): Checks if a value is a number, returns boolean.
 * - sumAllArrayElements(arr): Calculates the sum of all elements in an array.
 * - binarySearchForLargestLessEqual(arr, n): Finds the index of the largest number less than or equal to n.
 * - splitInputByNewline(input): Splits a string by newline characters.
 */

const dbgFlag = false; // Flag for debugging messages
const maxVal = Number.MAX_SAFE_INTEGER; // Represents positive infinity for safe integers
const primeMod = 1000000007; // A common modulo value used in competitive programming

/**
 * Main processing function for the problem.
 * Reads input, performs XOR operations, and prints results.
 * @param {string} rawData - The raw input string from stdin.
 */
function ProcessInput(rawData) {
  // Split the entire input string into an array of lines.
  let inputLines = rawData.split("\n");

  // Parse the second line as a space-separated array of numbers.
  let numArray = inputLines[1].split(" ").map(Number);

  // Initialize a variable to store the XOR sum of all elements.
  let xorSum = 0;

  // Calculate the XOR sum of all numbers in the array.
  numArray.forEach(function (currentVal) {
    xorSum = xorSum ^ currentVal;
  });

  // An array to potentially store results (unused in this specific problem logic).
  let resultList = [];

  // For each number in the input array, calculate its XOR with the total XOR sum
  // and print it to the console.
  numArray.forEach(function (currentVal) {
    console.log(xorSum ^ currentVal);
  });
}

// Execute the main function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/**
 * Calculates the power of a base number to an exponent.
 * Note: This function has a bug in the original code; it always returns the base.
 * It's preserved as-is for Type II cloning.
 * @param {BigInt} baseNum - The base number.
 * @param {BigInt} exponentVal - The exponent.
 * @returns {BigInt} The base number (due to original bug).
 */
function calculatePower(baseNum, exponentVal) {
  let powerResult = 0n; // Initialize result as BigInt

  // Loop 'exponentVal' times to multiply 'baseNum'.
  for (let loopCounter = 0n; loopCounter < exponentVal; loopCounter += 1n) {
    if (powerResult === 0n) {
      powerResult = baseNum; // First iteration, set result to base.
    } else {
      powerResult *= baseNum; // Subsequent iterations, multiply by base.
    }
  }
  return baseNum; // Original code returns 'a' (baseNum) instead of 'ans' (powerResult).
}

/**
 * Calculates the lexicographical rank of a permutation.
 * Note: This function relies on a global 'input' variable which is not defined in its scope.
 * It's preserved as-is for Type II cloning.
 * @param {Array<number>} inputSequence - The permutation sequence.
 * @returns {number} The lexicographical rank.
 */
function lexicographicalRank(inputSequence) {
  let availableNums = [];
  // This part assumes 'input[0]' is available and is the length of the sequence.
  // This is a dependency on a global 'input' variable, which is problematic.
  for (let i = 0; i < input[0]; i++) {
    availableNums.push(i + 1);
  }

  let totalRank = 0;
  for (let i = 0; i < inputSequence.length; i++) {
    let foundIndex = availableNums.findIndex((val) => val === inputSequence[i]);
    totalRank += computeFactorial(inputSequence.length - 1 - i) * foundIndex;
    availableNums.splice(foundIndex, 1); // Remove the used number.
  }
  return totalRank;
}

/**
 * Calculates the sum of all numeric elements in an array.
 * This is the first definition of arrsum.
 * @param {Array<number|string>} dataCollection - The array of numbers or numeric strings.
 * @returns {number} The total sum.
 */
function sumArrayElements(dataCollection) {
  let totalSum = 0;
  for (let idx = 0, collectionLength = dataCollection.length; idx < collectionLength; ++idx) {
    totalSum += dataCollection[idx] - 0; // Ensure conversion to number.
  }
  return totalSum;
}

/**
 * Logs a message to the console if debug mode is enabled.
 * @param {*} messageContent - The content to log.
 */
function logDebugMessage(messageContent) {
  if (dbgFlag === true) {
    console.log(messageContent);
  }
}

/**
 * Finds the index of the maximum value in an array.
 * @param {Array<number>} valueArray - The array to search.
 * @returns {number} The index of the maximum value, or -1 if array is empty.
 */
function findMaxIndex(valueArray) {
  let maxValue = Number.MIN_SAFE_INTEGER;
  let maxIdx = -1;
  for (let k = 0; k < valueArray.length; k++) {
    if (maxValue < valueArray[k]) {
      maxValue = valueArray[k];
      maxIdx = k;
    }
  }
  return maxIdx;
}

/**
 * Finds the index of the minimum value in an array.
 * @param {Array<number>} dataArray - The array to search.
 * @returns {number} The index of the minimum value, or -1 if array is empty.
 */
function findMinIndex(dataArray) {
  let minValue = Number.MAX_SAFE_INTEGER;
  let minIdx = -1;
  for (let j = 0; j < dataArray.length; j++) {
    if (minValue > dataArray[j]) {
      minValue = dataArray[j];
      minIdx = j;
    }
  }
  return minIdx;
}

/**
 * Checks if a given number is prime.
 * @param {number} testNumber - The number to check.
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
  let sqrtVal = Math.floor(Math.sqrt(testNumber));
  for (let divisor = 3; divisor <= sqrtVal; divisor += 2) {
    if (0 === testNumber % divisor) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if a string represents a non-negative integer.
 * @param {string} inputString - The string to validate.
 * @returns {boolean} True if the string is a non-negative integer, false otherwise.
 */
function isNumericString(inputString) {
  const numericPattern = /^([1-9]\d*|0)$/;
  return numericPattern.test(inputString);
}

/**
 * Calculates the factorial of a non-negative integer.
 * @param {number} factorialInput - The number to calculate the factorial for.
 * @returns {number} The factorial of the input number.
 */
function computeFactorial(factorialInput) {
  if (factorialInput === 0) {
    return 1;
  }
  return factorialInput * computeFactorial(factorialInput - 1);
}

/**
 * Converts a 1D array of space-separated strings into a 2D array of numbers.
 * @param {Array<string>} oneDArray - The 1D array where each element is a string of space-separated numbers.
 * @returns {Array<Array<number>>} The resulting 2D array.
 */
function convert1dTo2d(oneDArray) {
  for (let rowIdx = 0; rowIdx < oneDArray.length; rowIdx++) {
    oneDArray[rowIdx] = oneDArray[rowIdx].split(" ").map(Number);
  }
  return oneDArray;
}

/**
 * Rotates a 2D matrix 90 degrees clockwise.
 * @param {Array<Array<any>>} inputMatrix - The matrix to rotate.
 * @returns {Array<Array<any>>} The rotated matrix.
 */
function rotateMatrix(inputMatrix) {
  const numRows = inputMatrix.length;
  const numCols = inputMatrix[0].length;
  const lastRowIdx = numRows - 1; // Index of the last row.

  let rotatedMatrix = new Array(numCols); // New matrix will have numCols rows.
  for (let colIdx = 0; colIdx < numCols; colIdx++) {
    rotatedMatrix[colIdx] = new Array(numRows); // Each new row will have numRows columns.
    for (let currRowIdx = 0; currRowIdx < numRows; currRowIdx++) {
      // Map original (row, col) to new (col, numRows - 1 - row) for 90-degree clockwise rotation.
      rotatedMatrix[colIdx][currRowIdx] = inputMatrix[lastRowIdx - currRowIdx][colIdx];
    }
  }
  return rotatedMatrix;
}

/**
 * Inserts a segment of an array into a target array starting at a specified index.
 * Modifies the target array in place.
 * @param {Array<any>} targetArray - The array to modify.
 * @param {Array<any>} sourceSegment - The segment to insert.
 * @param {number} startIndex - The starting index in the target array for insertion.
 * @returns {Array<any>} The modified target array.
 */
function insertPartialArray(targetArray, sourceSegment, startIndex) {
  for (let targetIdx = startIndex, sourceIdx = 0; sourceIdx < sourceSegment.length; targetIdx++, sourceIdx++) {
    targetArray[targetIdx] = sourceSegment[sourceIdx];
  }
  return targetArray;
}

/**
 * Reverses a specified segment of an array.
 * @param {Array<any>} originalArray - The array to modify.
 * @param {number} startPos - The 1-based starting position of the segment.
 * @param {number} endPos - The 1-based ending position of the segment.
 * @returns {Array<any>} The array with the segment reversed.
 */
function reversePartialArray(originalArray, startPos, endPos) {
  // Extract the segment, reverse it, and then insert it back.
  let segmentToReverse = originalArray.slice(startPos - 1, endPos);
  segmentToReverse.reverse();
  originalArray = insertPartialArray(originalArray, segmentToReverse, startPos - 1);
  return originalArray;
}

/**
 * Pads a number with leading zeros to reach a desired length.
 * Note: This function uses a fixed long string of zeros for padding, which is inefficient for very large lengths.
 * @param {number|string} valueToPad - The number or string to pad.
 * @param {number} desiredLength - The total desired length of the padded string.
 * @returns {string} The zero-padded string.
 */
function padNumberWithZeros(valueToPad, desiredLength) {
  // Concatenate the number with a very long string of zeros and then slice it.
  return (valueToPad + "000000000000000000000000000000000").slice(0, desiredLength);
}

/**
 * Calculates the sum of all numeric elements in an array.
 * This is the second definition of arrsum, identical to the first.
 * @param {Array<number|string>} inputCollection - The array of numbers or numeric strings.
 * @returns {number} The total sum.
 */
function calculateArraySum(inputCollection) {
  let totalValue = 0;
  for (let indexVar = 0, collectionSize = inputCollection.length; indexVar < collectionSize; ++indexVar) {
    totalValue += inputCollection[indexVar] - 0; // Ensure conversion to number.
  }
  return totalValue;
}

/**
 * Performs prime factorization of a number and returns the factors as an object.
 * @param {number} inputNum - The number to factorize.
 * @returns {Object<string, number>} An object where keys are prime factors and values are their counts.
 */
function primeFactorizeObject(inputNum) {
  let factorMap = {};

  if (inputNum === 1) {
    return { "1": 1 }; // Special case for 1.
  }

  let currentDivisor = 2; // Start checking from the smallest prime.

  while (inputNum !== 1) {
    let tempDivisor = currentDivisor;
    // Iterate through potential divisors.
    while (tempDivisor < Number.MAX_SAFE_INTEGER) {
      if (inputNum % tempDivisor === 0) {
        inputNum /= tempDivisor; // Divide by the factor.
        if (!(factorMap[tempDivisor] > 0)) {
          factorMap[tempDivisor] = 0; // Initialize count if new factor.
        }
        factorMap[tempDivisor]++; // Increment count.
        break; // Found a factor, restart search for next factor from this one.
      }
      tempDivisor++; // Try next potential divisor.
    }
    currentDivisor = tempDivisor; // Update the starting divisor for the next iteration.
  }
  return factorMap;
}

/**
 * Computes the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 * @param {number} numA - The first number.
 * @param {number} numB - The second number.
 * @returns {number} The GCD of numA and numB.
 */
function findGCD(numA, numB) {
  if (numB === 0) {
    return numA;
  }
  return findGCD(numB, numA % numB);
}

/**
 * Computes the least common multiple (LCM) of two numbers.
 * @param {number} valX - The first number.
 * @param {number} valY - The second number.
 * @returns {number} The LCM of valX and valY.
 */
function findLCM(valX, valY) {
  // Helper function for GCD, defined inline.
  const gcdHelper = (paramN, paramM) => (paramM ? gcdHelper(paramM, paramN % paramM) : paramN);
  return (valX * valY) / gcdHelper(valX, valY);
}

/**
 * A comparison function for sorting numbers in ascending order.
 * @param {number} firstNum - The first number for comparison.
 * @param {number} secondNum - The second number for comparison.
 * @returns {number} The difference (firstNum - secondNum).
 */
function compareNumbers(firstNum, secondNum) {
  return firstNum - secondNum;
}

/**
 * Performs a binary search on a sorted array to find the index of the largest element
 * that is less than or equal to the target value.
 * @param {Array<number>} sortedArray - The sorted array to search.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the found element, or the insertion point if not found.
 */
function binarySearchLargestLessEqual(sortedArray, targetValue) {
  let foundIndexPos = -1; // Stores the index if an exact match is found.

  let leftBound = 0; // Leftmost index to consider.
  let rightBound = sortedArray.length - 1; // Rightmost index to consider.

  // Continue searching as long as the bounds are valid.
  while (leftBound <= rightBound) {
    let midPoint = Math.floor((leftBound + rightBound) / 2); // Calculate middle index.

    if (sortedArray[midPoint] === targetValue) {
      foundIndexPos = midPoint; // Exact match found.
      break; // Exit loop.
    } else if (sortedArray[midPoint] < targetValue) {
      // If middle value is less than target, search in the right half.
      leftBound = midPoint + 1;
    } else {
      // If middle value is greater than target, search in the left half.
      rightBound = midPoint - 1;
    }
  }
  // If an exact match was found, return its index. Otherwise, 'leftBound'
  // will be the insertion point for 'targetValue' to maintain sorted order,
  // which corresponds to the index of the first element greater than 'targetValue'.
  // This is effectively the index of the largest element less than or equal to 'targetValue'
  // if 'targetValue' itself is not present but falls within the array's range.
  if (foundIndexPos !== -1) return foundIndexPos;
  else return leftBound;
}

/**
 * Splits a given string by newline characters.
 * @param {string} textInput - The input string.
 * @returns {Array<string>} An array of strings, each representing a line.
 */
function splitByNewline(textInput) {
  return textInput.split("\n");
}

/**
 * Checks if an array of numbers is sorted in non-decreasing order.
 * @param {Array<number>} sequenceToCheck - The array to check.
 * @returns {boolean} True if the array is sorted, false otherwise.
 */
function checkIfSorted(sequenceToCheck) {
  let isSortedFlag = true;
  for (let checkIdx = 1; checkIdx < sequenceToCheck.length; checkIdx++) {
    if (sequenceToCheck[checkIdx - 1] > sequenceToCheck[checkIdx]) {
      isSortedFlag = false; // Found an unsorted pair.
      break; // No need to check further.
    }
  }
  return isSortedFlag;
}

/**
 * Performs prime factorization of a number and returns the factors as an object.
 * This is a different implementation of prime factorization compared to `primeFactorizeObject`.
 * @param {number} numberToFactor - The number to factorize.
 * @returns {Object<string, number>} An object where keys are prime factors and values are their counts.
 */
function getPrimeFactors(numberToFactor) {
  // Store the square root of the number for optimization.
  let sqrtOfN = Math.floor(Math.sqrt(numberToFactor));

  let exponentCount = 0; // Counter for the exponent of each prime factor.

  let primeFactorsMap = {}; // Object to store prime factors and their exponents.

  // Iterate from 2 up to the square root of the number to find prime factors.
  for (let currentFactor = 2; currentFactor <= sqrtOfN; currentFactor++) {
    if (numberToFactor % currentFactor === 0) {
      exponentCount = 0; // Reset exponent counter for the new prime factor.

      do {
        exponentCount++; // Increment exponent.
        numberToFactor = numberToFactor / currentFactor; // Divide the number by the factor.
      } while (numberToFactor % currentFactor === 0); // Continue as long as it's divisible.

      // Store the prime factor and its exponent.
      primeFactorsMap[currentFactor] = exponentCount;
    }
  }

  // If after the loop, 'numberToFactor' is greater than 'sqrtOfN',
  // it means the remaining 'numberToFactor' is itself a prime number.
  if (numberToFactor > sqrtOfN) {
    primeFactorsMap[numberToFactor] = 1; // Add the remaining prime factor with exponent 1.
  }

  return primeFactorsMap;
}
