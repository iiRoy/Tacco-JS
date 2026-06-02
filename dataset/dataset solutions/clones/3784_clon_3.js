'use strict'

function Main(inputData) {
  const inputParts = inputData.split(" ");
  const totalItems = Number(inputParts[0]);
  const redCount = Number(inputParts[1]);
  const blueCount = Number(inputParts[2]);
  const targetSum = Number(inputParts[3]);

  const sumOfRedBlue = redCount + blueCount;
  const maxColorVal = Math.max(redCount, blueCount);
  // The variable 'minColorVal' (formerly 'third') was unused in the original logic,
  // so it has been removed as a redundant element.

  function calculateFactorial(num) {
    if (num < 0) return 0;
    let factResult = 1;
    for (let f = 2; f <= num; f++) {
      factResult *= f;
    }
    return factResult;
  }

  function calculatePermutations(nVal, rVal) {
    let permResult = 1;
    for (let loopIdx = 0; loopIdx < rVal; loopIdx++) {
      permResult *= (nVal - loopIdx);
    }
    return permResult;
  }

  function calculateCombinations(nVal, rVal) {
    if (rVal < 0 || rVal > nVal) return 0;
    if (rVal === 0 || rVal === nVal) return 1;
    if (rVal > nVal / 2) rVal = nVal - rVal; // Optimization for C(n, k) = C(n, n-k)
    return calculatePermutations(nVal, rVal) / calculateFactorial(rVal);
  }

  let totalPatternsFound = 0;

  const maxGreenUnitsPossible = Math.floor(targetSum / sumOfRedBlue);

  for (let currentGreenUnits = maxGreenUnitsPossible; currentGreenUnits >= 0; currentGreenUnits--) {
    const costOfGreenUnits = currentGreenUnits * sumOfRedBlue;
    const remainingSumAfterGreen = targetSum - costOfGreenUnits;

    const maxMaxColorUnitsPossible = Math.floor(remainingSumAfterGreen / maxColorVal);

    for (let currentMaxColorUnits = maxMaxColorUnitsPossible; currentMaxColorUnits >= 0; currentMaxColorUnits--) {
      const costOfMaxColorUnits = currentMaxColorUnits * maxColorVal;
      const remainingSumAfterBoth = remainingSumAfterGreen - costOfMaxColorUnits;

      const totalItemsUsed = currentGreenUnits + currentMaxColorUnits + remainingSumAfterBoth;

      if (totalItemsUsed <= totalItems) {
        const largestComponent = Math.max(currentGreenUnits, currentMaxColorUnits, remainingSumAfterBoth);
        const combinationsPart1 = calculateCombinations(totalItems, totalItemsUsed);
        const combinationsPart2 = calculateCombinations(totalItemsUsed, largestComponent);
        totalPatternsFound += (combinationsPart1 * combinationsPart2);
      }
    }
  }

  console.log(totalPatternsFound);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
