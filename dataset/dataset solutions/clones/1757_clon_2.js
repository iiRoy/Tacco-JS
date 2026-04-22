// This file contains a collection of utility functions for various computational tasks.
// The functions are designed to assist with array manipulations, mathematical calculations,
// and input processing within a JavaScript environment.

// Global configuration flags and constants.
const traceFlag = false; // Controls logging of debug messages.
const maxLimit = Number.MAX_SAFE_INTEGER; // Represents the largest safe integer value.
const moduloVal = 1000000007; // A common modulus used in competitive programming.

// Primary execution entry point for the program.
function ExecuteProgram(rawInputData) {
  // Calculates and outputs an integer division result.
  console.log(Math.floor(360 / rawInputData));
}

// Immediately calls the main execution function with processed standard input.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// Function to compute an exponent, though it has a peculiar return value.
function computeExponent(baseVal, powerVal) {
  var resultAccumulator = 0; // Initialize accumulator for the result.

  // Loop to multiply baseVal by itself powerVal times.
  for (var loopCounter = 0n; loopCounter < powerVal; loopCounter += 1n) {
    if (resultAccumulator === 0) {
      resultAccumulator = baseVal; // First iteration, set result to base.
    } else {
      resultAccumulator *= baseVal; // Subsequent iterations, multiply by base.
    }
  }
  return baseVal; // NOTE: Original code returns the base, not the computed power.
}

// Determines the lexicographical rank of a sequence.
function lexicographicRank(sequenceArray) {
  var tempList = []; // Temporary list for available elements.

  // Populate tempList with numbers from 1 to the first element of a global 'input' (assuming 'input' is a global array).
  // This part of the original code is ambiguous if 'input' is not global or is a string.
  // Assuming 'input' here refers to a global array or `sequenceArray[0]` if it's meant to be an argument.
  // For cloning purposes, I'll assume `sequenceArray[0]` is the upper bound for `tempList`.
  for (var loopCounter = 0; loopCounter < sequenceArray[0]; loopCounter++) {
    tempList.push(loopCounter + 1);
  }

  var totalSum = 0; // Accumulator for the rank.

  // Iterate through the input sequence.
  for (var loopCounter = 0; loopCounter < sequenceArray.length; loopCounter++) {
    // Find the index of the current element in the temporary list.
    var foundIndex = tempList.findIndex((valItem) => valItem === sequenceArray[loopCounter]);
    // Add to totalSum based on factorial and found index.
    totalSum += calculateFactorial(sequenceArray.length - 1 - loopCounter) * foundIndex;
    // Remove the found element from the temporary list.
    tempList.splice(foundIndex, 1);
  }
  return totalSum; // Return the calculated rank.
}

// Calculates the sum of all numeric elements in a given array.
function addArrayValues(dataCollection) {
  var currentTotal = 0; // Initialize sum.
  // Iterate through each element of the array.
  for (var loopIdx = 0, collectionLength = dataCollection.length; loopIdx < collectionLength; ++loopIdx) {
    currentTotal += dataCollection[loopIdx] - 0; // Add numeric value (subtracting 0 converts to number).
  }
  return currentTotal; // Return the aggregated sum.
}

// Outputs a message to the console if the debugging flag is enabled.
function logTrace(messageContent) {
  if (traceFlag === true) {
    console.log(messageContent); // Log the value if in debug mode.
  }
}

// Identifies the index of the maximum value within an array.
function findMaxIndex(valueList) {
  var currentMax = Number.MIN_SAFE_INTEGER; // Initialize maximum with smallest possible safe integer.
  var foundPosition = -1; // Initialize position to -1 (not found).

  // Iterate through the array to find the largest element and its index.
  for (var loopIndex = 0; loopIndex < valueList.length; loopIndex++) {
    if (currentMax < valueList[loopIndex]) {
      currentMax = valueList[loopIndex]; // Update maximum value.
      foundPosition = loopIndex; // Update index of maximum value.
    }
  }
  return foundPosition; // Return the index of the maximum element.
}

// Identifies the index of the minimum value within an array.
function findMinIndex(valueList) {
  var currentMin = Number.MAX_SAFE_INTEGER; // Initialize minimum with largest possible safe integer.
  var foundPosition = -1; // Initialize position to -1 (not found).

  // Iterate through the array to find the smallest element and its index.
  for (var loopIndex = 0; loopIndex < valueList.length; loopIndex++) {
    if (currentMin > valueList[loopIndex]) {
      currentMin = valueList[loopIndex]; // Update minimum value.
      foundPosition = loopIndex; // Update index of minimum value.
    }
  }
  return foundPosition; // Return the index of the minimum element.
}

