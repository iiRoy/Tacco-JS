const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processTransactionData = (deductionValue, initialCoinHoldings) => {
    const coinDenominationValues = [10, 50, 100, 500];
    const changeAlgorithmDenominations = [500, 100, 50, 10]; // Ordered for greedy calculation
    const denominationToIndexMap = { 10: 0, 50: 1, 100: 2, 500: 3 }; // Maps value to array index

    const totalInitialValue = initialCoinHoldings.reduce((accumulatedSum, count, index) => accumulatedSum + count * coinDenominationValues[index], 0);
    let remainingAmountForChange = totalInitialValue - deductionValue;

    const dispensedCoinCounts = [0, 0, 0, 0]; // Corresponds to the 'M' array in the original

    for (const currentDenom of changeAlgorithmDenominations) {
        if (remainingAmountForChange >= currentDenom) {
            const countToDispense = Math.floor(remainingAmountForChange / currentDenom);
            dispensedCoinCounts[denominationToIndexMap[currentDenom]] = countToDispense;
            remainingAmountForChange -= countToDispense * currentDenom;
        }
    }

    const resultLines = initialCoinHoldings.map((initialCount, index) => {
        const currentCoinValue = coinDenominationValues[index];
        const dispensedCount = dispensedCoinCounts[index];
        return (initialCount > dispensedCount) ? `${currentCoinValue} ${initialCount - dispensedCount}` : null;
    }).filter(Boolean); // Filters out nulls (coins that were fully used or not present)

    return resultLines.join('\n');
};

const allInputLines = rawInputContent.trim().split('\n');

const collectedTransactionOutputs = allInputLines.reduce((outputAccumulator, currentLineSegment, lineIndex, sourceArray) => {
    if (lineIndex % 2 === 0) { // This line contains the deduction value
        const currentDeduction = Number(currentLineSegment);
        if (currentDeduction === 0) {
            sourceArray.splice(lineIndex); // Stop further processing by truncating the array
            return outputAccumulator;
        }
        const currentCoinCounts = sourceArray[lineIndex + 1].split(' ').map(Number);
        outputAccumulator.push(processTransactionData(currentDeduction, currentCoinCounts));
    }
    return outputAccumulator;
}, []);

console.log(collectedTransactionOutputs.join('\n'));
