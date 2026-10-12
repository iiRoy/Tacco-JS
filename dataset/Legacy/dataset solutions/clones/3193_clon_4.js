"use strict";

(function () {
  const determineGreater = (firstCandidate, secondCandidate) => {
    if (firstCandidate === null) return secondCandidate;
    if (secondCandidate === null) return firstCandidate;

    if (firstCandidate.length !== secondCandidate.length) {
      return firstCandidate.length > secondCandidate.length ? firstCandidate : secondCandidate;
    }
    return firstCandidate > secondCandidate ? firstCandidate : secondCandidate;
  };

  const processMatchstickInput = (rawInputContent) => {
    const inputLines = rawInputContent.split("\n");

    const [targetMatchsticks, availableDigitCount] = inputLines[0].split(/\s+/).map(Number);
    const providedDigits = inputLines[1].split(/\s+/).map(Number).slice(0, availableDigitCount);

    const digitMatchstickCosts = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

    const sortedUsableDigits = providedDigits
      .map(dVal => ({ digit: dVal, cost: digitMatchstickCosts[dVal] }))
      .sort((a, b) => b.digit - a.digit);

    const maxNumberStringForCost = new Array(targetMatchsticks + 1).fill(null);
    maxNumberStringForCost[0] = "";

    for (let currentCostIndex = 1; currentCostIndex <= targetMatchsticks; currentCostIndex++) {
      for (const { digit: currentDigit, cost: currentDigitCost } of sortedUsableDigits) {
        if (currentCostIndex < currentDigitCost) {
          continue;
        }

        const remainingCost = currentCostIndex - currentDigitCost;
        const numberForRemainingCost = maxNumberStringForCost[remainingCost];

        if (numberForRemainingCost !== null) {
          const potentialNumber = String(currentDigit) + numberForRemainingCost;
          maxNumberStringForCost[currentCostIndex] = determineGreater(maxNumberStringForCost[currentCostIndex], potentialNumber);
        }
      }
    }

    console.log(maxNumberStringForCost[targetMatchsticks]);
  };

  processMatchstickInput(require("fs").readFileSync("/dev/stdin", "utf8"));
})();
