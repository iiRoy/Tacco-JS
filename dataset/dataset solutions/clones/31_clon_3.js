const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const numIterations = parseInt(rawInputData, 10);

const INITIAL_PRINCIPAL_AMOUNT = 100000;
const ANNUAL_GROWTH_FACTOR = 1.05;
const ROUNDING_GRANULARITY = 1000;

function calculateRoundedValue(currentAmount) {
    const intermediateDivision = currentAmount / ROUNDING_GRANULARITY;
    const ceilingResult = Math.ceil(intermediateDivision);
    const finalRoundedAmount = ceilingResult * ROUNDING_GRANULARITY;
    return finalRoundedAmount;
}

let currentInvestmentValue = INITIAL_PRINCIPAL_AMOUNT;

for (let iterationCounter = 0; iterationCounter < numIterations; iterationCounter++) {
    currentInvestmentValue = currentInvestmentValue * ANNUAL_GROWTH_FACTOR;
    currentInvestmentValue = calculateRoundedValue(currentInvestmentValue);
}

console.log(currentInvestmentValue);
