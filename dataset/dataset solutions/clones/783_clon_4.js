const externalData = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedLines = externalData.trim().split('\n');

let linePointer = 0;
const processedCases = [];

while (true) {
    const currentCharge = parseInt(parsedLines[linePointer++], 10);
    if (currentCharge === 0) {
        break;
    }

    const providedCurrencyCountsArr = parsedLines[linePointer++].split(' ').map(Number);
    const providedCurrencyCounts = {
        '10': providedCurrencyCountsArr[0],
        '50': providedCurrencyCountsArr[1],
        '100': providedCurrencyCountsArr[2],
        '500': providedCurrencyCountsArr[3]
    };

    processedCases.push({
        itemCost: currentCharge,
        initialCoins: providedCurrencyCounts
    });
}

const currencyUnitsDescending = [500, 100, 50, 10]; // For greedy change calculation
const currencyUnitsAscending = [10, 50, 100, 500]; // For total calculation and final output order

const caseResults = processedCases.map(individualCase => {
    // Calculate total value of coins the customer has
    const totalFunds = currencyUnitsAscending.reduce((accumulator, unitValue) => 
        accumulator + individualCase.initialCoins[unitValue] * unitValue, 0);

    // Calculate the amount of change to be given back
    let refundAmount = totalFunds - individualCase.itemCost;

    // Determine the breakdown of coins to return using a greedy approach
    const returnedCurrencyBreakdown = {};
    currencyUnitsDescending.forEach(unitValue => {
        returnedCurrencyBreakdown[unitValue] = Math.floor(refundAmount / unitValue);
        refundAmount %= unitValue;
    });

    // Identify which coins were NOT used by the transaction
    const unusedCurrencyLines = currencyUnitsAscending.flatMap(unitValue => {
        const availableCount = individualCase.initialCoins[unitValue];
        const dispensedCount = returnedCurrencyBreakdown[unitValue] || 0; // If no coins of this type were returned
        const remainingCount = availableCount - dispensedCount;
        
        return remainingCount > 0 ? [`${unitValue} ${remainingCount}`] : [];
    });

    return unusedCurrencyLines.join('\n');
});

console.log(caseResults.join('\n\n').trim());