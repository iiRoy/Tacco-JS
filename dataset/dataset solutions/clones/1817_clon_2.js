// Collection of Utility Functions and Program Components
//
// This segment provides various helper routines and the main execution flow.
//
// Function List Overview:
//
// convertToOneByTwo(inputArray) : Reshapes a 1D array of strings into a 2D character array.
// primeFactorDecomposition(numberVal) : Returns an object mapping prime factors to their exponents.
// greatestCommonDivisor(numA, numB) : Computes the greatest common divisor of two integers.
// leastCommonMultiple(numA, numB) : Determines the least common multiple of two integers.
// numericDifference(valA, valB) : Provides the difference between two numbers (valA - valB), useful for sorting.
// checkPrimeStatus(candidate) : Verifies if a number is prime, returning a boolean.
// validateNumericString(text) : Checks if a string represents a valid non-negative integer.
// calculateArrayTotal(dataList) : Calculates the sum of all numeric elements in an array.
// binarySearchLargestLessThanOrEqual(sortedArr, value) : Finds the index of the largest element less than or equal to 'value' in a sorted array.
// splitByNewline(sourceText) : Divides an input string into an array of strings using newline characters.
//
const verboseLog = false; // Flag to enable/disable detailed logging.
const maxIntVal = Number.MAX_SAFE_INTEGER; // Represents the largest safe integer value.
const primeConst = 1000000007; // A common large prime number used in modular arithmetic.

// Renamed global configuration for functions that might implicitly rely on it.
// This is assumed to be an array-like structure for certain utility functions.
let applicationConfigSettings = [];

// Main processing routine for the application.
// This function initializes and executes the primary logic based on provided input.
function ExecuteProgram( dataStream ) {
  // Convert the incoming data to a numerical format for calculations.
  let numericData = Number(dataStream);

  // Helper function to calculate the index related to a triangular sum.
  // It finds the largest 'idx' such that the sum 1+2+...+idx is less than 'targetVal'.
  function triangularSumIndex(targetVal) {
    let currentSum = 0; // Accumulator for the triangular sum.
    let iteratorCount = 1; // Counter for the series elements.

    // Loop until the current sum reaches or exceeds the target value.
    while (currentSum < targetVal) {
      currentSum += iteratorCount; // Add the current counter to the sum.
      iteratorCount++; // Increment the counter for the next iteration.
    }
    // Return the index that resulted in the sum being just less than or equal to targetVal.
    return iteratorCount - 1;
  }

  // Perform prime factorization on the numeric input.
  let factorMap = primeFactorDecomposition(numericData);
  let finalResult = 0; // Initialize the accumulator for the final answer.

  // Iterate over each unique prime factor found.
  Object.keys(factorMap)
    .forEach(function (factorKey) {
      // For each factor, apply the triangular sum index calculation to its exponent
      // and add it to the final result.
      finalResult += triangularSumIndex(factorMap[factorKey]);
    });

  // Output the computed final result.
  console.log(finalResult);
}

// Execute the main program with input read from standard input,
// after converting it to a string and trimming any whitespace.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// Function to compute a lexicographical rank for a given sequence.
// It assumes a global array `applicationConfigSettings` is available.
function lexicographicalRank(inputSequence) {
  let availableElements = [];
  for (let counter = 0; counter < applicationConfigSettings[0]; counter++) {
    availableElements.push(counter + 1);
  }
  let totalRank = 0;
  for (let counter = 0; counter < inputSequence.length; counter++) {
    let foundIndex = availableElements.findIndex(currentElement => currentElement === inputSequence[counter]);
    totalRank += computeFactorial(inputSequence.length - 1 - counter) * foundIndex;
    availableElements.splice(foundIndex, 1);
  }
  return totalRank;
}

// Calculates the sum of all elements within a numeric collection.
function calculateArrayTotal(numericCollection) {
  let accumulatedValue = 0;
  for (let loopIndex = 0, collectionLength = numericCollection.length; loopIndex < collectionLength; ++loopIndex) {
    accumulatedValue += numericCollection[loopIndex] * 1; // Explicit type coercion.
  }
  return accumulatedValue;
}

// Logs a message to the console only if verbose logging is enabled.
function logIfVerbose(messageContent) {
  if (verboseLog === true) {
    console.log(messageContent);
  }
}

// Locates the index of the maximum value within a given data array.
function findMaximumIndex(dataArray) {
  let currentMax = Number.MIN_SAFE_INTEGER;
  let maxIndex = -1;
  for (let elementIndex = 0; elementIndex < dataArray.length; elementIndex++) {
    if (currentMax < dataArray[elementIndex]) {
      currentMax = dataArray[elementIndex];
      maxIndex = elementIndex;
    }
  }
  return maxIndex;
}

