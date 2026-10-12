"use strict";
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenStream = rawInputData.split(/\s+/).filter(Boolean);
let tokenIndex = 0;

const retrieveNextNumber = () => Number(tokenStream[tokenIndex++]);

const processGridCuts = () => {
  const gridWidth = retrieveNextNumber();
  const gridHeight = retrieveNextNumber();

  const horizontalCutCosts = Array.from({ length: gridWidth }, retrieveNextNumber);
  const verticalCutCosts = Array.from({ length: gridHeight }, retrieveNextNumber);

  horizontalCutCosts.sort((valA, valB) => valA - valB);
  verticalCutCosts.sort((valA, valB) => valA - valB);

  let totalMinimumCost = 0n;
  let horizontalPointer = 0;
  let verticalPointer = 0;
  let madeHorizontalCuts = 0;
  let madeVerticalCuts = 0;

  while (horizontalPointer < gridWidth || verticalPointer < gridHeight) {
    const horizontalCostAvailable = horizontalPointer < gridWidth;
    const verticalCostAvailable = verticalPointer < gridHeight;

    let shouldTakeHorizontalCut;

    if (horizontalCostAvailable && verticalCostAvailable) {
      shouldTakeHorizontalCut = horizontalCutCosts[horizontalPointer] <= verticalCutCosts[verticalPointer];
    } else if (horizontalCostAvailable) {
      shouldTakeHorizontalCut = true;
    } else {
      shouldTakeHorizontalCut = false;
    }

    if (shouldTakeHorizontalCut) {
      const currentCost = BigInt(horizontalCutCosts[horizontalPointer]);
      totalMinimumCost += currentCost * BigInt(gridHeight - madeVerticalCuts + 1);
      madeHorizontalCuts++;
      horizontalPointer++;
    } else {
      const currentCost = BigInt(verticalCutCosts[verticalPointer]);
      totalMinimumCost += currentCost * BigInt(gridWidth - madeHorizontalCuts + 1);
      madeVerticalCuts++;
      verticalPointer++;
    }
  }

  return totalMinimumCost;
};

const finalResult = processGridCuts();
if (finalResult !== undefined) console.log(String(finalResult));
