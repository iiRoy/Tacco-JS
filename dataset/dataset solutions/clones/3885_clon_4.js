"use strict";

const calculateOptimalCost = (inputString) => {
  const [unitCostA, unitCostB, setCostAB, quantityA, quantityB] = inputString
    .split("\n")[0]
    .split(" ")
    .map(Number);

  // Determine the most cost-effective way to acquire a pair (one A and one B).
  // Option 1: Buy A and B individually.
  // Option 2: Buy one AB set.
  const costPerUnitPair = Math.min(unitCostA + unitCostB, 2 * setCostAB);

  // Identify the number of full A-B pairs that can be formed from the required quantities.
  const commonQuantity = Math.min(quantityA, quantityB);

  // Calculate the cost for these common A-B pairs.
  const costForCommonPairs = commonQuantity * costPerUnitPair;

  // Determine the remaining quantities of A and B after forming common pairs.
  const remainingQuantityA = quantityA - commonQuantity;
  const remainingQuantityB = quantityB - commonQuantity;

  // Calculate the cost for any remaining A items.
  // Option 1: Buy the remaining A items individually.
  // Option 2: Buy AB sets to cover the remaining A items (this also provides 'extra' B items, but might be cheaper).
  const costForRemainingA = remainingQuantityA * Math.min(unitCostA, 2 * setCostAB);

  // Calculate the cost for any remaining B items.
  // Option 1: Buy the remaining B items individually.
  // Option 2: Buy AB sets to cover the remaining B items (this also provides 'extra' A items, but might be cheaper).
  const costForRemainingB = remainingQuantityB * Math.min(unitCostB, 2 * setCostAB);

  // The total minimum cost is the sum of costs for common pairs and any remaining individual items.
  const totalMinimumExpenditure = costForCommonPairs + costForRemainingA + costForRemainingB;

  console.log(totalMinimumExpenditure);
};

calculateOptimalCost(require('fs').readFileSync('/dev/stdin', 'utf8'));
