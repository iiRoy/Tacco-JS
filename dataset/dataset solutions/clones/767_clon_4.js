const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split('\n');

const findBestMatch = (cap, values) => {
    const eligibleValues = values.filter(val => val <= cap);
    if (eligibleValues.length === 0) {
        return 0;
    }
    return Math.max(...eligibleValues);
};

const calculateOptimalPairSum = (spendingLimit, itemCosts) => {
    const allPossibleSums = itemCosts.flatMap((costA, idxA) =>
        itemCosts.map((costB, idxB) => (idxA !== idxB) ? (costA + costB) : null)
    ).filter(sum => sum !== null);

    return findBestMatch(spendingLimit, allPossibleSums);
};

const allInputSets = [];
for (let k = 0; k < inputLines.length; k += 2) {
    const budgetLine = inputLines[k];
    const pricesLine = inputLines[k + 1];
    if (budgetLine && pricesLine) {
        const currentBudget = parseInt(budgetLine.split(' ')[1], 10);
        const currentPrices = pricesLine.split(' ').map(Number);
        allInputSets.push({
            limitAmount: currentBudget,
            itemCosts: currentPrices
        });
    }
}

for (const dataEntry of allInputSets) {
    const { limitAmount, itemCosts } = dataEntry;
    console.log(calculateOptimalPairSum(limitAmount, itemCosts));
}
