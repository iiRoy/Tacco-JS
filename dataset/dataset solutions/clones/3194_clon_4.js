function initiateChallenge(rawData) {
  const tokenStream = rawData.split(/\s+/);
  const numericValues = tokenStream.map(Number);

  const totalStickAllowance = numericValues.shift();
  const availableDigitCount = numericValues.shift();

  const digitToMatchstickCostMap = new Map([
    [1, 2], [2, 5], [3, 5], [4, 4], [5, 5], [6, 6], [7, 3], [8, 7], [9, 6]
  ]);

  const bestDigitForCost = new Map();
  for (let idx = 0; idx < availableDigitCount; ++idx) {
    const currentDigitCandidate = numericValues[idx];
    const correspondingCost = digitToMatchstickCostMap.get(currentDigitCandidate);
    if (correspondingCost !== undefined) {
      if (!bestDigitForCost.has(correspondingCost) || currentDigitCandidate > bestDigitForCost.get(correspondingCost)) {
        bestDigitForCost.set(correspondingCost, currentDigitCandidate);
      }
    }
  }

  const solutionMemo = new Map();
  const NO_SOLUTION = null;

  function compareNumberConfigurations(configOne, configTwo) {
    if (configOne === NO_SOLUTION) return configTwo;
    if (configTwo === NO_SOLUTION) return configOne;

    if (configOne.totalDigits !== configTwo.totalDigits) {
      return configOne.totalDigits > configTwo.totalDigits ? configOne : configTwo;
    }

    for (let currentDigit = 9; currentDigit >= 1; --currentDigit) {
      if (configOne.digitCounts[currentDigit] !== configTwo.digitCounts[currentDigit]) {
        return configOne.digitCounts[currentDigit] > configTwo.digitCounts[currentDigit] ? configOne : configTwo;
      }
    }
    return configOne; // Configurations are identical, return one
  }

  function findOptimalNumber(remainingSticks) {
    if (remainingSticks === 0) {
      return { digitCounts: new Array(10).fill(0), totalDigits: 0 };
    }

    if (solutionMemo.has(remainingSticks)) {
      return solutionMemo.get(remainingSticks);
    }

    let currentOptimal = NO_SOLUTION;

    for (const [costValue, digitValue] of bestDigitForCost.entries()) {
      if (remainingSticks >= costValue) {
        const previousResult = findOptimalNumber(remainingSticks - costValue);
        if (previousResult !== NO_SOLUTION) {
          const updatedDigitCounts = [...previousResult.digitCounts];
          updatedDigitCounts[digitValue]++;
          const updatedTotalDigits = previousResult.totalDigits + 1;
          const candidateConfiguration = { digitCounts: updatedDigitCounts, totalDigits: updatedTotalDigits };
          currentOptimal = compareNumberConfigurations(currentOptimal, candidateConfiguration);
        }
      }
    }

    solutionMemo.set(remainingSticks, currentOptimal);
    return currentOptimal;
  }

  const finalNumberConfiguration = findOptimalNumber(totalStickAllowance);

  if (finalNumberConfiguration === NO_SOLUTION || finalNumberConfiguration.totalDigits === 0) {
    console.log("");
  } else {
    let constructedNumberString = '';
    for (let digitPlace = 9; digitPlace >= 1; --digitPlace) {
      constructedNumberString += String(digitPlace).repeat(finalNumberConfiguration.digitCounts[digitPlace]);
    }
    console.log(constructedNumberString);
  }
}

initiateChallenge(require('fs').readFileSync('/dev/stdin', 'utf8'));