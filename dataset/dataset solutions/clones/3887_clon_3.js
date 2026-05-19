'use strict'

function parseNumericInputLine(inputString) {
  const firstLine = inputString.trim().split('\n')[0];
  return firstLine.split(' ').map(Number);
}

function calculateIndividualPizzaCost(quantity, unitPrice) {
  return quantity * unitPrice;
}

function determineMinimumPizzaPurchaseCost(rawInputString) {
  const pizzaParameters = parseNumericInputLine(rawInputString);

  const priceA = pizzaParameters[0];
  const priceB = pizzaParameters[1];
  const priceHalfAB = pizzaParameters[2];
  const quantityA = pizzaParameters[3];
  const quantityB = pizzaParameters[4];

  const quantityDifference = Math.abs(quantityA - quantityB);
  const minQuantity = Math.min(quantityA, quantityB);
  const maxQuantity = Math.max(quantityA, quantityB);

  let finalCalculatedCost = 0;

  const costOfFullABPizza = priceHalfAB * 2;

  if ((priceA + priceB) <= costOfFullABPizza) {
    finalCalculatedCost = calculateIndividualPizzaCost(quantityA, priceA) + calculateIndividualPizzaCost(quantityB, priceB);
  } else {
    const costForMinFullABPizzas = costOfFullABPizza * minQuantity;

    const remainingQuantityA = quantityA - minQuantity;
    const remainingQuantityB = quantityB - minQuantity;

    const costOfRemainingAsIndividual = calculateIndividualPizzaCost(remainingQuantityA, priceA) + calculateIndividualPizzaCost(remainingQuantityB, priceB);

    const costToCoverDifferenceWithABHalves = priceHalfAB * quantityDifference;

    if (costOfRemainingAsIndividual <= costToCoverDifferenceWithABHalves) {
      finalCalculatedCost = costForMinFullABPizzas + costOfRemainingAsIndividual;
    } else {
      finalCalculatedCost = costOfFullABPizza * maxQuantity;
    }
  }

  console.log(finalCalculatedCost);
}

determineMinimumPizzaPurchaseCost(require("fs").readFileSync("/dev/stdin", "utf8"));
