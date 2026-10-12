const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const rawInputLines = fileContent.trim().split('\n');
const parsedDataEntries = [];

for (const currentInputLine of rawInputLines) {
    const numericParts = currentInputLine.split(',');
    if (numericParts.length === 2) {
        parsedDataEntries.push({
            firstValue: Number(numericParts[0]),
            secondValue: Number(numericParts[1])
        });
    }
}

let aggregatedProduct = 0;
let aggregatedSecondComponent = 0;
const totalEntryCount = parsedDataEntries.length;

for (const dataItem of parsedDataEntries) {
    aggregatedProduct += dataItem.firstValue * dataItem.secondValue;
    aggregatedSecondComponent += dataItem.secondValue;
}

console.log(aggregatedProduct);
console.log(Math.round(aggregatedSecondComponent / totalEntryCount));
