var obtainInteger = (valInput) => parseInt(valInput, 10);

var convertToIntList = (inputList) =>
  inputList.map((itemElement) => obtainInteger(itemElement));

var getAbsolute = (numericalValue) => (numericalValue > 0 ? numericalValue : -numericalValue);

function determineMinimum() {
  var valueArguments = arguments;
  var minValue = valueArguments[0];
  for (var iterationCounter = 1; iterationCounter < valueArguments.length; iterationCounter++) {
    if (valueArguments[iterationCounter] < minValue) {
      minValue = valueArguments[iterationCounter];
    }
  }
  return minValue;
}

function determineMaximum() {
  var valueArguments = arguments;
  var maxValue = valueArguments[0];
  for (var iterationCounter = 1; iterationCounter < valueArguments.length; iterationCounter++) {
    if (valueArguments[iterationCounter] > maxValue) {
      maxValue = valueArguments[iterationCounter];
    }
  }
  return maxValue;
}

function calculateGCD() {
  var numberSequence = arguments;
  var currentGCD = numberSequence[0];
  var gcdRecursive = (firstNumber, secondNumber) => (secondNumber ? gcdRecursive(secondNumber, firstNumber % secondNumber) : firstNumber);
  for (var iterationCounter = 1; iterationCounter < numberSequence.length; iterationCounter++) {
    currentGCD = gcdRecursive(currentGCD, numberSequence[iterationCounter]);
  }
  return currentGCD;
}

performMainProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));

function performMainProcessing(inputContentString) {
  var processedInputLines = inputContentString
    .split('\n')
    .map((lineElement, indexPosition, originalArray) => convertToIntList(lineElement.split(' ')));

  var remainingBudget = processedInputLines[0][0];
  var numberOfAvailableDigits = processedInputLines[0][1];
  var sortedAvailableDigits = processedInputLines[1].sort((valueA, valueB) => valueB - valueA);
  var digitMatchCosts = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];
  var feasibleDigitOptions = [];
  var currentDigitValue, smallestRemainder, tempPlaceholder;

  for (var iterationCounter = 0; iterationCounter < numberOfAvailableDigits; iterationCounter++) {
    currentDigitValue = sortedAvailableDigits[iterationCounter];
    if (feasibleDigitOptions.find((optionEntry) => optionEntry[1] === digitMatchCosts[currentDigitValue]) === undefined) {
      feasibleDigitOptions.push([currentDigitValue, digitMatchCosts[currentDigitValue]]);
    }
  }

  feasibleDigitOptions.sort((optionA, optionB) => optionA[1] - optionB[1]);

  var partialResultComponents = [];

  partialResultComponents[0] = [feasibleDigitOptions[0][0], Math.floor(remainingBudget / feasibleDigitOptions[0][1])];
  remainingBudget %= feasibleDigitOptions[0][1];

  var currentListLength = feasibleDigitOptions.length;
  while (remainingBudget !== 0) {
    remainingBudget += feasibleDigitOptions[0][1];
    partialResultComponents[0][1]--;
    currentDigitValue = 10;
    smallestRemainder = 10;

    for (var innerLoopIndex = 1; innerLoopIndex < currentListLength; innerLoopIndex++) {
      if (remainingBudget % feasibleDigitOptions[innerLoopIndex][1] < smallestRemainder) {
        currentDigitValue = innerLoopIndex;
        smallestRemainder = remainingBudget % feasibleDigitOptions[innerLoopIndex][1];
      }
    }

    if (smallestRemainder < 10) {
      partialResultComponents.push([feasibleDigitOptions[currentDigitValue][0], Math.floor(remainingBudget / feasibleDigitOptions[currentDigitValue][1])]);
      remainingBudget = smallestRemainder;
    }
  }

  partialResultComponents.sort((componentA, componentB) => componentB[0] - componentA[0]);

  var finalConstructedString = '';

  currentListLength = partialResultComponents.length;
  for (var iterationCounter = 0; iterationCounter < currentListLength; iterationCounter++) {
    finalConstructedString += String(partialResultComponents[iterationCounter][0]).repeat(partialResultComponents[iterationCounter][1]);
  }

  console.log(finalConstructedString);
  return 0;
}