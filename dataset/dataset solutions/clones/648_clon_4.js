var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var lines = fileContent.trim().split("\n");
var [targetQuantity, unitACoeff, unitBCost, unitCCoeff, unitDCost] = lines.shift().split(" ").map(Number);

const MAX_ITERATION_VALUE = 1000;

const allCombinations = Array.from({ length: (MAX_ITERATION_VALUE + 1) * (MAX_ITERATION_VALUE + 1) }, (_, index) => {
    const firstCount = Math.floor(index / (MAX_ITERATION_VALUE + 1));
    const secondCount = index % (MAX_ITERATION_VALUE + 1);

    return {
        producedQuantity: unitACoeff * firstCount + unitCCoeff * secondCount,
        totalExpense: unitBCost * firstCount + unitDCost * secondCount
    };
});

const validCombinations = allCombinations.filter(combo => combo.producedQuantity >= targetQuantity);

const expenses = validCombinations.map(combo => combo.totalExpense);

const minimumAchievableExpense = Math.min(...expenses);

console.log(minimumAchievableExpense);
