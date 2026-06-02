const debugMode = false;
const inf = Number.MAX_SAFE_INTEGER;

function Main(input) {
  const targetThreshold = BigInt(input);
  const initialValue = 100n;

  function* valueProgression(startVal) {
    let currentVal = startVal;
    let count = 0;
    while (true) {
      yield { val: currentVal, iter: count };
      currentVal += currentVal / 100n;
      count++;
    }
  }

  let finalIterationCount = 0;
  for (const { val: currentValue, iter: currentIteration } of valueProgression(initialValue)) {
    if (currentValue >= targetThreshold) {
      finalIterationCount = currentIteration;
      break;
    }
  }
  console.log(finalIterationCount);
}

function calculateLexicographicalIndex(sequence) {
  const sequenceLength = sequence.length;
  const availableNumbers = Array.from({ length: sequenceLength }, (_, idx) => idx + 1);

  return sequence.reduce((accumulatedIndex, currentElement, currentIndex) => {
    const remainingElementsCount = sequenceLength - 1 - currentIndex;
    const elementPositionInAvailable = availableNumbers.findIndex(val => val === currentElement);

    if (elementPositionInAvailable === -1) {
      return accumulatedIndex;
    }

    const permutationsOfRemaining = computeFactorial(remainingElementsCount);
    const contribution = permutationsOfRemaining * elementPositionInAvailable;

    availableNumbers.splice(elementPositionInAvailable, 1);

    return accumulatedIndex + contribution;
  }, 0);
}

const sumNumericArrayElements = (dataCollection) =>
  dataCollection.reduce((total, item) => total + (Number(item) || 0), 0);

const logIfDebugEnabled = (valueToLog) => debugMode ? console.log(valueToLog) : undefined;

const findIndexOfMaxValue = (dataCollection) =>
  dataCollection.reduce((maxIdx, currentVal, idx, arr) =>
    currentVal > arr[maxIdx] ? idx : maxIdx, 0);

const findIndexOfMinValue = (dataCollection) =>
  dataCollection.reduce((minIdx, currentVal, idx, arr) =>
    currentVal < arr[minIdx] ? idx : minIdx, 0);

const transformArrayTo2D = (inputMatrix) =>
  inputMatrix.map(rowString => rowString.split(" ").map(Number));

function computeFactorial(numberValue) {
  if (numberValue === 0) {
    return 1;
  }
  let product = 1;
  for (let k = 1; k <= numberValue; k++) {
    product *= k;
  }
  return product;
}

const rotateMatrixClockwise = (originalMatrix) => {
  const numRows = originalMatrix.length;
  const numCols = originalMatrix[0].length;

  return Array.from({ length: numCols }, (_, colIdx) =>
    Array.from({ length: numRows }, (_, rowIdx) =>
      originalMatrix[numRows - 1 - rowIdx][colIdx]
    )
  );
};

const insertPartialArray = (baseArray, elementsToInsert, startIndex) => {
  const newArray = [...baseArray];
  elementsToInsert.forEach((element, index) => {
    newArray[startIndex + index] = element;
  });
  return newArray;
};

const reverseSubsegment = (targetArray, startPosition, endPosition) => {
  const segmentToReverse = targetArray.slice(startPosition - 1, endPosition);
  const reversedSegment = segmentToReverse.reverse();
  return insertPartialArray(targetArray, reversedSegment, startPosition - 1);
};

const padNumberWithZeros = (numericValue, desiredLength) =>
  String(numericValue).padStart(desiredLength, '0');

function getPrimeFactors(numberToFactor) {
  const factorMap = {};

  if (numberToFactor === 1) {
    return { "1": 1 };
  }

  let currentNum = numberToFactor;
  let divisor = 2;

  while (currentNum > 1) {
    if (currentNum % divisor === 0) {
      factorMap[divisor] = (factorMap[divisor] || 0) + 1;
      currentNum /= divisor;
    } else {
      divisor++;
    }
  }
  return factorMap;
}

function findGreatestCommonDivisor(valA, valB) {
  let a = valA;
  let b = valB;
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

const findLeastCommonMultiple = (valA, valB) =>
  (valA * valB) / findGreatestCommonDivisor(valA, valB);

const compareNumbersForSort = (firstNum, secondNum) => firstNum - secondNum;

function performBinarySearch(sortedArray, searchTarget, low = 0, high = sortedArray.length - 1) {
  if (low > high) {
    return low;
  }

  const mid = Math.floor((low + high) / 2);
  const midValue = sortedArray[mid];

  if (midValue === searchTarget) {
    return mid;
  } else if (midValue < searchTarget) {
    return performBinarySearch(sortedArray, searchTarget, mid + 1, high);
  } else {
    return performBinarySearch(sortedArray, searchTarget, low, mid - 1);
  }
}

const splitInputByNewline = (rawInputString) => rawInputString.split("\n");

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
