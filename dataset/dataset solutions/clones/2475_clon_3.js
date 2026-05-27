/*
-------関数一覧--------
arr1dto2d(Array) 一次元配列を二次元配列にします
pf(N)素因数分解した結果をオブジェクトで返します
gcd(a,b)最大公約数を返します
lcm(a,b)最小公倍数を返します
num(a,b)a-bを返します。ソート用です
isPrime(n)素数かどうか真偽値で返します
isNumber(n)数かどうか真偽値で返します
arrsum(arr)配列の合計値を返します
nibu(arr,n)n以下で最も大きい数の添字を返します(nを含みます)
br(input)入力を改行で区切ります
*/
const isDebuggingEnabled = false;
const maxSafeIntegerConstant = Number.MAX_SAFE_INTEGER;

function processInputAndFindMinSum(targetNumber) {
  let minimumFactorSum = maxSafeIntegerConstant;
  const limitForDivisorSearch = Math.sqrt(targetNumber);

  for (let currentDivisor = 1; currentDivisor <= limitForDivisorSearch; currentDivisor++) {
    if (targetNumber % currentDivisor === 0) {
      const complementaryDivisor = targetNumber / currentDivisor;
      const currentPairSum = currentDivisor + complementaryDivisor;
      minimumFactorSum = Math.min(minimumFactorSum, currentPairSum);
    }
  }
  console.log(minimumFactorSum - 2);
}
processInputAndFindMinSum(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function getNextValue(matrix, currentPosition) {
  // This function was empty in the original, keeping it as is with renaming.
}

function calculateLexicographicalRank(sequenceArray) {
  let availableNumbers = [];
  // The 'input' variable here is not defined in this scope.
  // Preserving this behavior to maintain exact observable behavior (potential ReferenceError).
  for (let k = 0; k < input[0]; k++) {
    availableNumbers.push(k + 1);
  }
  let totalRankSum = 0;
  for (let j = 0; j < sequenceArray.length; j++) {
    const foundIndexInAvailable = availableNumbers.findIndex(value => value === sequenceArray[j]);
    totalRankSum += calculateFactorial(sequenceArray.length - 1 - j) * foundIndexInAvailable;
    availableNumbers.splice(foundIndexInAvailable, 1);
  }
  return totalRankSum;
}

function logDebugMessage(messageContent) {
  if (isDebuggingEnabled === true) {
    console.log(messageContent);
  }
}

function findMaxElementIndex(dataCollection) {
  let maxValue = Number.MIN_SAFE_INTEGER;
  let maxElementIndex = -1;
  for (let i = 0; i < dataCollection.length; i++) {
    if (maxValue < dataCollection[i]) {
      maxValue = dataCollection[i];
      maxElementIndex = i;
    }
  }
  return maxElementIndex;
}

function findMinElementIndex(dataCollection) {
  let minValue = Number.MAX_SAFE_INTEGER;
  let minElementIndex = -1;
  for (let i = 0; i < dataCollection.length; i++) {
    if (minValue > dataCollection[i]) {
      minValue = dataCollection[i];
      minElementIndex = i;
    }
  }
  return minElementIndex;
}

function splitStringIntoChars2d(inputArray) {
  for (let i = 0; i < inputArray.length; i++) {
    inputArray[i] = inputArray[i].split("");
  }
  return inputArray;
}

function checkIfNumberIsPrime(candidateNumber) {
  if (false === Number.isInteger(candidateNumber)) {
    return false;
  }
  if (candidateNumber <= 1) {
    return false;
  }
  if (2 === candidateNumber) {
    return true;
  }
  if (0 === candidateNumber % 2) {
    return false;
  }
  const squareRootOfCandidate = Math.floor(Math.sqrt(candidateNumber));
  for (let i = 3; i <= squareRootOfCandidate; i += 2) {
    if (0 === candidateNumber % i) {
      return false;
    }
  }
  return true;
}

function validateIfStringIsNumber(stringValue) {
  const numericPattern = /^([1-9]\d*|0)$/;
  return numericPattern.test(stringValue);
}

function calculateFactorial(numberVal) {
  if (numberVal === 0) {
    return 1;
  }
  return numberVal * calculateFactorial(numberVal - 1);
}

function splitStringSpaceAndMapToNum2d(inputArray) {
  for (let i = 0; i < inputArray.length; i++) {
    inputArray[i] = inputArray[i].split(" ").map(Number);
  }
  return inputArray;
}

function rotateMatrix90DegClockwise(originalMatrix) {
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

function insertPartialArray(baseArr, elementsToInsert, startIndex) {
  for (let i = startIndex, p = 0; p < elementsToInsert.length; i++, p++) {
    baseArr[i] = elementsToInsert[p];
  }
  return baseArr;
}

function reversePartialArray(targetArray, startIdx, endIdx) {
  let segmentToReverse = targetArray.slice(startIdx - 1, endIdx);
  segmentToReverse.reverse();
  targetArray = insertPartialArray(targetArray, segmentToReverse, startIdx - 1);
  return targetArray;
}

function padNumberWithZeros(valueToPad, desiredLength) {
  return (valueToPad + '000000000000000000000000000000000').slice(0, desiredLength);
}

function calculateArrayTotal(inputArray) {
  if (!Array.isArray(inputArray) || inputArray.length === 0) {
    return 0; // Guard clause for empty or non-array input
  }
  const totalAccumulator = inputArray.reduce((currentSum, currentVal) => currentSum + (Number(currentVal) || 0), 0);
  return totalAccumulator;
}

function getPrimeFactorMap(numberToFactor) {
  const factorMap = {};
  if (numberToFactor === 1) {
    return { "1": 1 };
  }

  let currentDivisor = 2;
  let tempNumber = numberToFactor;

  while (tempNumber > 1) {
    let searchFrom = currentDivisor;
    let foundFactorInIteration = false;

    for (let i = searchFrom; i <= tempNumber; i++) {
      if (tempNumber % i === 0) {
        tempNumber /= i;
        factorMap[i] = (factorMap[i] || 0) + 1;
        currentDivisor = i;
        foundFactorInIteration = true;
        break;
      }
    }
    // This block is mostly for safety or if the loop upper bound was sqrt(tempNumber).
    // For the current loop (i <= tempNumber), it should always find a factor if tempNumber > 1.
    if (!foundFactorInIteration && tempNumber > 1) {
        factorMap[tempNumber] = (factorMap[tempNumber] || 0) + 1;
        tempNumber = 1;
    }
  }
  return factorMap;
}

function findGreatestCommonDivisor(numA, numB) {
  if (numB === 0) {
    return numA;
  }
  return findGreatestCommonDivisor(numB, numA % numB);
}

function findLeastCommonMultiple(numA, numB) {
  const gcdHelper = (n, m) => m ? gcdHelper(m, n % m) : n;
  return (numA * numB) / gcdHelper(numA, numB);
}

function subtractNumbers(numA, numB) {
  return numA - numB;
}

function performBinarySearch(sortedArray, targetValue) {
  let foundElementIndex = -1;
  let lowerBound = 0;
  let upperBound = sortedArray.length - 1;

  while (lowerBound <= upperBound) {
    const midIndex = Math.floor((lowerBound + upperBound) / 2);
    const midValue = sortedArray[midIndex];

    if (midValue === targetValue) {
      foundElementIndex = midIndex;
      break;
    } else if (midValue < targetValue) {
      lowerBound = midIndex + 1;
    } else { // midValue > targetValue
      upperBound = midIndex - 1;
    }
  }
  return foundElementIndex !== -1 ? foundElementIndex : lowerBound;
}

function splitInputByNewline(rawInputString) {
  return rawInputString.split("\n");
}

function checkIfArrayIsSorted(checkArray) {
  let isSortedFlag = true;
  for (let i = 1; i < checkArray.length; i++) {
    if (checkArray[i - 1] > checkArray[i]) {
      isSortedFlag = false;
      break;
    }
  }
  return isSortedFlag;
}

function getFactorsWithExponents(inputVal) {
  let currentNum = inputVal;
  const sqrtOfCurrentNum = Math.floor(Math.sqrt(currentNum));
  let exponentCounter = 0;
  const factorResultMap = {};

  for (let divisorCandidate = 2; divisorCandidate <= sqrtOfCurrentNum; divisorCandidate++) {
    if (currentNum % divisorCandidate === 0) {
      exponentCounter = 0;
      do {
        exponentCounter++;
        currentNum /= divisorCandidate;
      } while (currentNum % divisorCandidate === 0);
      factorResultMap[divisorCandidate] = exponentCounter;
    }
  }

  if (currentNum > 1) {
    factorResultMap[currentNum] = (factorResultMap[currentNum] || 0) + 1;
  }
  return factorResultMap;
}
