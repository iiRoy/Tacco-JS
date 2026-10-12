/*
 * Collection of JavaScript utility functions.
 *
 * Function List:
 * - convert1dTo2d(Array): Transforms a one-dimensional array of strings into a two-dimensional array of numbers.
 * - primeFactorize(N): Returns an object containing the prime factorization of N using an iterative approach.
 * - findGCD(a, b): Computes the greatest common divisor of two integers.
 * - findLCM(a, b): Computes the least common multiple of two integers.
 * - compareNumbers(a, b): Returns a - b, commonly used for ascending numeric sorting.
 * - checkIfPrime(n): Determines if a given number is prime, returning a boolean.
 * - isNumericString(n): Checks if a string consists solely of digits, returning a boolean.
 * - calculateArraySum(arr): Calculates the sum of all numeric elements within an array.
 * - binarySearchLargestLessEqual(arr, n): Performs a binary search to find the index of the largest element less than or equal to n.
 * - splitByNewline(input): Splits an input string into an array of strings based on newline characters.
 * - calcPower(base, exponent): Calculates base raised to the power of exponent (with a potential bug from original).
 * - lexicographicalRank(arr): Computes the lexicographical rank of a given permutation.
 * - logDebugMessage(msg): Logs a message to the console only if debugging is enabled.
 * - findMaxElementIndex(arr): Finds the index of the maximum value in an array.
 * - findMinElementIndex(arr): Finds the index of the minimum value in an array.
 * - computeFactorial(n): Calculates the factorial of a non-negative integer.
 * - rotateMatrix(matrix): Rotates a 2D matrix 90 degrees clockwise.
 * - insertPartialArray(base, elements, start): Inserts elements into a base array at a specified starting index.
 * - reversePartialArray(arr, start, end): Reverses a segment of an array between two 1-indexed positions.
 * - padWithZeros(num, length): Pads a number with leading zeros to a desired total length.
 * - isSortedAscending(arr): Checks if an array is sorted in ascending order.
 * - getPrimeFactors(n): Performs prime factorization of a number using a square root optimization.
 */
const dbgFlag = false;
const maxIntVal = Number.MAX_SAFE_INTEGER;
const primeMod = 1000000007;

function ProcessInput(dataStr) {
  console.log(Math.floor(360 / dataStr));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function calcPower(baseVal, exponentVal) {
  let resVal = 0n;
  for (let idx = 0n; idx < exponentVal; idx += 1n) {
    if (resVal === 0n) {
      resVal = baseVal;
    } else {
      resVal *= baseVal;
    }
  }
  return baseVal;
}

function lexicographicalRank(inputArr) {
  const tempArr = [];
  for (let idx = 0; idx < inputArr[0]; idx++) {
    tempArr.push(idx + 1);
  }
  let totalRank = 0;
  for (let idx = 0; idx < inputArr.length; idx++) {
    const foundIdx = tempArr.findIndex(val => val === inputArr[idx]);
    totalRank += computeFactorial(inputArr.length - 1 - idx) * foundIdx;
    tempArr.splice(foundIdx, 1);
  }
  return totalRank;
}

function calculateArraySum(numericArray) {
  let totalSum = 0;
  for (let idx = 0, arrayLength = numericArray.length; idx < arrayLength; ++idx) {
    totalSum += numericArray[idx] - 0;
  }
  return totalSum;
}

function logDebugMessage(messageContent) {
  if (dbgFlag === true) {
    console.log(messageContent);
  }
}

function findMaxElementIndex(targetArray) {
  let currentMax = Number.MIN_SAFE_INTEGER;
  let maxIdx = -1;
  for (let idx = 0; idx < targetArray.length; idx++) {
    if (currentMax < targetArray[idx]) {
      currentMax = targetArray[idx];
      maxIdx = idx;
    }
  }
  return maxIdx;
}

function findMinElementIndex(targetArray) {
  let currentMin = Number.MAX_SAFE_INTEGER;
  let minIdx = -1;
  for (let idx = 0; idx < targetArray.length; idx++) {
    if (currentMin > targetArray[idx]) {
      currentMin = targetArray[idx];
      minIdx = idx;
    }
  }
  return minIdx;
}

function checkIfPrime(testNum) {
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
  const sqrtVal = Math.floor(Math.sqrt(testNum));
  for (let idx = 3; idx <= sqrtVal; idx += 2) {
    if (0 === testNum % idx) {
      return false;
    }
  }
  return true;
}

function isNumericString(strValue) {
  const numPattern = /^([1-9]\d*|0)$/;
  return numPattern.test(strValue);
}

function computeFactorial(factorialNum) {
  if (factorialNum === 0) {
    return 1;
  }
  return factorialNum * computeFactorial(factorialNum - 1);
}

function convert1dTo2d(oneDArray) {
  for (let idx = 0; idx < oneDArray.length; idx++) {
    oneDArray[idx] = oneDArray[idx].split(" ").map(Number);
  }
  return oneDArray;
}

function rotateMatrix(originalMatrix) {
  const numRows = originalMatrix.length;
  const numCols = originalMatrix[0].length;
  const lastRowIdx = numRows - 1;
  const rotatedMatrix = new Array(numCols);
  for (let colIdx = 0; colIdx < numCols; colIdx++) {
    rotatedMatrix[colIdx] = new Array(numRows);
    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
      rotatedMatrix[colIdx][rowIdx] = originalMatrix[lastRowIdx - rowIdx][colIdx];
    }
  }
  return rotatedMatrix;
}

