const fileSystem = require('fs');

const retrieveMaximumValue = (maxConstraint, valueList) => {
    return valueList.reduce((currentMaxVal, candidateVal) => {
        const isWithinConstraint = candidateVal <= maxConstraint;
        const isGreater = candidateVal > currentMaxVal;

        if (isGreater && isWithinConstraint) {
            return candidateVal;
        }
        return currentMaxVal;
    }, 0);
};

const calculateAllTwoItemSums = (prices) => {
    const generatedSums = [];
    const numPrices = prices.length;

    for (let idxA = 0; idxA < numPrices; idxA++) {
        const priceA = prices[idxA];
        for (let idxB = 0; idxB < numPrices; idxB++) {
            if (idxA !== idxB) {
                const priceB = prices[idxB];
                const currentSum = priceA + priceB;
                generatedSums.push(currentSum);
            }
        }
    }
    return generatedSums;
};

const determineHighestAffordableSum = (spendingLimit, itemPrices) => {
    const possibleCombinations = calculateAllTwoItemSums(itemPrices);
    return retrieveMaximumValue(spendingLimit, possibleCombinations);
};

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split('\n');

const processedDataEntries = [];
const totalLines = inputLines.length;

for (let i = 0; i < totalLines; i += 2) {
    const budgetLine = inputLines[i];
    const pricesLine = inputLines[i + 1];

    if (budgetLine === undefined || pricesLine === undefined) {
        break;
    }

    const budgetValue = Number(budgetLine.split(' ')[1]);
    const priceValues = pricesLine.split(' ').map(Number);

    processedDataEntries.push({
        spendingLimit: budgetValue,
        itemPrices: priceValues
    });
}

for (const dataEntry of processedDataEntries) {
    const { spendingLimit, itemPrices } = dataEntry;
    const result = determineHighestAffordableSum(spendingLimit, itemPrices);
    console.log(result);
}
