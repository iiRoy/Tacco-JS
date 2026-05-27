"use strict";

const calculateMinimumCost = (inputData) => {
  const numericComponents = inputData.trim().split(/\s+/).map(Number);
  const [unitPriceA, unitPriceB, setPricePerHalf, quantityA, quantityB] = numericComponents;

  // Option 1: Purchase all items individually
  const costAllSeparate = unitPriceA * quantityA + unitPriceB * quantityB;

  // Option 2: Purchase as many sets as possible, then individual items for the remainder
  const commonCount = Math.min(quantityA, quantityB);
  const remainingCountA = quantityA - commonCount;
  const remainingCountB = quantityB - commonCount;

  const costMixedStrategy = (setPricePerHalf * 2 * commonCount) +
                            (unitPriceA * remainingCountA) +
                            (unitPriceB * remainingCountB);

  // Option 3: Purchase enough sets to cover the maximum required quantity,
  // accepting potential surplus of one item type.
  const maxRequiredCount = Math.max(quantityA, quantityB);
  const costAllSetsStrategy = setPricePerHalf * 2 * maxRequiredCount;

  // The optimal cost is the minimum among these three strategies.
  console.log(Math.min(costAllSeparate, costMixedStrategy, costAllSetsStrategy));
};

calculateMinimumCost(require("fs").readFileSync("/dev/stdin", "utf8"));
