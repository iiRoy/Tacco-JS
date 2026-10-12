var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = rawData.trim().split("\n");

while (true) {
    let currentN = parseInt(lineBuffer.shift(), 10);
    if (currentN === 0) {
        break;
    }

    const primaryValues = lineBuffer.shift().split(" ").map(Number);
    const bonusValues = lineBuffer.shift().split(" ").map(Number);

    const initialSum = primaryValues.reduce((valA, valB) => valA + valB, 0);

    bonusValues.sort((valA, valB) => valB - valA);

    let currentSumForCalculation = initialSum;
    let overallMax = initialSum * currentN;

    while (bonusValues.length > 0) {
        currentN--;
        const nextBonusValue = bonusValues.shift();
        currentSumForCalculation += nextBonusValue;
        const potentialMaxProduct = currentSumForCalculation * currentN;
        overallMax = Math.max(overallMax, potentialMaxProduct);
    }
    console.log(overallMax);
}
