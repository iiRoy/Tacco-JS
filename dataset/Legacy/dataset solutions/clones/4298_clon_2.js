/*
 *  Utility Functions Collection:
 *  - convert1Dto2D(Array): Transforms a 1D array of strings into a 2D character matrix.
 *  - primeFactorsObject(N): Returns an object with prime factors and their counts for N.
 *  - greatestCommonDivisor(a, b): Calculates the Greatest Common Divisor of two numbers.
 *  - leastCommonMultiple(a, b): Calculates the Least Common Multiple of two numbers.
 *  - numericDifference(a, b): Returns a - b, useful for sorting.
 *  - checkPrime(n): Returns true if n is a prime number, false otherwise.
 *  - validateNumberString(n): Returns true if n is a valid number string, false otherwise.
 *  - calculateArraySum(arr): Computes the sum of all elements in a numeric array.
 *  - binarySearchLargestSmallerOrEqual(arr, n): Finds the index of the largest number less than or equal to n in a sorted array.
 *  - splitByNewline(input): Splits a string by newline characters.
 */
const verboseLog = false;
const limitVal = Number.MAX_SAFE_INTEGER;
const moduloNum = 1000000007;

function ProcessInput(rawData) {
  let parsedData = rawData.split("\n");
  const dims = parsedData[0].split(" ").map(Number);
  parsedData.shift();
  let gridMatrix = convert1Dto2D(parsedData);

  for (let rowIdx = 0; rowIdx < gridMatrix.length; rowIdx++) {
    gridMatrix[rowIdx].push("^");
    gridMatrix[rowIdx].unshift("^");
  }

  const borderCharArr = Array(dims[1] + 2).fill("^");
  gridMatrix.push(borderCharArr);
  gridMatrix.unshift(borderCharArr);

  for (let colIdx = 0; colIdx < gridMatrix[0].length; colIdx++) {
    for (let rowIdx = 0; rowIdx < gridMatrix.length; rowIdx++) {
      if (gridMatrix[rowIdx][colIdx] === ".") {
        let neighborCount = 0;
        for (let adjRow = -1; adjRow < 2; adjRow++) {
          for (let adjCol = -1; adjCol < 2; adjCol++) {
            if (gridMatrix[rowIdx + adjRow][colIdx + adjCol] === "#") {
              neighborCount++;
            }
          }
        }
        gridMatrix[rowIdx][colIdx] = neighborCount;
      }
    }
  }

  gridMatrix.pop();
  gridMatrix.shift();

  for (let rowIdx = 0; rowIdx < gridMatrix.length; rowIdx++) {
    gridMatrix[rowIdx].pop();
    gridMatrix[rowIdx].shift();
    gridMatrix[rowIdx] = gridMatrix[rowIdx].join("");
  }

  console.info(gridMatrix.join("\n"));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function lexicalOrderIndex(inputSequence) {
  let availableElements = [];
  for (let i = 0; i < input[0]; i++) {
    availableElements.push(i + 1);
  }
  let totalSum = 0;
  for (let i = 0; i < inputSequence.length; i++) {
    const foundIndex = availableElements.findIndex(val => val === inputSequence[i]);
    totalSum += calcFactorial(inputSequence.length - 1 - i) * foundIndex;
    availableElements.splice(foundIndex, 1);
  }
  return totalSum;
}

function calculateArraySum(numericArray) {
  let total = 0;
  for (let i = 0, arrayLength = numericArray.length; i < arrayLength; ++i) {
    total += numericArray[i] - 0;
  }
  return total;
}

function logVerbose(messageContent) {
  if (verboseLog === true) {
    console.log(messageContent);
  }
}

function findMaxElementIndex(valueList) {
  let maxValue = Number.MIN_SAFE_INTEGER;
  let maxIndex = -1;
  for (let i = 0; i < valueList.length; i++) {
    if (maxValue < valueList[i]) {
      maxValue = valueList[i];
      maxIndex = i;
    }
  }
  return maxIndex;
}

function findMinElementIndex(valueList) {
  let minValue = Number.MAX_SAFE_INTEGER;
  let minIndex = -1;
  for (let i = 0; i < valueList.length; i++) {
    if (minValue > valueList[i]) {
      minValue = valueList[i];
      minIndex = i;
    }
  }
  return minIndex;
}

function convert1Dto2D(inputLines) {
  for (let i = 0; i < inputLines.length; i++) {
    inputLines[i] = inputLines[i].split("");
  }
  return inputLines;
}

function checkPrime(testNumber) {
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
  for (let divisorCandidate = 3; divisorCandidate <= sqrtVal; divisorCandidate += 2) {
    if (0 === testNumber % divisorCandidate) {
      return false;
    }
  }
  return true;
}

function validateNumberString(inputString) {
  const numericPattern = /^([1-9]\d*|0)$/;
  return numericPattern.test(inputString);
}

function calcFactorial(inputNum) {
  if (inputNum === 0) {
    return 1;
  }
  return inputNum * calcFactorial(inputNum - 1);
}

function rotateMatrix90Deg(originalMatrix) {
  const numRows = originalMatrix.length;
  const numCols = originalMatrix[0].length;
  const lastRowIdx = numRows - 1;
  let rotatedMatrix = new Array(numCols);

  for (let colCounter = 0; colCounter < numCols; colCounter++) {
    rotatedMatrix[colCounter] = new Array(numRows);
    for (let rowCounter = 0; rowCounter < numRows; rowCounter++) {
      rotatedMatrix[colCounter][rowCounter] = originalMatrix[lastRowIdx - rowCounter][colCounter];
    }
  }
  return rotatedMatrix;
}

function insertPartialArray(targetArray, sourceFragment, startIndex) {
  for (let targetIdx = startIndex, sourceIdx = 0; sourceIdx < sourceFragment.length; targetIdx++, sourceIdx++) {
    targetArray[targetIdx] = sourceFragment[sourceIdx];
  }
  return targetArray;
}

function reverseSubarray(mainArray, subStart, subEnd) {
  let reversedSegment = mainArray.slice(subStart - 1, subEnd);
  reversedSegment.reverse();
  mainArray = insertPartialArray(mainArray, reversedSegment, subStart - 1);
  return mainArray;
}

function padWithZeros(inputNumber, desiredLength) {
  return (inputNumber + '000000000000000000000000000000000').slice(0, desiredLength);
}

function computeArrayTotal(dataArray) {
  let totalSum = 0;
  for (let i = 0, dataLength = dataArray.length; i < dataLength; ++i) {
    totalSum += dataArray[i] - 0;
  }
  return totalSum;
}

function primeFactorsObject(targetNumber) {
  let factorCounts = {};

  if (targetNumber === 1) {
    return { "1": 1 };
  }

  let currentDivisor = 2;

  while (targetNumber !== 1) {
    let divisor = currentDivisor;
    while (divisor < Number.MAX_SAFE_INTEGER) {
      if (targetNumber % divisor === 0) {
        targetNumber /= divisor;
        if (!(factorCounts[divisor] > 0)) {
          factorCounts[divisor] = 0;
        }
        factorCounts[divisor]++;
        break;
      }
      divisor++;
    }
    currentDivisor = divisor;
  }
  return factorCounts;
}

function greatestCommonDivisor(numA, numB) {
  if (numB === 0) {
    return numA;
  }
  return greatestCommonDivisor(numB, numA % numB);
}

function leastCommonMultiple(valX, valY) {
  const calcGCD = (n, m) => m ? calcGCD(m, n % m) : n;
  return valX * valY / calcGCD(valX, valY);
}

function numericDifference(val1, val2) {
  return val1 - val2;
}

function binarySearchLargestSmallerOrEqual(sortedArray, targetValue) {
  let resultIndex = -1;

  // Index representing the left boundary of the search range.
  let leftBound = 0;

  // Index representing the right boundary of the search range.
  let rightBound = sortedArray.length - 1;

  // Continue the loop as long as there's a valid range to search within.
  while (leftBound <= rightBound) {
    // Calculate the middle index of the current search range.
    const midPoint = Math.floor((leftBound + rightBound) / 2);

    // Compare the value at the midpoint with the target value.
    if (sortedArray[midPoint] === targetValue) {
      // If a match is found, store the index and terminate the search.
      resultIndex = midPoint;
      break;
    } else if (sortedArray[midPoint] < targetValue) {
      // If the midpoint value is smaller, the target must be in the right half.
      // Move the left boundary to the right of the midpoint.
      leftBound = midPoint + 1;
    } else {
      // If the midpoint value is larger, the target must be in the left half.
      // Move the right boundary to the left of the midpoint.
      rightBound = midPoint - 1;
    }
  }
  // If an exact match was found, return its index.
  // Otherwise, 'leftBound' will point to the index where 'targetValue' would be inserted,
  // which also corresponds to the index of the first element greater than 'targetValue'.
  // If no match, we return 'leftBound' which indicates the insertion point for the target or the first element larger than it.
  if (resultIndex !== -1) return resultIndex;
  else return leftBound;
}

function splitByNewline(textInput) {
  return textInput.split("\n");
}

function isSortedAscending(dataSequence) {
  let isOrderly = true;
  for (let i = 1; i < dataSequence.length; i++) {
    if (dataSequence[i - 1] > dataSequence[i]) {
      isOrderly = false;
      break;
    }
  }
  return isOrderly;
}

function detailedPrimeFactorization(numberToFactor) {
  // Store the integer part of the square root of the number.
  let squareRootLimit = Math.floor(Math.sqrt(numberToFactor));

  let exponentCount = 0; // Counter for the exponent of a prime factor.

  let primeFactorsMap = {}; // Object to store prime factors and their exponents.

  // Iterate from 2 up to the square root to find prime factors.
  for (let currentFactor = 2; currentFactor <= squareRootLimit; currentFactor++) {
    if ((numberToFactor % currentFactor) === 0) {
      exponentCount = 0; // Reset exponent counter for the new prime factor.

      do {
        exponentCount++; // Increment exponent.
        numberToFactor = numberToFactor / currentFactor; // Divide the number by its factor.
      } while ((numberToFactor % currentFactor) === 0);

      // Store the prime factor and its calculated exponent.
      primeFactorsMap[currentFactor] = exponentCount;
    }
  }

  // If after the loop, 'numberToFactor' is greater than 'squareRootLimit',
  // it means the remaining 'numberToFactor' is itself a prime number.
  if (numberToFactor > squareRootLimit) {
    primeFactorsMap[numberToFactor] = 1;
  }

  return primeFactorsMap;
}