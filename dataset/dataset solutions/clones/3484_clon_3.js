function parseIntegerVal(inputStringValue) {
  if (inputStringValue === null || inputStringValue === undefined || typeof inputStringValue !== 'string') {
    return NaN;
  }
  const parsedValue = Number.parseInt(inputStringValue.trim(), 10);
  if (Number.isNaN(parsedValue)) {
    return NaN;
  }
  return parsedValue;
}

function extractFloatValue(numericText) {
  if (numericText === null || numericText === undefined || typeof numericText !== 'string') {
    return NaN;
  }
  const extractedValue = Number.parseFloat(numericText.trim());
  if (Number.isNaN(extractedValue)) {
    return NaN;
  }
  return extractedValue;
}

function getAbsoluteValue(val) {
  return Math.abs(val);
}

function computeGreatestCommonDivisor(firstNum, secondNum) {
  let a = getAbsoluteValue(firstNum);
  let b = getAbsoluteValue(secondNum);

  if (Number.isNaN(a) || Number.isNaN(b)) {
      return NaN;
  }

  while (b !== 0) {
    let remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

function calculateLeastCommonMultiple(numberA, numberB) {
  if (typeof numberA !== 'number' || typeof numberB !== 'number' || Number.isNaN(numberA) || Number.isNaN(numberB)) {
    return NaN;
  }

  if (numberA === 0 || numberB === 0) {
    return 0;
  }

  const product = numberA * numberB;
  const commonDivisor = computeGreatestCommonDivisor(numberA, numberB);

  if (commonDivisor === 0) {
      return 0;
  }

  return getAbsoluteValue(product / commonDivisor);
}

function ProcessInputData(rawInputText) {
  if (typeof rawInputText !== 'string' || rawInputText.length === 0) {
    return -1;
  }

  const lineSegments = rawInputText.split("\n");

  if (lineSegments.length < 3) {
      return -1;
  }

  const initialParamsString = lineSegments[0].split(' ');
  const initialParams = initialParamsString.map(val => parseIntegerVal(val));

  if (initialParams.length < 2 || initialParams.some(Number.isNaN)) {
      return -1;
  }

  const firstDimension = initialParams[0];
  const secondDimension = initialParams[1];

  if (firstDimension <= 0 || secondDimension <= 0 || !Number.isInteger(firstDimension) || !Number.isInteger(secondDimension)) {
      return -1;
  }

  const stringA = lineSegments[1];
  const stringB = lineSegments[2];

  if (stringA.length === 0 || stringB.length === 0) {
      return -1;
  }

  const commonMultipleStride = calculateLeastCommonMultiple(firstDimension, secondDimension);

  if (Number.isNaN(commonMultipleStride) || commonMultipleStride === 0) {
      return -1;
  }

  const initialCharA = stringA[0];
  const initialCharB = stringB[0];

  let initialCharMismatch = false;
  if (initialCharA !== initialCharB) {
    initialCharMismatch = true;
  }

  if (initialCharMismatch) {
    return -1;
  }

  const maxIterationLimit = firstDimension * secondDimension;

  let finalMatchingValue = -1;

  for (let currentIterationValue = commonMultipleStride; currentIterationValue <= maxIterationLimit; currentIterationValue += commonMultipleStride) {
    const charMappingStore = new Map();
    let conflictDetected = false;

    for (let indexCounterA = 1; indexCounterA < firstDimension; indexCounterA++) {
      const calculatedPositionA = (indexCounterA * currentIterationValue) / firstDimension;
      if (!Number.isInteger(calculatedPositionA)) {
          continue;
      }
      if (indexCounterA >= stringA.length) {
          continue;
      }
      charMappingStore.set(calculatedPositionA, stringA[indexCounterA]);
    }

    for (let indexCounterB = 1; indexCounterB < secondDimension; indexCounterB++) {
      const calculatedPositionB = (indexCounterB * currentIterationValue) / secondDimension;
      if (!Number.isInteger(calculatedPositionB)) {
          conflictDetected = true;
          break;
      }
      if (indexCounterB >= stringB.length) {
          conflictDetected = true;
          break;
      }

      const tempCharFromB = stringB[indexCounterB];

      if (charMappingStore.has(calculatedPositionB)) {
        if (tempCharFromB !== charMappingStore.get(calculatedPositionB)) {
          conflictDetected = true;
          break;
        }
      } else {
        charMappingStore.set(calculatedPositionB, tempCharFromB);
      }
    }

    if (!conflictDetected) {
      finalMatchingValue = currentIterationValue;
      break;
    }
  }

  return finalMatchingValue;
}

const standardInputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const resultValue = ProcessInputData(standardInputSource);

console.log(resultValue);