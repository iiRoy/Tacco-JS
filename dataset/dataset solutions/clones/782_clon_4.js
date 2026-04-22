const dataSourceContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = dataSourceContent.trim().split('\n');

function* lineSourceGenerator(lines) {
    let currentPointer = 0;
    while (currentPointer < lines.length) {
        yield lines[currentPointer++];
    }
}

const inputLineIterator = lineSourceGenerator(allInputLines);
const accumulatedOutputSegments = [];

const currencyUnits = [
    { face: 10, arrayPos: 0 },
    { face: 50, arrayPos: 1 },
    { face: 100, arrayPos: 2 },
    { face: 500, arrayPos: 3 }
];

const processTransactionBlock = (price, customerProvidedCoins) => {
    const totalValueProvided = customerProvidedCoins.reduce((summation, count, idx) => {
        return summation + count * currencyUnits[idx].face;
    }, 0);

    let changeToDispense = totalValueProvided - price;

    const dispensedCoinCounts = currencyUnits.slice()
        .sort((a, b) => b.face - a.face)
        .reduce((currentDispensed, unitDetail) => {
            if (changeToDispense >= unitDetail.face) {
                const numCoins = Math.floor(changeToDispense / unitDetail.face);
                currentDispensed[unitDetail.arrayPos] = numCoins;
                changeToDispense -= numCoins * unitDetail.face;
            }
            return currentDispensed;
        }, new Array(4).fill(0));

    const linesForThisCase = [];
    currencyUnits.forEach(unitDetail => {
        const suppliedCount = customerProvidedCoins[unitDetail.arrayPos];
        const returnedCount = dispensedCoinCounts[unitDetail.arrayPos];
        if (suppliedCount > returnedCount) {
            linesForThisCase.push(`${unitDetail.face} ${suppliedCount - returnedCount}`);
        }
    });

    return linesForThisCase.join('\n');
};

for (const transactionCostLine of inputLineIterator) {
    const itemTransactionCost = Number(transactionCostLine);

    if (itemTransactionCost === 0) {
        break;
    }

    const customerCoinInputLine = inputLineIterator.next().value;
    const customerCoinQuantities = customerCoinInputLine.split(' ').map(Number);

    const caseResultString = processTransactionBlock(itemTransactionCost, customerCoinQuantities);
    accumulatedOutputSegments.push(caseResultString);
    accumulatedOutputSegments.push('');
}

console.log(accumulatedOutputSegments.join('\n'));