'use strict';

function processRecipeData(rawData) {
    let minimumIngredientPrice = Infinity;
    let totalRecipeCost = 0;
    let ingredientCount = 0;

    for (let i = 2; i < rawData.length; i++) {
        const currentIngredientValue = rawData[i];
        if (currentIngredientValue < minimumIngredientPrice) {
            minimumIngredientPrice = currentIngredientValue;
        }
        totalRecipeCost += currentIngredientValue;
        ingredientCount++;
    }
    return { minimumIngredientPrice, totalRecipeCost, ingredientCount };
}

function calculateMaxItems(sourceText) {
    const parsedNumbers = sourceText.match(/\d+/g).map(Number);

    const availableBudget = parsedNumbers[1];

    const { minimumIngredientPrice, totalRecipeCost, ingredientCount } = processRecipeData(parsedNumbers);

    let totalAcquiredItems = 0;
    let currentFunds = availableBudget;

    totalAcquiredItems += ingredientCount;
    currentFunds -= totalRecipeCost;

    while (currentFunds >= minimumIngredientPrice) {
        totalAcquiredItems++;
        currentFunds -= minimumIngredientPrice;
    }

    console.log(totalAcquiredItems);
}

calculateMaxItems(require("fs").readFileSync("/dev/stdin", "utf8"));
