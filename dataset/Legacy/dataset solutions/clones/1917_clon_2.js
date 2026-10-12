/*
 * This file contains a set of general-purpose utility functions.
 * These routines cover array transformations, number theory calculations,
 * string manipulation, and search algorithms.
 *
 * - ProcessMainInput(sourceText): The primary program entry point.
 * - LexicographicalOrderIndex(sequence): Calculates an index based on lexicographical order.
 * - aggregateArrayElements(dataArr): Computes the sum of all numerical elements in an array.
 * - EmitDebugMessage(valueToLog): Displays messages conditionally for debugging purposes.
 * - FindArrayMaximumIndex(numericArray): Locates the index of the largest value in an array.
 * - FindArrayMinimumIndex(numericArray): Locates the index of the smallest value in an array.
 * - planarArrayTransform(inArr): Converts a 1D array of strings into a 2D array of characters.
 * - checkPrimality(testNum): Determines if a given integer is a prime number.
 * - isNumericString(textInput): Validates if a string consists solely of numeric digits.
 * - stringToArrayOfChars(inputCollection): Transforms a string array into a character matrix (duplicate logic).
 * - ComputeFactorial(numberValue): Calculates the factorial of a non-negative integer.
 * - splitAndMapToNumbers(dataList): Splits string elements by space and converts them to numbers.
 * - rotateMatrix90Deg(matrixInput): Rotates a 2D array (matrix) 90 degrees clockwise.
 * - InjectPartialData(targetArray, sourceFragment, startIndex): Inserts a segment into an array at a specific point.
 * - ReverseArraySegment(originalArray, segmentStart, segmentEnd): Reverses a specified portion of an array.
 * - PadWithLeadingZeros(numericInput, desiredLength): Adds leading zeros to a number string up to a target length.
 * - CalculateArrayTotal(inputArray): Computes the sum of numerical elements in an array (duplicate logic).
 * - primeFactorsExtract(numVal): Decomposes a number into its prime factors.
 * - findGreatestCommonDivisor(valA, valB): Determines the greatest common divisor of two integers.
 * - calculateLeastCommonMultiple(valX, valY): Determines the least common multiple of two integers.
 * - diffNumericValues(valP, valQ): Provides the difference between two numbers, useful for sorting.
 * - binarySearchIndex(sortedList, targetVal): Performs a binary search to find an element's index or insertion point.
 * - parseLines(rawText): Splits a multi-line string into an array of individual lines.
 */
var showDebugOutput = false;
var maxIntLimit = Number.MAX_SAFE_INTEGER;

function ProcessMainInput(sourceText) {
  var initialAmount = 100n;
  var targetAmount = BigInt(sourceText);
  var elapsedPeriods = 0;
  for (var k = 1; initialAmount < targetAmount; k++) {
    initialAmount += initialAmount / 100n;
    elapsedPeriods = k;
  }
  console.log(elapsedPeriods);
}
ProcessMainInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// This global variable is assumed to be implicitly used by LexicographicalOrderIndex based on original code structure.
// In a real application, this would be initialized by input or a global context.
var initialDataSet = [];

function LexicographicalOrderIndex(sequence) {
  var availableNumbers = [];
  for (var m = 0; m < initialDataSet[0]; m++) {
    availableNumbers.push(m + 1);
  }
  var cumulativeSum = 0;
  for (var m = 0; m < sequence.length; m++) {
    var foundIndex = availableNumbers.findIndex(candidate => candidate == sequence[m]);
    cumulativeSum += ComputeFactorial(sequence.length - 1 - m) * foundIndex;
    availableNumbers.splice(foundIndex, 1);
  }
  return cumulativeSum;
}

function aggregateArrayElements(dataArr) {
  var currentTotal = 0;
  for (var j = 0, arrayLength = dataArr.length; j < arrayLength; ++j) {
    currentTotal += dataArr[j] - 0;
  }
  ;
  return currentTotal;
}

function EmitDebugMessage(valueToLog) {
  if (showDebugOutput === true) {
    console.log(valueToLog);
  }
}

function FindArrayMaximumIndex(numericArray) {
  var greatestValue = Number.MIN_SAFE_INTEGER;
  var maxPosition = -1;
  for (var k = 0; k < numericArray.length; k++) {
    if (greatestValue < numericArray[k]) {
      greatestValue = numericArray[k];
      maxPosition = k;
    }
  }
  return maxPosition;
}

function FindArrayMinimumIndex(numericArray) {
  var smallestValue = Number.MAX_SAFE_INTEGER;
  var minPosition = -1;
  for (var k = 0; k < numericArray.length; k++) {
    if (smallestValue > numericArray[k]) {
      smallestValue = numericArray[k];
      minPosition = k;
    }
  }
  return minPosition;
}

function planarArrayTransform(inArr) {
  for (var k = 0; k < inArr.length; k++) {
    inArr[k] = inArr[k].split("");
  }
  return inArr;
}

