"use strict"

const parseInputLine = (lineContent) => {
  return lineContent.split(" ").map(Number);
};

const determineOptimalCost = (rawInputString) => {
  const trimmedInput = rawInputString.trim();
  const inputParts = trimmedInput.split("\n");
  
  const [unitCostA, unitCostB, unitCostABSet, requiredA, requiredB] = parseInputLine(inputParts[0]);

  const effectiveABSetPrice = 2 * unitCostABSet; // Cost for one A and one B via a set

  // Check if buying individual A and B is more expensive than an AB set
  const individualCostsSum = unitCostA + unitCostB;
  const isSetPotentiallyCheaper = individualCostsSum > effectiveABSetPrice;

  if (isSetPotentiallyCheaper) {
    // Scenario 1: Buy as many AB sets as possible, then remaining items individually
    const commonItemsCount = Math.min(requiredA, requiredB);
    const costForCommonSets = effectiveABSetPrice * commonItemsCount;

    let costForRemainingSingles = 0;
    const remainingItemsA = requiredA - commonItemsCount;
    const remainingItemsB = requiredB - commonItemsCount;

    if (remainingItemsA > 0) {
      costForRemainingSingles = unitCostA * remainingItemsA;
    } else if (remainingItemsB > 0) {
      costForRemainingSingles = unitCostB * remainingItemsB;
    }
    
    const mixedPurchaseStrategyCost = costForCommonSets + costForRemainingSingles;

    // Scenario 2: Buy all items as AB sets, even if it means overbuying the lesser quantity
    const maxItemsNeeded = Math.max(requiredA, requiredB);
    const allSetsPurchaseStrategyCost = effectiveABSetPrice * maxItemsNeeded;

    // The optimal cost is the minimum of these two strategies
    return Math.min(allSetsPurchaseStrategyCost, mixedPurchaseStrategyCost);
  } else {
    // If buying individual items is cheaper or equal to buying sets, just buy all individually
    const totalIndividualPurchaseCost = (unitCostA * requiredA) + (unitCostB * requiredB);
    return totalIndividualPurchaseCost;
  }
};

const executeProgram = () => {
  const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
  const finalResult = determineOptimalCost(fileData);
  console.log(finalResult);
};

executeProgram();
