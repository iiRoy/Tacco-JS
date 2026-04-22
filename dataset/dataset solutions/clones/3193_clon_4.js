"use strict";

(function () {
  const parseNumericLine = (textLine) => {
    return textLine.trim().split(/\s+/).map(Number);
  };

  const isSuperior = (candidateString, currentBestString) => {
    if (currentBestString === null) {
      return true;
    }
    if (candidateString.length > currentBestString.length) {
      return true;
    }
    if (candidateString.length < currentBestString.length) {
      return false;
    }
    return candidateString > currentBestString;
  };

  const processInputData = (rawText) => {
    const inputLines = rawText.split("\n");

    const [targetEnergy, availableCount] = parseNumericLine(inputLines[0]);
    const suppliedNumerals = parseNumericLine(inputLines[1]).slice(0, availableCount);

    const numeralCosts = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

    const possibleConstituents = suppliedNumerals
      .map((value) => ({
        numeralValue: value,
        numeralEnergy: numeralCosts[value],
      }))
      .sort((a, b) => b.numeralValue - a.numeralValue);

    const bestConstruction = Array(targetEnergy + 1).fill(null);
    bestConstruction[0] = "";

    for (let currentEnergyLevel = 1; currentEnergyLevel <= targetEnergy; ++currentEnergyLevel) {
      for (const constituent of possibleConstituents) {
        const { numeralValue, numeralEnergy } = constituent;

        if (currentEnergyLevel - numeralEnergy >= 0) {
          const priorConstruction = bestConstruction[currentEnergyLevel - numeralEnergy];

          if (priorConstruction !== null) {
            const potentialString = numeralValue.toString() + priorConstruction;

            if (isSuperior(potentialString, bestConstruction[currentEnergyLevel])) {
              bestConstruction[currentEnergyLevel] = potentialString;
            }
          }
        }
      }
    }

    const finalResult = bestConstruction[targetEnergy] === null ? "" : bestConstruction[targetEnergy];

    console.log(finalResult);
  };

  processInputData(require("fs").readFileSync(0, "utf8"));
})();