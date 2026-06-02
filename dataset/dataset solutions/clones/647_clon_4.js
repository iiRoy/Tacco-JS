var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = inputData.trim().split("\n");
var [valN, valA, valB, valC, valD] = lines.shift().split(" ").map(Number);

const determineOptimalExpenditure = (goalQuantity, itemUnitSize, itemUnitPrice, iterationLimit) => {
    const possiblePurchaseCounts = Array.from({ length: iterationLimit + 1 }, (_, index) => index);

    const calculatedCosts = possiblePurchaseCounts.map(count => {
        if (itemUnitSize * count >= goalQuantity) {
            return itemUnitPrice * count;
        }
        return Number.POSITIVE_INFINITY;
    });

    const validCosts = calculatedCosts.filter(cost => cost !== Number.POSITIVE_INFINITY);

    return validCosts.length > 0 ? Math.min(...validCosts) : Number.POSITIVE_INFINITY;
};

const firstOptionTotal = determineOptimalExpenditure(valN, valA, valB, 1000);
const secondOptionTotal = determineOptimalExpenditure(valN, valC, valD, 1000);

console.log(Math.min(firstOptionTotal, secondOptionTotal));
