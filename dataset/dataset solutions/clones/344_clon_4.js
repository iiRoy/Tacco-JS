const merchandiseDetailsCatalogue = [
    { primaryMeasureUnit: 1500, financialCost: 2244, maximumQuantity: 4 },
    { primaryMeasureUnit: 1200, financialCost: 1870, maximumQuantity: 5 },
    { primaryMeasureUnit: 1000, financialCost: 1520, maximumQuantity: 6 },
    { primaryMeasureUnit: 500,  financialCost: 850,  maximumQuantity: 11 },
    { primaryMeasureUnit: 300,  financialCost: 550,  maximumQuantity: 17 },
    { primaryMeasureUnit: 200,  financialCost: 380,  maximumQuantity: 26 }
];

const TOTAL_MAX_MEASURE_VALUE = 33800; // Sum of (item.primaryMeasureUnit * item.maximumQuantity) for all items

const calculateMinimumExpense = function(desiredMeasureTotal) {
    // This array stores the minimum financialCost for each possible primaryMeasureUnit total.
    // Index represents the total primaryMeasureUnit, value represents the minimum financialCost.
    const optimalExpenseByMeasure = new Array(TOTAL_MAX_MEASURE_VALUE + 1).fill(Infinity);
    optimalExpenseByMeasure[0] = 0; // A total measure of 0 costs 0.

    // Iterate through each type of merchandise item in the catalogue
    for (const currentItem of merchandiseDetailsCatalogue) {
        const currentItemMeasure = currentItem.primaryMeasureUnit;
        const currentItemExpense = currentItem.financialCost;
        const currentItemLimit = currentItem.maximumQuantity;

        // Create a new DP array for the state after considering the current item.
        // Initialize it with the values from the previous state (i.e., not using the current item).
        const nextOptimalExpenseState = optimalExpenseByMeasure.slice();

        // Iterate through all possible accumulated measure totals
        for (let accumulatedMeasure = 0; accumulatedMeasure <= TOTAL_MAX_MEASURE_VALUE; accumulatedMeasure++) {
            // If this accumulatedMeasure is reachable *before* considering the current item
            if (optimalExpenseByMeasure[accumulatedMeasure] !== Infinity) {
                // Try adding 1 up to currentItemLimit units of the current item.
                // The case of adding 0 units is implicitly handled by `nextOptimalExpenseState = optimalExpenseByMeasure.slice()`.
                for (let unitsCount = 1; unitsCount <= currentItemLimit; unitsCount++) {
                    const newAccumulatedMeasure = accumulatedMeasure + (unitsCount * currentItemMeasure);

                    // If the new total measure is within our bounds
                    if (newAccumulatedMeasure <= TOTAL_MAX_MEASURE_VALUE) {
                        const newCalculatedExpense = optimalExpenseByMeasure[accumulatedMeasure] + (unitsCount * currentItemExpense);
                        // Update the temporary state with the minimum expense found so far for this new total measure
                        nextOptimalExpenseState[newAccumulatedMeasure] = Math.min(nextOptimalExpenseState[newAccumulatedMeasure], newCalculatedExpense);
                    }
                }
            }
        }
        // Update the main DP array for the next iteration
        // Using splice to efficiently replace array content without reassigning the const variable
        optimalExpenseByMeasure.splice(0, optimalExpenseByMeasure.length, ...nextOptimalExpenseState);
    }

    const finalResultExpense = optimalExpenseByMeasure[desiredMeasureTotal];
    // If the desired measure total is not achievable, return the large initial value from original code
    return finalResultExpense === Infinity ? 100000000 : finalResultExpense;
};

// Input processing and output handling
const incomingLineBuffer = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (dataSegment) {
    dataSegment.trim().split('\n').forEach(function(parsedLine) {
        incomingLineBuffer.push(parsedLine);
    });
});

process.stdin.on('end', function() {
    for (let currentLineIndex = 0; currentLineIndex < incomingLineBuffer.length; currentLineIndex++) {
        const currentInputMeasure = parseInt(incomingLineBuffer[currentLineIndex].trim());
        if (currentInputMeasure === 0) {
            return; // Terminate processing on '0' input
        }
        console.log(calculateMinimumExpense(currentInputMeasure));
    }
});