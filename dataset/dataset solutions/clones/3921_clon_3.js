function calculateResultForPair(smallerVal, largerVal, sqrtResult) {
  let currentAnswer = (smallerVal - 1) * 2;

  if (smallerVal < largerVal - 1) {
    currentAnswer++;
  }

  const difference = sqrtResult - smallerVal;
  currentAnswer += Math.max(difference, 0) * 2;

  const comparisonTerm = Math.floor(smallerVal / sqrtResult * largerVal);
  if (comparisonTerm === sqrtResult) {
    currentAnswer--;
  }
  return currentAnswer;
}

function calculateSqrt64(numStr) {
  const stringLength = numStr.length;
  let currentRemainder, currentRootValue;
  const isLengthOdd = (stringLength % 2 !== 0);

  let initialSegmentValue;
  if (isLengthOdd) {
    initialSegmentValue = +numStr[0];
  } else {
    initialSegmentValue = +(numStr[0] + numStr[1]);
  }

  currentRootValue = Math.floor(Math.sqrt(initialSegmentValue));
  currentRemainder = initialSegmentValue - currentRootValue * currentRootValue;

  let currentDivisorPart = currentRootValue;

  for (let charIndex = 2 - (isLengthOdd ? 1 : 0); charIndex < stringLength; charIndex += 2) {
    const lastDigitOfDivisor = currentDivisorPart % 10;
    currentDivisorPart = (currentDivisorPart + lastDigitOfDivisor) * 10;

    currentRemainder = +(String(currentRemainder) + numStr[charIndex] + numStr[charIndex + 1]);

    let trialDigit;
    for (trialDigit = 1; trialDigit <= 9; trialDigit++) {
      if (currentRemainder - (currentDivisorPart + trialDigit) * trialDigit < 0) {
        break;
      }
    }
    trialDigit--;
    currentRootValue = currentRootValue * 10 + trialDigit;
    currentRemainder -= (currentDivisorPart + trialDigit) * trialDigit;
    currentDivisorPart += trialDigit;
  }

  if (currentRemainder > 0) {
    currentRootValue++;
  }
  return currentRootValue;
}

function multiply32(firstFactor, secondFactor) {
  const BASE_UNIT = 1e5;
  const PADDING_LENGTH = 5;

  const firstFactorLow = firstFactor % BASE_UNIT;
  const firstFactorHigh = Math.floor(firstFactor / BASE_UNIT);

  let productLowPart = firstFactorLow * secondFactor;
  let productHighPart = firstFactorHigh * secondFactor;

  const carryFromLowProduct = Math.floor(productLowPart / BASE_UNIT);
  productLowPart %= BASE_UNIT;

  let finalHighPart = productHighPart + carryFromLowProduct;

  let formattedLowPart = String(productLowPart).padStart(PADDING_LENGTH, '0');

  if (finalHighPart > 0) {
    return String(finalHighPart) + formattedLowPart;
  } else {
    return String(productLowPart);
  }
}

function processInput(inputString) {
  const inputLines = inputString.split("\n");
  const queryCount = +inputLines[0];

  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const currentQueryLine = inputLines[queryIndex + 1];
    const [valueA, valueB] = currentQueryLine.split(" ").map(Number);

    const smallerInputVal = Math.min(valueA, valueB);
    const largerInputVal = Math.max(valueA, valueB);

    const productString = multiply32(smallerInputVal, largerInputVal);
    const intermediateSqrtResult = calculateSqrt64(productString) - 1;

    const finalAnswer = calculateResultForPair(smallerInputVal, largerInputVal, intermediateSqrtResult);
    console.log(finalAnswer);
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
