function processExpenseData(rawText) {
    const [firstLineOfData, secondLineOfData] = rawText.split('\n');
    const [_, budgetLimit] = firstLineOfData.split(' ').map(Number);
    const expenseItems = secondLineOfData.split(' ').map(Number);

    const orderedExpenses = expenseItems.slice().sort((costA, costB) => costA - costB);

    let runningTotal = 0;
    const cumulativeTotals = orderedExpenses.map(itemCost => {
        runningTotal += itemCost;
        return runningTotal;
    });

    const firstExceedingIndex = cumulativeTotals.findIndex(currentSum => currentSum > budgetLimit);

    let purchasedCount;
    if (firstExceedingIndex === -1) {
        purchasedCount = orderedExpenses.length;
    } else {
        purchasedCount = firstExceedingIndex;
    }

    console.log(purchasedCount);
}

processExpenseData(require('fs').readFileSync('/dev/stdin', 'utf8'));