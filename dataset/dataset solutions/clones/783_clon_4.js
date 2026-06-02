const sourceDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = sourceDataContent.trim().split('\n');

function* transactionBlockGenerator(linesCollection) {
    let currentLineIndex = 0;
    while (currentLineIndex < linesCollection.length) {
        const requiredPayment = Number(linesCollection[currentLineIndex++]);
        if (requiredPayment === 0) {
            return;
        }
        const availableCoinCounts = linesCollection[currentLineIndex++].split(' ').map(Number);
        yield { requiredPayment, availableCoinCounts };
    }
}

const currencyDenominations = [10, 50, 100, 500];
const descendingDenominations = [...currencyDenominations].reverse();

const outputAccumulator = [];

for (const currentTransaction of transactionBlockGenerator(processedLines)) {
    const { requiredPayment, availableCoinCounts } = currentTransaction;

    let totalValueHeldByCustomer = availableCoinCounts.reduce((sum, count, index) => sum + count * currencyDenominations[index], 0);
    let changeAmount = totalValueHeldByCustomer - requiredPayment;

    const dispensedCoinQuantities = Array(currencyDenominations.length).fill(0);

    descendingDenominations.forEach(denominationValue => {
        if (changeAmount >= denominationValue) {
            const countToDispense = Math.floor(changeAmount / denominationValue);
            const originalDenomIndex = currencyDenominations.indexOf(denominationValue);
            dispensedCoinQuantities[originalDenomIndex] = countToDispense;
            changeAmount -= countToDispense * denominationValue;
        }
    });

    const transactionResultLines = currencyDenominations.map((denominationValue, index) => {
        const initialQuantity = availableCoinCounts[index];
        const dispensedQuantity = dispensedCoinQuantities[index];
        const remainingUnusedQuantity = initialQuantity - dispensedQuantity;
        return remainingUnusedQuantity > 0 ? `${denominationValue} ${remainingUnusedQuantity}` : null;
    }).filter(Boolean);

    if (transactionResultLines.length > 0) {
        outputAccumulator.push(...transactionResultLines);
    }
    outputAccumulator.push('');
}

console.log(outputAccumulator.join('\n').trim());
