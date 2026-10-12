const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = fileContent.trim().split('\n');
let currentLineIndex = 0;

const computeOptimalCost = (calculationParams) => {
    const {
        costPerUnitA, costPerUnitB, costPerUnitC,
        blockThresholdD, costPerUnitE,
        quantityA, quantityB, quantityC
    } = calculationParams;

    const remainderQuantityC = quantityC % blockThresholdD;
    let scenarioOneCost = quantityA * costPerUnitA + quantityB * costPerUnitB + Math.floor(quantityC / blockThresholdD) * blockThresholdD * costPerUnitE + remainderQuantityC * costPerUnitC;

    let scenarioTwoCost;
    if (quantityC >= blockThresholdD) {
        scenarioTwoCost = quantityA * costPerUnitA + quantityB * costPerUnitB + quantityC * costPerUnitE;
    } else {
        const requiredReduction = blockThresholdD - remainderQuantityC;
        const effectiveQuantityB = Math.max(0, quantityB - requiredReduction);
        const remainingReduction = requiredReduction - (quantityB - effectiveQuantityB);
        const effectiveQuantityA = Math.max(0, quantityA - remainingReduction);
        scenarioTwoCost = effectiveQuantityA * costPerUnitA + effectiveQuantityB * costPerUnitB + blockThresholdD * costPerUnitE;
    }
    return Math.min(scenarioOneCost, scenarioTwoCost);
};

do {
    const firstSegmentLine = allInputLines[currentLineIndex++];
    if (firstSegmentLine === "0 0 0 0 0") {
        break;
    }
    const secondSegmentLine = allInputLines[currentLineIndex++];
    const numericalValues = (firstSegmentLine + " " + secondSegmentLine).split(" ").map(Number);

    const parametersForCalculation = {
        costPerUnitA: numericalValues[0],
        costPerUnitB: numericalValues[1],
        costPerUnitC: numericalValues[2],
        blockThresholdD: numericalValues[3],
        costPerUnitE: numericalValues[4],
        quantityA: numericalValues[5],
        quantityB: numericalValues[6],
        quantityC: numericalValues[7]
    };

    console.log(computeOptimalCost(parametersForCalculation));

} while (currentLineIndex < allInputLines.length);