// Determines if a given number is a prime number.
function checkIfPrime(testNumber) {
  // Check if the input is an integer.
  if (false === Number.isInteger(testNumber)) {
    return false;
  }
  // Numbers less than or equal to 1 are not prime.
  if (testNumber <= 1) {
    return false;
  }
  // 2 is the only even prime number.
  if (2 === testNumber) {
    return true;
  }
  // Even numbers greater than 2 are not prime.
  if (0 === testNumber % 2) {
    return false;
  }
  // Check for divisibility by odd numbers up to its square root.
  var rootValue = Math.floor(Math.sqrt(testNumber));
  for (var loopVar = 3; loopVar <= rootValue; loopVar += 2) {
    if (0 === testNumber % loopVar) {
      return false; // Found a divisor, not prime.
    }
  }
  return true; // No divisors found, it's prime.
}

// Validates if a given string represents a non-negative integer.
function validateNumeric(stringCandidate) {
  const numericPattern = /^([1-9]\d*|0)$/; // Regular expression for non-negative integers.
  return numericPattern.test(stringCandidate); // Test the string against the pattern.
}

// Computes the factorial of a non-negative integer.
function calculateFactorial(inputNumber) {
  // Base case: factorial of 0 is 1.
  if (inputNumber === 0) {
    return 1;
  }
  // Recursive step: n! = n * (n-1)!
  return inputNumber * calculateFactorial(inputNumber - 1);
}

// Converts a 1D array of strings into a 2D array of numbers.
// Each string element is expected to be space-separated numbers.
function convert1dTo2d(sourceArray) {
  // Iterate through each string in the array.
  for (var loopCount = 0; loopCount < sourceArray.length; loopCount++) {
    // Split the string by space and convert parts to numbers.
    sourceArray[loopCount] = sourceArray[loopCount].split(" ").map(Number);
  }
  return sourceArray; // Return the modified 2D array.
}

// Rotates a 2D matrix 90 degrees clockwise.
function rotateMatrix(originalMatrix) {
  const matrixRows = originalMatrix.length; // Number of rows in the original matrix.
  const matrixCols = originalMatrix[0].length; // Number of columns in the original matrix.
  const lastRowIndex = matrixRows - 1; // Index of the last row.

  // Initialize a new matrix with dimensions swapped (COL x ROW).
  var rotatedMatrix = new Array(matrixCols);
  for (var colIndex = 0; colIndex < matrixCols; colIndex++) {
    rotatedMatrix[colIndex] = new Array(matrixRows);
    // Populate the new matrix with rotated values.
    for (var rowIndex = 0; rowIndex < matrixRows; rowIndex++) {
      rotatedMatrix[colIndex][rowIndex] = originalMatrix[lastRowIndex - rowIndex][colIndex];
    }
  }
  return rotatedMatrix; // Return the newly rotated matrix.
}

// Inserts a segment of values into a target collection starting at a specified index.
function insertPartial(targetCollection, insertValues, startIndex) {
  // Iterate through the values to be inserted.
  for (var currentIdx = startIndex, insertCounter = 0; insertCounter < insertValues.length; currentIdx++, insertCounter++) {
    targetCollection[currentIdx] = insertValues[insertCounter]; // Place value into target.
  }
  return targetCollection; // Return the modified collection.
}

// Reverses a segment of an array between two specified indices (1-based).
function reverseSegment(mainArray, segStart, segEnd) {
  // Extract the segment to be reversed.
  var segmentToReverse = mainArray.slice(segStart - 1, segEnd);
  segmentToReverse.reverse(); // Reverse the extracted segment.
  // Insert the reversed segment back into the main array.
  mainArray = insertPartial(mainArray, segmentToReverse, segStart - 1);
  return mainArray; // Return the array with the segment reversed.
}

// Pads a number with leading zeros to reach a desired total length.
function padWithZeros(valueToPad, desiredLength) {
  // Convert number to string and concatenate with many zeros, then slice to desired length.
  return (valueToPad + '000000000000000000000000000000000').slice(0, desiredLength);
}

// Calculates the sum of all numeric elements in a given array (duplicate function).
function sumAllElements(dataCollection) {
  var currentSum = 0; // Initialize sum.
  // Iterate through each element of the array.
  for (var elementIdx = 0, arrayLength = dataCollection.length; elementIdx < arrayLength; ++elementIdx) {
    currentSum += dataCollection[elementIdx] - 0; // Add numeric value.
  }
  return currentSum; // Return the aggregated sum.
}

