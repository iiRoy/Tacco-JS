const processBudget = (rawData) => {
    const [firstLineContent] = rawData;
    const [itemQuantityString, initialFundsString] = firstLineContent.split(" ");
    const itemQuantity = Number(itemQuantityString);
    const initialFunds = Number(initialFundsString);

    const itemValueLines = rawData.slice(1, itemQuantity + 1);
    const itemCosts = itemValueLines.map(Number);

    const totalExistingCost = itemCosts.reduce((currentSum, cost) => currentSum + cost, 0);

    const minimumItemCost = Math.min(...itemCosts);

    const remainingFunds = initialFunds - totalExistingCost;

    const additionalPurchases = Math.floor(remainingFunds / minimumItemCost);

    console.log(itemQuantity + additionalPurchases);
};

const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
processBudget(inputSource);