// Locates the index of the minimum value within a given data list.
function findMinimumIndex(dataList) {
  let currentMin = Number.MAX_SAFE_INTEGER;
  let minIndex = -1;
  for (let listIndex = 0; listIndex < dataList.length; listIndex++) {
    if (currentMin > dataList[listIndex]) {
      currentMin = dataList[listIndex];
      minIndex = listIndex;
    }
  }
  return minIndex;
}

// Converts an array of strings into a 2D array of characters.
function convertToOneByTwo(inputStrings) {
  for (let stringIterator = 0; stringIterator < inputStrings.length; stringIterator++) {
    inputStrings[stringIterator] = inputStrings[stringIterator].split('');
  }
  return inputStrings;
}

// Determines if a given number is a prime number.
function checkPrimeStatus(candidateNumber) {
  if (!Number.isInteger(candidateNumber)) { // Ensure input is an integer.
    return false;
  }
  if (candidateNumber <= 1) { // Numbers less than or equal to 1 are not prime.
    return false;
  }
  if (2 === candidateNumber) { // 2 is the only even prime number.
    return true;
  }
  if (0 === candidateNumber % 2) { // Other even numbers are not prime.
    return false;
  }
  let rootFloor = Math.floor(Math.sqrt(candidateNumber)); // Calculate integer square root.
  for (let divisor = 3; divisor <= rootFloor; divisor += 2) { // Check odd divisors up to the square root.
    if (0 === candidateNumber % divisor) {
      return false; // Found a divisor, so not prime.
    }
  }
  return true; // No divisors found, it's prime.
}

// Validates if a given string represents a non-negative integer.
function validateNumericString(inputString) {
  const numericPattern = /^([1-9]\d*|0)$/; // Regex for non-negative integers.
  return numericPattern.test(inputString);
}

// Computes the factorial of a non-negative integer using recursion.
function computeFactorial(inputNumber) {
  if (inputNumber === 0) {
    return 1;
  }
  return inputNumber * computeFactorial(inputNumber - 1);
}

// Rotates a 2D matrix by 90 degrees clockwise.
function rotateMatrix(inputMatrix) {
  const originalRows = inputMatrix.length;
  const originalCols = inputMatrix[0].length;
  const lastRowIndex = originalRows - 1; // Index of the last row.

  let rotatedMatrix = new Array(originalCols); // New matrix with swapped dimensions.
  for (let colIndex = 0; colIndex < originalCols; colIndex++) {
    rotatedMatrix[colIndex] = new Array(originalRows);
    for (let rowIndex = 0; rowIndex < originalRows; rowIndex++) {
      // Perform the rotation transformation.
      rotatedMatrix[colIndex][rowIndex] = inputMatrix[lastRowIndex - rowIndex][colIndex];
    }
  }
  return rotatedMatrix;
}

// Inserts elements from a source array into a target array starting at a specified index.
function insertPartialArray(targetArray, elementsToInsert, startIndex) {
  for (let targetIndex = startIndex, insertIndex = 0; insertIndex < elementsToInsert.length; targetIndex++, insertIndex++) {
    targetArray[targetIndex] = elementsToInsert[insertIndex];
  }
  return targetArray;
}

// Reverses a segment of an array between start and end indices (inclusive, 1-based).
function reverseSegment(mainArray, segmentStart, segmentEnd) {
  let reversedSegment = mainArray.slice(segmentStart - 1, segmentEnd); // Extract the segment.
  reversedSegment.reverse(); // Reverse the extracted segment.
  mainArray = insertPartialArray(mainArray, reversedSegment, segmentStart - 1); // Insert it back.
  return mainArray;
}

// Pads a number with leading zeros to reach a desired length.
function padWithZeros(inputNum, desiredLength) {
  // Concatenate with a long string of zeros and then slice to the desired length.
  return (inputNum + '000000000000000000000000000000000').slice(0, desiredLength);
}

// Calculates the sum of all elements within a numeric collection.
// This is a duplicate implementation, maintaining original structure.
function calculateArrayTotal(numericCollection) {
  let accumulatedValue = 0;
  for (let loopIndex = 0, collectionLength = numericCollection.length; loopIndex < collectionLength; ++loopIndex) {
    accumulatedValue += numericCollection[loopIndex] * 1; // Explicit type coercion.
  }
  return accumulatedValue;
}

// Performs prime factorization on a given integer and returns factors with their counts.
function primeFactorDecomposition(inputNumberToFactor) {
  let factorCounts = {}; // Object to store prime factors and their exponents.

  if (inputNumberToFactor === 1) { // Special case for 1.
    return {"1": 1};
  }

  let currentDivisorCandidate = 2; // Start checking for divisibility from 2.

  // Continue factorization until the number becomes 1.
  while (inputNumberToFactor !== 1) {
    let testDivisor = currentDivisorCandidate; // Initialize inner loop divisor.
    // Iterate through potential divisors.
    while (testDivisor < maxIntVal) {
      if (inputNumberToFactor % testDivisor === 0) { // If divisible.
        inputNumberToFactor /= testDivisor; // Divide the number.
        if (!(factorCounts[testDivisor] > 0)) { // Initialize count if factor is new.
          factorCounts[testDivisor] = 0;
        }
        factorCounts[testDivisor]++; // Increment the factor's count.
        break; // Move to the next number after division.
      }
      testDivisor++; // Increment divisor if not found.
    }
    currentDivisorCandidate = testDivisor; // Update the starting point for the next outer loop.
  }
  return factorCounts; // Return the map of prime factors.
}

