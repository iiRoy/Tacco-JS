const isDebuggingEnabled = false;
const maxSafeIntegerLimit = Number.MAX_SAFE_INTEGER;
const moduloConstant = 1000000007;

function logDebugMessage(debugMessage) {
  if (isDebuggingEnabled === true) {
    console.log(debugMessage);
  }
}

function calculateGreatestCommonDivisor(valA, valB) {
  if (valB === 0) {
    return valA;
  }
  return calculateGreatestCommonDivisor(valB, valA % valB);
}

function calculateLeastCommonMultiple(numA, numB) {
  const localGcdHelper = (n, m) => m ? localGcdHelper(m, n % m) : n;
  return (numA * numB) / localGcdHelper(numA, numB);
}

function processInputAndSolve(initialInputVal) {
  const commonDivisor = calculateGreatestCommonDivisor(initialInputVal, 360);
  const resultFactor = 360 / commonDivisor;
  console.log(resultFactor);
}

function computePower(baseVal, exponentVal) {
  let computedResult = 0n;
  for (let i = 0n; i < exponentVal; i += 1n) {
    if (computedResult === 0n) {
      computedResult = baseVal;
    } else {
      computedResult *= baseVal;
    }
  }
  return computedResult;
}

function calculatePermutationIndex(permutationArr) {
  const globalInputDataPlaceholder = [permutationArr.length];
  let availableNumbers = [];
  for (let i = 0; i < globalInputDataPlaceholder[0]; i++) {
    availableNumbers.push(i + 1);
  }

  let totalPermutationIndex = 0;
  for (let i = 0; i < permutationArr.length; i++) {
    const foundIndex = availableNumbers.findIndex(val => val === permutationArr[i]);
    totalPermutationIndex += calculateFactorial(permutationArr.length - 1 - i) * foundIndex;
    availableNumbers.splice(foundIndex, 1);
  }
  return totalPermutationIndex;
}

function sumArrayElements(numericArray) {
  let totalSum = 0;
  for (let idx = 0, arrayLength = numericArray.length; idx < arrayLength; ++idx) {
    totalSum += Number(numericArray[idx]);
  }
  return totalSum;
}

function findMaxElementIndex(dataArray) {
  let currentMaxVal = Number.MIN_SAFE_INTEGER;
  let maxIndex = -1;
  for (let idx = 0; idx < dataArray.length; idx++) {
    if (currentMaxVal < dataArray[idx]) {
      currentMaxVal = dataArray[idx];
      maxIndex = idx;
    }
  }
  return maxIndex;
}

function findMinElementIndex(dataArray) {
  let currentMinVal = Number.MAX_SAFE_INTEGER;
  let minIndex = -1;
  for (let idx = 0; idx < dataArray.length; idx++) {
    if (currentMinVal > dataArray[idx]) {
      currentMinVal = dataArray[idx];
      minIndex = idx;
    }
  }
  return minIndex;
}

function checkIfPrime(candidateNumber) {
  if (!Number.isInteger(candidateNumber)) {
    return false;
  }
  if (candidateNumber <= 1) {
    return false;
  }
  if (candidateNumber === 2) {
    return true;
  }
  if (candidateNumber % 2 === 0) {
    return false;
  }
  const sqrtVal = Math.floor(Math.sqrt(candidateNumber));
  for (let divisor = 3; divisor <= sqrtVal; divisor += 2) {
    if (candidateNumber % divisor === 0) {
      return false;
    }
  }
  return true;
}

function isValidNumberString(testValue) {
  const numericPattern = /^([1-9]\d*|0)$/;
  return numericPattern.test(testValue);
}

function calculateFactorial(inputNumber) {
  return (inputNumber === 0) ? 1 : (inputNumber * calculateFactorial(inputNumber - 1));
}

function convert1dTo2dArray(inputArray) {
  for (let rowIndex = 0; rowIndex < inputArray.length; rowIndex++) {
    const rowString = inputArray[rowIndex];
    inputArray[rowIndex] = rowString.split(" ").map(Number);
  }
  return inputArray;
}

function rotateMatrixClockwise(originalMatrix) {
  const numRows = originalMatrix.length;
  const numCols = originalMatrix[0].length;
  const lastRowIndex = numRows - 1;

  let rotatedMatrix = new Array(numCols);
  for (let colIdx = 0; colIdx < numCols; colIdx++) {
    rotatedMatrix[colIdx] = new Array(numRows);
    for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
      rotatedMatrix[colIdx][rowIdx] = originalMatrix[lastRowIndex - rowIdx][colIdx];
    }
  }
  return rotatedMatrix;
}

