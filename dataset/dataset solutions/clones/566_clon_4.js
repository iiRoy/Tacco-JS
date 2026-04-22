const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericEntries = dataStream.trim().split("\n").map(Number);

const valueDenominations = [500, 100, 50, 10, 5, 1];

const computeMinimumItems = (totalValue) => {
    let itemCount = 0;
    let currentRemainder = totalValue;

    for (const unitSize of valueDenominations) {
        if (currentRemainder === 0) break;
        const numberOfUnits = Math.floor(currentRemainder / unitSize);
        itemCount += numberOfUnits;
        currentRemainder %= unitSize;
    }
    return itemCount;
};

numericEntries.every( (entryValue) => {
    if (entryValue === 0) {
        return false;
    }
    const amountDue = 1000 - entryValue;
    const resultCount = computeMinimumItems(amountDue);
    console.log(resultCount);
    return true;
});