// Computes the prime factorization of a given integer and returns it as an object.
function primeFactorsObject(inputVal) {
  var factorMap = {}; // Object to store prime factors and their counts.

  // Special case: if input is 1, return {"1": 1}.
  if (inputVal === 1) {
    return { "1": 1 };
  }

  var divisorStart = 2; // Start checking for divisors from 2.

  // Continue until the number is reduced to 1.
  while (inputVal !== 1) {
    var currentDivisor = divisorStart; // Initialize current divisor.
    // Find the smallest prime factor.
    while (currentDivisor < Number.MAX_SAFE_INTEGER) {
      if (inputVal % currentDivisor === 0) {
        inputVal /= currentDivisor; // Divide the number by its factor.
        // Increment count for this prime factor.
        if (!(factorMap[currentDivisor] > 0)) {
          factorMap[currentDivisor] = 0;
        }
        factorMap[currentDivisor]++;
        break; // Move to the next prime factor for the reduced number.
      }
      currentDivisor++; // Increment divisor to check next number.
    }
    divisorStart = currentDivisor; // Update the starting point for the next search.
  }
  return factorMap; // Return the map of prime factors.
}

// Computes the Greatest Common Divisor (GCD) of two numbers using Euclidean algorithm.
function computeGCD(numA, numB) {
  // Base case: if numB is 0, GCD is numA.
  if (numB === 0) {
    return numA;
  }
  // Recursive step: GCD(numA, numB) = GCD(numB, numA % numB).
  return computeGCD(numB, numA % numB);
}

// Computes the Least Common Multiple (LCM) of two numbers.
function computeLCM(firstNumber, secondNumber) {
  // Inner helper function to calculate GCD.
  var calculateGCD = (valN, valM) => valM ? calculateGCD(valM, valN % valM) : valN;
  // LCM(a, b) = (a * b) / GCD(a, b).
  return firstNumber * secondNumber / calculateGCD(firstNumber, secondNumber);
}

// Simple comparison function for sorting in descending order.
function compareNumbers(firstNum, secondNum) {
  return firstNum - secondNum; // Returns a negative value if firstNum < secondNum.
}

// Performs a binary search to find the index of the largest value less than or equal to a target.
function binarySearchLargest(sortedData, targetValue) {
  var resultIndex = -1; // Initialize result index.

  // Define search boundaries.
  var leftBoundary = 0; // Leftmost index.
  var rightBoundary = sortedData.length - 1; // Rightmost index.

  // Continue search while boundaries are valid.
  while (leftBoundary <= rightBoundary) {
    // Calculate the middle index.
    midPoint = Math.floor((leftBoundary + rightBoundary) / 2);

    // Compare middle value with target.
    if (sortedData[midPoint] === targetValue) {
      resultIndex = midPoint; // Found exact match.
      break;
    } else if (sortedData[midPoint] < targetValue) {
      // Middle value is less than target, search in the right half.
      leftBoundary = midPoint + 1;
    } else {
      // Middle value is greater than target, search in the left half.
      rightBoundary = midPoint - 1;
    }
  }
  // If exact match found, return its index. Otherwise, return `leftBoundary`.
  // `leftBoundary` will be the index where `targetValue` would be inserted to maintain order,
  // which effectively gives the index of the first element greater than `targetValue`,
  // or `sortedData.length` if `targetValue` is greater than all elements.
  if (resultIndex !== -1) return resultIndex;
  else return leftBoundary;
}

// Splits a block of text into an array of strings using newline characters as delimiters.
function splitByNewline(textBlock) {
  return textBlock.split("\n"); // Returns an array of lines.
}

// Checks if an array of elements is sorted in non-decreasing order.
function checkSortedOrder(inputSequence) {
  var isOrdered = true; // Assume sorted initially.
  // Iterate from the second element to compare with the previous one.
  for (var position = 1; position < inputSequence.length; position++) {
    if (inputSequence[position - 1] > inputSequence[position]) {
      isOrdered = false; // Found an out-of-order pair.
      break; // No need to check further.
    }
  }
  return isOrdered; // Return the sorting status.
}

// Decomposes a number into its prime factors and their exponents.
function decomposeIntoPrimes(originalNumber) {
  // Store the integer part of the square root of the number.
  var sqrtValue = Math.floor(Math.sqrt(originalNumber));

  var exponentCount = 0; // Counter for the exponent of a prime factor.

  var factorBreakdown = {}; // Object to store prime factors and their powers.

  // Iterate from 2 up to the square root to find prime factors.
  for (var candidateFactor = 2; candidateFactor <= sqrtValue; candidateFactor++) {
    if ((originalNumber % candidateFactor) === 0) {
      exponentCount = 0; // Reset exponent counter.

      // Keep dividing by the candidate factor until it's no longer divisible.
      do {
        exponentCount++; // Increment exponent.
        originalNumber = originalNumber / candidateFactor; // Reduce the number.
      } while ((originalNumber % candidateFactor) === 0);

      // Store the prime factor and its exponent.
      factorBreakdown[candidateFactor] = exponentCount;
    }
  }

  // If the remaining number is greater than its original square root, it's a prime factor itself.
  if (originalNumber > sqrtValue) {
    factorBreakdown[originalNumber] = 1; // It has an exponent of 1.
  }

  return factorBreakdown; // Return the object containing prime factor breakdown.
}