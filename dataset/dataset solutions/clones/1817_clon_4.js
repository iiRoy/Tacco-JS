const debugMode = false;
const inf = Number.MAX_SAFE_INTEGER;
const mod = 1000000007;

function processInput(inputStringValue) {
  const targetNumber = Number(inputStringValue);

  const primeFactorsWithExponents = determinePrimeFactorExponents(targetNumber);

  const finalSum = Object.values(primeFactorsWithExponents).reduce((accumulator, currentExponent) => {
    return accumulator + calculateTriangularRoot(currentExponent);
  }, 0);

  console.log(finalSum);
}

function determinePrimeFactorExponents(valueToFactor) {
  const factorMap = {};

  if (valueToFactor === 1) {
    return { "1": 1 };
  }

  let currentNum = valueToFactor;
  let currentDivisor = 2;

  while (currentDivisor * currentDivisor <= currentNum) {
    if (currentNum % currentDivisor === 0) {
      let count = 0;
      while (currentNum % currentDivisor === 0) {
        count++;
        currentNum /= currentDivisor;
      }
      factorMap[currentDivisor] = count;
    }
    currentDivisor = (currentDivisor === 2) ? 3 : currentDivisor + 2;
  }

  if (currentNum > 1) {
    factorMap[currentNum] = 1;
  }

  return factorMap;
}

function calculateTriangularRoot(exponentValue) {
  let currentSumOfSequence = 0;
  let sequenceTerm = 1;
  while (currentSumOfSequence < exponentValue) {
    currentSumOfSequence += sequenceTerm;
    console.log(currentSumOfSequence, exponentValue);
    sequenceTerm++;
  }
  return sequenceTerm - 2;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function convert1dTo2dArray(inputArray) {
  for (let i = 0; i < inputArray.length; i++) {
    inputArray[i] = inputArray[i].split("");
  }
  return inputArray;
}

function calculateLexicographicalIndex(sequence) {
  let availableNumbers = [];
  for (let i = 0; i < input[0]; i++) {
    availableNumbers.push(i + 1);
  }
  let currentSum = 0;
  for (let i = 0; i < sequence.length; i++) {
    let foundIndex = availableNumbers.findIndex(val => val == sequence[i]);
    currentSum += computeFactorial(sequence.length - 1 - i) * foundIndex;
    availableNumbers.splice(foundIndex, 1);
  }
  return currentSum;
}

function sumArrayElements(numericArray) {
  let total = 0;
  for (let i = 0, len = numericArray.length; i < len; ++i) {
    total += numericArray[i] - 0;
  }
  return total;
}

function outputDebugMessage(message) {
  if (debugMode === true) {
    console.log(message);
  }
}

function findMaxElementIndex(dataArray) {
  let maximumValue = Number.MIN_SAFE_INTEGER;
  let maxIndex = -1;
  for (let i = 0; i < dataArray.length; i++) {
    if (maximumValue < dataArray[i]) {
      maximumValue = dataArray[i];
      maxIndex = i;
    }
  }
  return maxIndex;
}

function findMinElementIndex(dataArray) {
  let minimumValue = Number.MAX_SAFE_INTEGER;
  let minIndex = -1;
  for (let i = 0; i < dataArray.length; i++) {
    if (minimumValue > dataArray[i]) {
      minimumValue = dataArray[i];
      minIndex = i;
    }
  }
  return minIndex;
}

function isNumberPrime(numberToCheck) {
  if (false === Number.isInteger(numberToCheck)) {
    return false;
  }
  if (numberToCheck <= 1) {
    return false;
  }
  if (2 === numberToCheck) {
    return true;
  }
  if (0 === numberToCheck % 2) {
    return false;
  }
  let squareRoot = Math.floor(Math.sqrt(numberToCheck));
  for (let i = 3; i <= squareRoot; i += 2) {
    if (0 === numberToCheck % i) {
      return false;
    }
  }
  return true;
}

function isValidNumberString(value) {
  const pattern = /^([1-9]\d*|0)$/;
  return pattern.test(value);
}

function computeFactorial(numberValue) {
  if (numberValue === 0) {
    return 1;
  }
  return numberValue * computeFactorial(numberValue - 1);
}

function rotateTwoDArray(matrix) {
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const lastRowIndex = numRows - 1;
  let rotatedMatrix = new Array(numCols);
  for (let c = 0; c < numCols; c++) {
    rotatedMatrix[c] = new Array(numRows);
    for (let r = 0; r < numRows; r++) {
      rotatedMatrix[c][r] = matrix[lastRowIndex - r][c];
    }
  }
  return rotatedMatrix;
}

function insertElementsIntoArray(baseArray, elementsToPush, startIndex) {
  for (let i = startIndex, p = 0; p < elementsToPush.length; i++, p++) {
    baseArray[i] = elementsToPush[p];
  }
  return baseArray;
}

function reverseArraySegment(targetArray, startIdx, endIdx) {
  let segmentToReverse = targetArray.slice(startIdx - 1, endIdx);
  segmentToReverse.reverse();
  targetArray = insertElementsIntoArray(targetArray, segmentToReverse, startIdx - 1);
  return targetArray;
}

function padNumberWithLeadingZeros(numberToPad, desiredLength) {
  return (numberToPad + '000000000000000000000000000000000').slice(0, desiredLength);
}

function calculateArrayTotal(inputArray) {
  let totalSum = 0;
  for (let i = 0, len = inputArray.length; i < len; ++i) {
    totalSum += inputArray[i] - 0;
  }
  return totalSum;
}

function findGreatestCommonDivisor(valA, valB) {
  if (valB === 0) {
    return valA;
  }
  return findGreatestCommonDivisor(valB, valA % valB);
}

function findLeastCommonMultiple(valA, valB) {
  const calculateGCDInternal = (n, m) => m ? calculateGCDInternal(m, n % m) : n;
  return valA * valB / calculateGCDInternal(valA, valB);
}

function subtractValues(valA, valB) {
  return valA - valB;
}

function performBinarySearchForIndex(sortedArray, searchTarget) {
  let resultIndex = -1;
  let leftBound = 0;
  let rightBound = sortedArray.length - 1;

  while (leftBound <= rightBound) {
    let middleIndex = Math.floor((leftBound + rightBound) / 2);
    if (sortedArray[middleIndex] === searchTarget) {
      resultIndex = middleIndex;
      break;
    } else if (sortedArray[middleIndex] < searchTarget) {
      leftBound = middleIndex + 1;
    } else {
      rightBound = middleIndex - 1;
    }
  }
  if (resultIndex !== -1) return resultIndex;
  else return leftBound;
}

function splitInputByNewline(textInput) {
  return textInput.split("\n");
}

function isArraySorted(dataArray) {
  let sortedFlag = true;
  for (let i = 1; i < dataArray.length; i++) {
    if (dataArray[i - 1] > dataArray[i]) {
      sortedFlag = false;
      break;
    }
  }
  return sortedFlag;
}

function getPrimeFactorizationDetails(inputNumber) {
  let squareRootVal = Math.floor(Math.sqrt(inputNumber));
  let factorResults = {};
  let tempNumber = inputNumber;

  for (let i = 2; i <= squareRootVal; i++) {
    if ((tempNumber % i) === 0) {
      let count = 0;
      do {
        count++;
        tempNumber = tempNumber / i;
      } while ((tempNumber % i) === 0);
      factorResults[i] = count;
    }
  }

  if (tempNumber > 1) {
    factorResults[tempNumber] = 1;
  }

  return factorResults;
}