function insertSegmentIntoArray(targetArray, sourceSegment, startIndex) {
  for (let targetIdx = startIndex, sourceIdx = 0; sourceIdx < sourceSegment.length; targetIdx++, sourceIdx++) {
    targetArray[targetIdx] = sourceSegment[sourceIdx];
  }
  return targetArray;
}

function reverseArraySegment(mutableArray, startPos, endPos) {
  const segmentToReverse = mutableArray.slice(startPos - 1, endPos);
  segmentToReverse.reverse();
  mutableArray.splice(startPos - 1, segmentToReverse.length, ...segmentToReverse);
  return mutableArray;
}

function padNumberWithZeros(valueToPad, desiredLength) {
  const paddedString = `${valueToPad}000000000000000000000000000000000`;
  return paddedString.slice(0, desiredLength);
}

function getPrimeFactorsMap(numberToFactor) {
  let primeFactorsMap = {};

  if (numberToFactor <= 1) {
    return {
      "1": 1
    };
  }

  let currentDivisorCandidate = 2;

  while (numberToFactor !== 1) {
    let divisor = currentDivisorCandidate;
    let foundFactor = false;
    while (divisor * divisor <= numberToFactor || numberToFactor === divisor) { // Optimized loop condition
      if (numberToFactor % divisor === 0) {
        numberToFactor /= divisor;
        primeFactorsMap[divisor] = (primeFactorsMap[divisor] || 0) + 1;
        foundFactor = true;
        break;
      }
      divisor++;
    }
    if (!foundFactor && numberToFactor > 1) {
      primeFactorsMap[numberToFactor] = (primeFactorsMap[numberToFactor] || 0) + 1;
      numberToFactor = 1;
    }
    currentDivisorCandidate = divisor;
  }
  return primeFactorsMap;
}

function compareNumbersForSort(firstVal, secondVal) {
  return firstVal - secondVal;
}

function binarySearchInsertionPoint(sortedArray, targetValue) {
  let foundIndex = -1;

  if (!Array.isArray(sortedArray) || sortedArray.length === 0) {
    return 0;
  }

  let leftBound = 0;
  let rightBound = sortedArray.length - 1;

  while (leftBound <= rightBound) {
    const midPoint = Math.floor((leftBound + rightBound) / 2);

    if (sortedArray[midPoint] === targetValue) {
      foundIndex = midPoint;
      break;
    } else if (sortedArray[midPoint] < targetValue) {
      leftBound = midPoint + 1;
    } else {
      rightBound = midPoint - 1;
    }
  }
  return (foundIndex !== -1) ? foundIndex : leftBound;
}

function splitByNewline(rawInputString) {
  return rawInputString.split("\n");
}

function checkIfSorted(inputSequence) {
  let isSortedFlag = true;
  for (let idx = 1; idx < inputSequence.length; idx++) {
    if (inputSequence[idx - 1] > inputSequence[idx]) {
      isSortedFlag = false;
      break;
    }
  }
  return isSortedFlag;
}

function getPrimeFactorsDetailed(targetNum) {
  let factorMap = {};

  if (targetNum <= 1) {
    return {
      "1": 1
    };
  }

  // Handle factor 2
  if (targetNum % 2 === 0) {
    let exponentCount = 0;
    while (targetNum % 2 === 0) {
      exponentCount++;
      targetNum /= 2;
    }
    factorMap[2] = exponentCount;
  }

  // Check odd factors from 3 up to the square root
  const sqrtOfTarget = Math.floor(Math.sqrt(targetNum));
  for (let currentFactor = 3; currentFactor <= sqrtOfTarget; currentFactor += 2) {
    if (targetNum % currentFactor === 0) {
      let exponentCount = 0;
      do {
        exponentCount++;
        targetNum /= currentFactor;
      } while ((targetNum % currentFactor) === 0);
      factorMap[currentFactor] = exponentCount;
    }
  }

  // If targetNum is still greater than 1, it must be a prime factor itself
  if (targetNum > 1) {
    factorMap[targetNum] = (factorMap[targetNum] || 0) + 1;
  }

  return factorMap;
}

processInputAndSolve(Number(require("fs").readFileSync("/dev/stdin", "utf8").trim()));
