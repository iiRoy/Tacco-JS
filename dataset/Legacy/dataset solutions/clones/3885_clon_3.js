"use strict";

const parseInputValues = (inputString) => {
  const firstLine = inputString.split("\n")[0];
  const stringNumbers = firstLine.split(" ");
  return stringNumbers.map(Number);
};

const calculateOptimalCost = (inputData) => {
  const [itemAPrice, itemBPrice, comboHalfPrice, neededA, neededB] = parseInputValues(inputData);

  let totalCalculatedCost = 0;

  const fullComboPrice = comboHalfPrice * 2;

  const individualPairCost = itemAPrice + itemBPrice;
  const isFullComboCheaperThanIndividualPair = (individualPairCost > fullComboPrice);

  const commonItemCount = Math.min(neededA, neededB);

  const remainingItemCount = Math.abs(neededA - neededB);

  const priceOfExcessItem = (neededA > neededB) ? itemAPrice : itemBPrice;

  let costForExcessItems;
  costForExcessItems = Math.min(
    remainingItemCount * priceOfExcessItem,
    remainingItemCount * fullComboPrice
  );

  if (isFullComboCheaperThanIndividualPair) {
    totalCalculatedCost = commonItemCount * fullComboPrice;
    totalCalculatedCost += costForExcessItems;
  } else {
    totalCalculatedCost = (itemAPrice * neededA) + (itemBPrice * neededB);
  }

  console.log(totalCalculatedCost);
};

calculateOptimalCost(require('fs').readFileSync('/dev/stdin', 'utf8'));
