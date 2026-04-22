function calculatePoints(inputLine) {
    const parts = inputLine.trim().split(/\s+/);
    const valA = Number(parts[0]);
    const valB = Number(parts[1]);

    const ruleSet = [
        { test: (a, b) => a === 1 && b === 1, bonus: 400000 },
        { test: (a, b) => a === 1, bonus: 300000 },
        { test: (a, b) => b === 1, bonus: 300000 },
        { test: (a, b) => a === 2, bonus: 200000 },
        { test: (a, b) => b === 2, bonus: 200000 },
        { test: (a, b) => a === 3, bonus: 100000 },
        { test: (a, b) => b === 3, bonus: 100000 },
    ];

    const accumulatedValue = ruleSet.reduce((currentSum, ruleItem) => {
        if (ruleItem.test(valA, valB)) {
            return currentSum + ruleItem.bonus;
        }
        return currentSum;
    }, 0);

    return accumulatedValue;
}

const fileModule = require('node:fs');
const acquiredData = fileModule.readFileSync('/dev/stdin', 'utf8');

const finalScore = calculatePoints(acquiredData);
console.log(finalScore);