// Computes the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
function greatestCommonDivisor(firstNum, secondNum) {
  if (secondNum === 0) {
    return firstNum;
  }
  return greatestCommonDivisor(secondNum, firstNum % secondNum);
}

// Computes the least common multiple (LCM) of two numbers.
function leastCommonMultiple(valOne, valTwo) {
  // Inner helper function to calculate GCD (Euclidean algorithm).
  let gcdInternal = (numX, numY) => numY ? gcdInternal(numY, numX % numY) : numX;
  // LCM formula: (a * b) / GCD(a, b).
  return valOne * valTwo / gcdInternal(valOne, valTwo);
}

// Returns the difference between two operands, primarily for sorting functions.
function numericDifference(operandA, operandB) {
  return operandA - operandB;
}

// Performs a binary search to find the index of the largest element
// that is less than or equal to the target value in a sorted array.
function binarySearchLargestLessThanOrEqual(sortedArray, targetValue) {
  let foundIdx = -1; // Stores the index if an exact match is found.

  // Pointers for the search range.
  let leftBound = 0;
  let rightBound = sortedArray.length - 1;

  // Continue searching while the bounds are valid.
  while (leftBound <= rightBound) {
    // Calculate the middle index.
    let midPoint = Math.floor((leftBound + rightBound) / 2);

    // Compare the middle element with the target value.
    if (sortedArray[midPoint] === targetValue) {
      foundIdx = midPoint; // Exact match found.
      break; // Terminate search.
    } else if (sortedArray[midPoint] < targetValue) {
      // If middle is less than target, search in the right half.
      leftBound = midPoint + 1;
    } else {
      // If middle is greater than target, search in the left half.
      rightBound = midPoint - 1;
    }
  }
  // If an exact match was found, return its index.
  // Otherwise, 'leftBound' will point to the first element greater than target,
  // or `sortedArray.length` if all elements are less than or equal to target.
  // The original implementation returns `left` in this case, which is the insertion point.
  // This means if no exact match, it returns the index where `searchValue` would be inserted
  // to maintain sorted order, which is also the index of the first element greater than `searchValue`.
  // To get "largest less than or equal", if `foundIdx` is -1, then `leftBound - 1` would be the index
  // of the largest element less than `targetValue`.
  // The original code `if(index!=-1) return index; else return left;` implies returning the insertion point
  // if not found. Let's maintain this exact behavior.
  if (foundIdx !== -1) return foundIdx;
  else return leftBound;
}

// Splits an input text string into an array of lines based on newline characters.
function splitByNewline(textInput) {
  return textInput.split("\n");
}

// Checks if a given array is sorted in non-decreasing order.
function isCollectionSorted(testCollection) {
  let isOrdered = true; // Flag to track sort status.
  for (let comparisonIndex = 1; comparisonIndex < testCollection.length; comparisonIndex++) {
    if (testCollection[comparisonIndex - 1] > testCollection[comparisonIndex]) {
      isOrdered = false; // Found an out-of-order pair.
      break; // No need to check further.
    }
  }
  return isOrdered;
}

// Decomposes an integer into its prime factors and their corresponding exponents.
function decomposeIntoPrimes(inputNumberValue) {
  // Store the integer square root for optimization.
  let sqrtValue = Math.floor(Math.sqrt(inputNumberValue));

  let exponentCount = 0; // Counter for the exponent of a prime factor.

  let primeFactorsMap = {}; // Object to hold prime factors and their powers.

  // Iterate from 2 up to the square root to find prime factors.
  for (let currentFactor = 2; currentFactor <= sqrtValue; currentFactor++) {
    if ((inputNumberValue % currentFactor) === 0) { // If currentFactor is a divisor.
      exponentCount = 0; // Reset exponent counter for this new prime factor.

      // Keep dividing by currentFactor as long as it's divisible.
      do {
        exponentCount++; // Increment exponent.
        inputNumberValue = inputNumberValue / currentFactor;
      } while ((inputNumberValue % currentFactor) === 0);

      // Store the prime factor and its calculated exponent.
      primeFactorsMap[currentFactor] = exponentCount;
    }
  }

  // If after divisions, the remaining number is greater than its original square root,
  // it means the remaining number itself is a prime factor.
  if (inputNumberValue > sqrtValue) {
    primeFactorsMap[inputNumberValue] = 1;
  }

  return primeFactorsMap; // Return the map of prime factors.