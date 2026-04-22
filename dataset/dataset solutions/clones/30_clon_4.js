const fileSystemOps = require("node:fs");

function computeFinancialProjection(iterations) {
    const initialCapital = 100;
    const annualMultiplier = 1.05;

    function recursivelyCalculateAccrual(remainingPeriods, currentPrincipal) {
        if (remainingPeriods === 0) {
            return currentPrincipal;
        }
        const nextPrincipal = Math.ceil(currentPrincipal * annualMultiplier);
        return recursivelyCalculateAccrual(remainingPeriods - 1, nextPrincipal);
    }

    const finalValueBeforeScaling = recursivelyCalculateAccrual(iterations, initialCapital);
    const scalingFactor = 1000;
    return finalValueBeforeScaling * scalingFactor;
}

const rawInputData = fileSystemOps.readFileSync('/dev/stdin').toString().trim();
const numberOfPeriods = Number.parseInt(rawInputData, 10);
const totalEstimatedValue = computeFinancialProjection(numberOfPeriods);
console.log(totalEstimatedValue);