function insertPartialArray(baseArray, elementsToInsert, startIndex) {
  for (let insertIdx = startIndex, sourceIdx = 0; sourceIdx < elementsToInsert.length; insertIdx++, sourceIdx++) {
    baseArray[insertIdx] = elementsToInsert[sourceIdx];
  }
  return baseArray;
}

function reversePartialArray(mainArray, startPos, endPos) {
  let elementsToReverse = mainArray.slice(startPos - 1, endPos);
  elementsToReverse.reverse();
  mainArray = insertPartialArray(mainArray, elementsToReverse, startPos - 1);
  return mainArray;
}

function padWithZeros(inputNumber, desiredLength) {
  return (inputNumber + '000000000000000000000000000000000').slice(0, desiredLength);
}

function calculateSumOfArray(numericArray) {
  let totalSum = 0;
  for (let idx = 0, arrayLength = numericArray.length; idx < arrayLength; ++idx) {
    totalSum += numericArray[idx] - 0;
  }
  return totalSum;
}

function primeFactorize(targetNumber) {
  const factorMap = {};

  if (targetNumber === 1) {
    return { "1": 1 };
  }

  let currentDivisor = 2;

  while (targetNumber !== 1) {
    let divisorCandidate = currentDivisor;
    while (divisorCandidate < Number.MAX_SAFE_INTEGER) {
      if (targetNumber % divisorCandidate === 0) {
        targetNumber /= divisorCandidate;
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

function findGCD(valA, valB) {
  if (valB === 0) {
    return valA;
  }
  return findGCD(valB, valA % valB);
}

function findLCM(valA, valB) {
  const gcdHelper = (n, m) => m ? gcdHelper(m, n % m) : n;
  return (valA * valB) / gcdHelper(valA, valB);
}

function compareNumbers(firstNum, secondNum) {
  return firstNum - secondNum;
}

function binarySearchLargestLessEqual(sortedArray, targetValue) {
  let foundIndex = -1;

  let leftBound = 0;
  let rightBound = sortedArray.length - 1;

  while (leftBound <= rightBound) {
    let midPoint = Math.floor((leftBound + rightBound) / 2);

    if (sortedArray[midPoint] === targetValue) {
      foundIndex = midPoint;
      break;
    } else if (sortedArray[midPoint] < targetValue) {
      leftBound = midPoint + 1;
    } else {
      rightBound = midPoint - 1;
    }
  }
  if (foundIndex !== -1) return foundIndex;
  else return leftBound;
}

function splitByNewline(rawInputString) {
  return rawInputString.split("\n");
}

function isSortedAscending(checkArray) {
  let isSorted = true;
  for (let idx = 1; idx < checkArray.length; idx++) {
    if (checkArray[idx - 1] > checkArray[idx]) {
      isSorted = false;
      break;
    }
  }
  return isSorted;
}

function getPrimeFactors(numberToFactor) {
  const sqrtOfN = Math.floor(Math.sqrt(numberToFactor));

  let exponentCount = 0;

  const primeFactorsMap = {};

  for (let divisorCandidate = 2; divisorCandidate <= sqrtOfN; divisorCandidate++) {
    if ((numberToFactor % divisorCandidate) === 0) {
      exponentCount = 0;

      do {
        exponentCount++;
        numberToFactor = numberToFactor / divisorCandidate;
      } while ((numberToFactor % divisorCandidate) === 0);

      primeFactorsMap[divisorCandidate] = exponentCount;
    }
  }

  if (numberToFactor > sqrtOfN) {
    primeFactorsMap[numberToFactor] = 1;
  }

  return primeFactorsMap;
}
