const fileData = require("fs").readFileSync("/dev/stdin", "utf8");

const { sumVal, sumQty, numEntries } = fileData.trim().split('\n').reduce((acc, currentEntry) => {
    const parts = currentEntry.split(',');
    const itemPrice = Number(parts[0]);
    const itemQuantity = Number(parts[1]);

    acc.sumVal += itemPrice * itemQuantity;
    acc.sumQty += itemQuantity;
    acc.numEntries++;

    return acc;
}, { sumVal: 0, sumQty: 0, numEntries: 0 });

const averageResult = sumQty / numEntries;
const roundedAverage = ~~ (averageResult + 0.5);

console.log(`${sumVal}\n${roundedAverage}`);