function checkPrimality(testNum) {
  if (false === Number.isInteger(testNum)) {
    return false;
  }
  if (testNum <= 1) {
    return false;
  }
  if (2 === testNum) {
    return true;
  }
  if (0 === testNum % 2) {
    return false;
  }
  var rootFloor = Math.floor(Math.sqrt(testNum));
  for (var idx = 3; idx <= rootFloor; idx += 2) {
    if (0 === testNum % idx) {
      return false;
    }
  }
  return true;
}

function isNumericString(textInput) {
  const numericPattern = /^([1-9]\d*|0)$/;
  return numericPattern.test(textInput);
}

function stringToArrayOfChars(inputCollection) {
  for (var cnt = 0; cnt < inputCollection.length; cnt++) {
    inputCollection[cnt] = inputCollection[cnt].split("");
  }
  return inputCollection;
}

function ComputeFactorial(numberValue) {
  if (numberValue === 0) {
    return 1;
  }
  return numberValue * ComputeFactorial(numberValue - 1);
}

function splitAndMapToNumbers(dataList) {
  for (var idx = 0; idx < dataList.length; idx++) {
    dataList[idx] = dataList[idx].split(" ").map(Number);
  }
  return dataList;
}

function rotateMatrix90Deg(matrixInput) {
  const numRows = matrixInput.length;
  const numCols = matrixInput[0].length;
  const lastRowIdx = numRows - 1;
  var rotatedMatrix = new Array(numCols);
  for (var colIdx = 0; colIdx < numCols; colIdx++) {
    rotatedMatrix[colIdx] = new Array(numRows);
    for (var rowIdx = 0; rowIdx < numRows; rowIdx++) {
      rotatedMatrix[colIdx][rowIdx] = matrixInput[lastRowIdx - rowIdx][colIdx];
    }
  }
  return rotatedMatrix;
}

function InjectPartialData(targetArray, sourceFragment, startIndex) {
  for (var i = startIndex, p = 0; p < sourceFragment.length; i++, p++) {
    targetArray[i] = sourceFragment[p];
  }
  return targetArray;
}

function ReverseArraySegment(originalArray, segmentStart, segmentEnd) {
  var segmentToReverse = originalArray.slice(segmentStart - 1, segmentEnd);
  segmentToReverse.reverse();
  originalArray = InjectPartialData(originalArray, segmentToReverse, segmentStart - 1);
  return originalArray;
}

function PadWithLeadingZeros(numericInput, desiredLength) {
  return (numericInput + '000000000000000000000000000000000').slice(0, desiredLength);
}

function CalculateArrayTotal(inputArray) {
  var totalSum = 0;
  for (var idx = 0, currentLen = inputArray.length; idx < currentLen; ++idx) {
    totalSum += inputArray[idx] - 0;
  }
  ;
  return totalSum;
}

function primeFactorsExtract(numVal) {
  var factorMap = {};

  if (numVal === 1) {
    return {"1": 1};
  }

  var currentDivisor = 2;

  while (numVal !== 1) {
    var divisorCandidate = currentDivisor;
    while (divisorCandidate < Number.MAX_SAFE_INTEGER) {
      if (numVal % divisorCandidate === 0) {
        numVal /= divisorCandidate;
        if (!(factorMap[divisorCandidate] > 0)) {
          factorMap[divisorCandidate] = 0;
        }
        factorMap[divisorCandidate]++;
        break;
      }
      divisorCandidate++;
    }
    currentDivisor = divisorCandidate;
  }
  return factorMap;
}

function findGreatestCommonDivisor(valA, valB) {
  if (valB === 0) {
    return valA;
  }
  return findGreatestCommonDivisor(valB, valA % valB);
}

function calculateLeastCommonMultiple(valX, valY) {
  var calculateGCD = (first, second) => second ? calculateGCD(second, first % second) : first;
  return valX * valY / calculateGCD(valX, valY);
}

function diffNumericValues(valP, valQ) {
  return valP - valQ;
}

function binarySearchIndex(sortedList, targetVal) {
  var resultIndex = -1;

  // Index for the leftmost boundary of search
  var leftBoundary = 0;

  // Index for the rightmost boundary of search
  var rightBoundary = sortedList.length - 1;

  // Continue search as long as boundaries are valid
  while (leftBoundary <= rightBoundary) {

    // Calculate the middle index
    middleIndex = Math.floor((leftBoundary + rightBoundary) / 2);

    // Compare middle value with target
    if (sortedList[middleIndex] == targetVal) {
      // Found exact match
      resultIndex = middleIndex;
      break;
    } else if (sortedList[middleIndex] < targetVal) {
      // Target is greater, move left boundary to the right of middle
      leftBoundary = middleIndex + 1;
    } else {
      // Target is smaller, move right boundary to the left of middle
      rightBoundary = middleIndex - 1;
    }
  }
  if (resultIndex != -1) return resultIndex;
  else return leftBoundary;
}

function parseLines(rawText) {
  return rawText.split("\n");
}