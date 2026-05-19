process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

lineProcessor.on('close', () => {
    let [itemCount, initialFunds] = inputLines[0].split(" ").map(Number);
    const sortedCosts = inputLines[1].split(" ").map(Number).sort((a, b) => a - b);

    const purchaseOutcome = sortedCosts.reduce((accumulator, currentCost) => {
        if (!accumulator.continueProcessing) {
            return accumulator;
        }

        const budgetAfterAttempt = accumulator.availableBudget - currentCost;

        if (budgetAfterAttempt >= 0) {
            return {
                availableBudget: budgetAfterAttempt,
                itemsAcquired: accumulator.itemsAcquired + 1,
                continueProcessing: true
            };
        } else {
            return {
                availableBudget: budgetAfterAttempt,
                itemsAcquired: accumulator.itemsAcquired,
                continueProcessing: false
            };
        }
    }, { availableBudget: initialFunds, itemsAcquired: 0, continueProcessing: true });

    console.log(purchaseOutcome.itemsAcquired);
});
