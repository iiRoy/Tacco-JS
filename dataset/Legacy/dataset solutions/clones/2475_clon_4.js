const isDebuggingEnabled = false;
const maximumSafeInteger = Number.MAX_SAFE_INTEGER;
let globalInputReference; // This variable corresponds to the 'input' global implicitly used in original 'zisyozyunn'

function processMainLogic(inputString) {
  const numericInput = Number(inputString);
  const upperLimit = Math.floor(Math.sqrt(numericInput));

  const factorSums = Array.from({ length: upperLimit }, (_, idx) => idx + 1)
    .filter(potentialFactor => numericInput % potentialFactor === 0)
    .map(factor => factor + numericInput / factor);

  const minimumFactorSum = factorSums.reduce((currentMin, sum) => Math.min(currentMin, sum), maximumSafeInteger);

  console.log(minimumFactorSum - 2);
}

processMainLogic(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function advanceState(paramM, currentPosition) {
  // Original function was empty, preserving behavior.
}

function calculateLexicographicalRank(sequence) {
  // This function assumes 'globalInputReference' is an array and its first element
  // defines the range for available elements, mirroring the original's 'input[0]'.
  // If globalInputReference is not set or globalInputReference[0] is invalid,
  // this will produce the same error/NaN behavior as the original.
  const elementRange = Array.from({ length: globalInputReference[0] }, (_, i) => i + 1);
  let totalRank = 0;

  sequence.forEach((element, index) => {
    const remainingLength = sequence.length - 1 - index;
    const elementPosition = elementRange.indexOf(element);

    if (elementPosition !== -1) {
      totalRank += computeFactorial(remainingLength) * elementPosition;
      elementRange.splice(elementPosition, 1);
    }
  });
  return totalRank;
}

function calculateArraySum(dataArray) {
  return dataArray.reduce((accumulator, currentValue) => accumulator + (Number(currentValue) || 0), 0);
}

const logDebugMessage = (message) => {
  isDebuggingEnabled && console.log(message);
};

function findMaxElementIndex(dataArray) {
  if (dataArray.length === 0) {
    return -1;
  }
  return dataArray.reduce((maxIdx, currentVal, currentIndex, arr) =>
    currentVal > arr[maxIdx] ? currentIndex : maxIdx, 0);
}

function findMinElementIndex(dataArray) {
  if (dataArray.length === 0) {
    return -1;
  }
  return dataArray.reduce((minIdx, currentVal, currentIndex, arr) =>
    currentVal < arr[minIdx] ? currentIndex : minIdx, 0);
}

function transformArrayToMatrix(inputArray) {
  // This function corresponds to the LAST definition of arr1dto2d in the original code.
  // Original: arr[i]=arr[i].split(" ").map(Number);
  return inputArray.map(rowString => rowString.split(" ").map(Number));
}

function checkPrimality(candidate) {
  if (typeof candidate !== 'number' || !Number.isInteger(candidate) || candidate <= 1) {
    return false;
  }
  if (candidate <= 3) {
    return true;
  }
  if (candidate % 2 === 0 || candidate % 3 === 0) {
    return false;
  }
  const limit = Math.floor(Math.sqrt(candidate));
  return Array.from({ length: Math.floor((limit - 5) / 6) + 1 }, (_, i) => i)
    .every(k => {
      const factor1 = 6 * k + 5;
      const factor2 = 6 * k + 7;
      return (candidate % factor1 !== 0 && candidate % factor2 !== 0);
    });
}

function isNumericString(inputString) {
  const parsed = Number(inputString);
  return !isNaN(parsed) && Number.isInteger(parsed) && parsed >= 0 && String(parsed) === inputString;
}

function computeFactorial(value) {
  if (value < 0) {
    throw new Error("Factorial is not defined for negative numbers.");
  }
  if (value === 0) {
    return 1;
  }
  let product = 1;
  for (let i = 1; i <= value; i++) {
    product *= i;
  }
  return product;
}

function rotateMatrixClockwise(matrix) {
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
    return [];
  }
  const originalRows = matrix.length;
  const originalCols = matrix[0].length;
  return Array.from({ length: originalCols }, (_, colIndex) =>
    Array.from({ length: originalRows }, (_, rowIndex) =>
      matrix[originalRows - 1 - rowIndex][colIndex]
    )
  );
}

function insertPartialArray(targetArray, sourceArray, startIndex) {
  targetArray.splice(startIndex, sourceArray.length, ...sourceArray);
  return targetArray;
}

function reverseSubsegment(dataArray, startIdx, endIdx) {
  const actualStart = startIdx - 1;
  const actualEnd = endIdx;
  const segmentToReverse = dataArray.slice(actualStart, actualEnd);
  segmentToReverse.reverse();
  return insertPartialArray(dataArray, segmentToReverse, actualStart);
}

function padNumberWithZeros(value, desiredLength) {
  return String(value).padStart(desiredLength, '0');
}

function decomposeIntoPrimes(value) {
  // This function corresponds to the LAST definition of prime factorization in the original code.
  const factors = {};
  let currentVal = value;

  const findAndCountFactor = (divisor) => {
    if (currentVal % divisor === 0) {
      let count = 0;
      while (currentVal % divisor === 0) {
        currentVal /= divisor;
        count++;
      }
      factors[divisor] = count;
    }
  };

  findAndCountFactor(2);

  const limit = Math.floor(Math.sqrt(currentVal));
  Array.from({ length: Math.floor((limit - 3) / 2) + 1 }, (_, i) => 3 + i * 2)
    .forEach(findAndCountFactor);

  if (currentVal > 1) {
    factors[currentVal] = 1;
  }
  return factors;
}

function greatestCommonDivisor(valA, valB) {
  let x = valA;
  let y = valB;
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

function leastCommonMultiple(valA, valB) {
  if (valA === 0 || valB === 0) return 0;
  return Math.abs(valA * valB) / greatestCommonDivisor(valA, valB);
}

function numericComparator(valA, valB) {
  return valA - valB;
}

function findLargestElementIndex(sortedArray, targetValue) {
  const searchRecursive = (low, high) => {
    if (low > high) {
      return low;
    }
    const mid = Math.floor((low + high) / 2);
    if (sortedArray[mid] === targetValue) {
      return mid;
    } else if (sortedArray[mid] < targetValue) {
      return searchRecursive(mid + 1, high);
    } else {
      return searchRecursive(low, mid - 1);
    }
  };
  return searchRecursive(0, sortedArray.length - 1);
}

function parseLines(textInput) {
  return textInput.split('\n');
}

function isSequenceOrdered(dataArray) {
  return !dataArray.some((val, idx, arr) => idx < arr.length - 1 && val > arr[idx + 1]);
}
