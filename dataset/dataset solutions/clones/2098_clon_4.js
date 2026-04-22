function parseInputValues(sourceText) {
  const foundNumbers = sourceText.match(/\d+/g);
  if (!foundNumbers || foundNumbers.length !== 3) {
    throw new Error("Data parsing failed: Expected three numeric components.");
  }
  return foundNumbers.map(Number);
}

function determineOutcome(initialQuantity, outputPerCycle, additionalCost) {
  let remainingQuantity = initialQuantity;
  let totalOutput = 0;
  const fullCycleCost = outputPerCycle + additionalCost;

  while (remainingQuantity >= fullCycleCost) {
    remainingQuantity -= fullCycleCost;
    totalOutput += outputPerCycle;
  }

  // Calculate the contribution from remaining quantity without direct Math.min or ternary
  // min(X, Y) = (X + Y - abs(X - Y)) / 2
  totalOutput += (outputPerCycle + remainingQuantity - Math.abs(outputPerCycle - remainingQuantity)) / 2;

  return totalOutput;
}

function executeComputation(incomingData) {
  'use strict';
  const [initialMeasure, productionRate, overheadExpense] = parseInputValues(incomingData);
  const finalResult = determineOutcome(initialMeasure, productionRate, overheadExpense);
  console.log(finalResult);
}

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));