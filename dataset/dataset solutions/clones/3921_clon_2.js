function ProcessInput(inputData) {
  let linesArray = inputData.split("\n");
  const queryCount = +linesArray[0];

  for (let idx = 0; idx < queryCount; idx++) {
    let currentPair = linesArray[idx + 1].split(" ").map(val => +val);
    let largerVal = Math.max(currentPair[0], currentPair[1]);
    let smallerVal = Math.min(currentPair[0], currentPair[1]);

    let intermediateResult = CalculateSquareRootBigInt(MultiplyLargeNumbers(smallerVal, largerVal)) - 1;
    let finalAnswer = (smallerVal - 1) * 2;

    if (smallerVal < largerVal - 1) {
      finalAnswer++;
    }

    finalAnswer += Math.max(intermediateResult - smallerVal, 0) * 2;

    if (Math.floor(smallerVal / intermediateResult * largerVal) === intermediateResult) {
      finalAnswer--;
    }
    console.log(finalAnswer);
  }
}

function CalculateSquareRootBigInt(inputString) {
  const stringLength = inputString.length;
  let currentWorkingValue, currentSqrtValue;

  if (stringLength % 2 === 1) {
    currentWorkingValue = +inputString[0];
  } else {
    currentWorkingValue = +(inputString[0] + inputString[1]);
  }

  currentSqrtValue = Math.sqrt(currentWorkingValue) | 0;
  currentWorkingValue -= currentSqrtValue * currentSqrtValue;

  let currentDivisorBase = currentSqrtValue;

  for (let charIndex = 2 - (stringLength & 1); charIndex < stringLength; charIndex += 2) {
    currentDivisorBase = (currentDivisorBase + currentDivisorBase % 10) * 10;
    currentWorkingValue = +(currentWorkingValue + inputString[charIndex] + inputString[charIndex + 1]);

    let trialDigit;
    for (trialDigit = 1; trialDigit <= 9; trialDigit++) {
      if (currentWorkingValue - (currentDivisorBase + trialDigit) * trialDigit < 0) {
        break;
      }
    }
    trialDigit--;

    currentSqrtValue = currentSqrtValue * 10 + trialDigit;
    currentWorkingValue -= (currentDivisorBase + trialDigit) * trialDigit;
    currentDivisorBase += trialDigit;
  }
  if (currentWorkingValue) {
    currentSqrtValue++;
  }
  return currentSqrtValue;
}

function MultiplyLargeNumbers(firstNum, secondNum) {
  let lowPartProduct = (firstNum % 1e5) * secondNum;
  let highPartProduct = Math.floor(firstNum / 1e5) * secondNum + Math.floor(lowPartProduct / 1e5);
  lowPartProduct %= 1e5;

  let resultString;
  if (highPartProduct > 0) {
    resultString = ("00000" + lowPartProduct).slice(-5);
  } else {
    highPartProduct = "";
    resultString = lowPartProduct;
  }
  return highPartProduct + resultString;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
