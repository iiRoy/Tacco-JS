function calculateFactorial(inputNumber) {
  if (inputNumber <= 1) {
    return 1;
  }
  return inputNumber * calculateFactorial(inputNumber - 1);
}

const calculateCombinations = (totalItems, chooseItems) => {
    if (chooseItems < 0 || chooseItems > totalItems) {
        return 0;
    }
    if (chooseItems === 0 || chooseItems === totalItems) {
        return 1;
    }
    return calculateFactorial(totalItems) / (calculateFactorial(chooseItems) * calculateFactorial(totalItems - chooseItems));
};

const determineCombinations = ((numberString, targetCount, totalDigits, currentIndex, foundCount, isPrefixExact) => {
  if (currentIndex >= totalDigits) {
    return 1;
  }

  let firstCaseTotal = 0;
  let secondCaseTotal = 0;
  let currentTotal = 0;

  const remainingNeededOnes = targetCount - foundCount;

  if (isPrefixExact) {
    const currentDigitChar = numberString[currentIndex];
    const currentDigitValue = Number(currentDigitChar);

    if (currentDigitValue !== 0) {
      const originalNMinusI = Number(numberString) - currentIndex;

      if (originalNMinusI !== remainingNeededOnes) {
        if (remainingNeededOnes > 0) {
          const positionsForZeroPrefix = totalDigits - currentIndex - 1;
          const combinationsFactorForZeroPrefix = calculateCombinations(positionsForZeroPrefix, remainingNeededOnes);
          firstCaseTotal = remainingNeededOnes * 9 * combinationsFactorForZeroPrefix;
        } else {
          firstCaseTotal = 1;
        }
      }

      if (remainingNeededOnes > 0) {
        if (currentDigitValue > 1) {
          secondCaseTotal += (currentDigitValue - 1) * determineCombinations(numberString, targetCount, totalDigits, currentIndex + 1, foundCount + 1, false);
        }
        secondCaseTotal += determineCombinations(numberString, targetCount, totalDigits, currentIndex + 1, foundCount + 1, true);
      }

      currentTotal = firstCaseTotal + secondCaseTotal;
    } else {
      currentTotal = determineCombinations(numberString, targetCount, totalDigits, currentIndex + 1, foundCount, true);
    }
  } else {
    const remainingPositions = totalDigits - currentIndex;
    const combinationsFactorForFreeChoice = calculateCombinations(remainingPositions, remainingNeededOnes);
    currentTotal = remainingNeededOnes * 9 * combinationsFactorForFreeChoice;
  }

  return currentTotal;
});

function processInput(rawData) {
  const parsedLines = rawData.split("\n");
  const mainNumberString = parsedLines[0];
  const mainTargetCount = Number(parsedLines[1]);
  const mainTotalDigits = mainNumberString.length;
  
  const finalResult = determineCombinations(mainNumberString, mainTargetCount, mainTotalDigits, 0, 0, true);

  console.log(finalResult);
}
processInput(require('fs').readFileSync('/dev/stdin','utf8'));
