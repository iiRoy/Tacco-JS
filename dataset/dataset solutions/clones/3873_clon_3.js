const convertToNumber = (str) => Number(str);

function calculateBudgetResult(inputLines) {
    const firstLineData = inputLines[0].split(" ");
    const initialItemCount = convertToNumber(firstLineData[0]);
    let remainingBudget = convertToNumber(firstLineData[1]);

    const initialItemCostStrings = inputLines.slice(1, initialItemCount + 1);
    const allItemCosts = initialItemCostStrings.map(convertToNumber);

    const totalInitialCost = allItemCosts.reduce((accumulator, currentCost) => accumulator + currentCost, 0);

    allItemCosts.sort((costA, costB) => costA - costB);

    remainingBudget -= totalInitialCost;

    let purchasableAdditionalItems = 0;
    const cheapestAvailableItemCost = allItemCosts[0];

    purchasableAdditionalItems = Math.floor(remainingBudget / cheapestAvailableItemCost);

    const finalCalculatedCount = initialItemCount + purchasableAdditionalItems;

    console.log(finalCalculatedCount);
}

calculateBudgetResult(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
