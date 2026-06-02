function calculateMinimumScalingFactor(currentValue, targetValue) {
    return Math.ceil(currentValue / targetValue);
}

function processInputData(rawData) {
    const numOperations = Number(rawData[0]);
    let currentA = 1;
    let currentB = 1;

    for (let opIndex = 1; opIndex <= numOperations; opIndex++) {
        const lineSegments = rawData[opIndex].split(" ");
        const targetA = Number(lineSegments[0]);
        const targetB = Number(lineSegments[1]);

        let requiredFactor;

        if (targetA >= currentA && targetB >= currentB) {
            currentA = targetA;
            currentB = targetB;
        } else if (currentA >= targetA && currentB >= targetB) {
            const factorForA = calculateMinimumScalingFactor(currentA, targetA);
            const factorForB = calculateMinimumScalingFactor(currentB, targetB);
            requiredFactor = Math.max(factorForA, factorForB);

            currentA = requiredFactor * targetA;
            currentB = requiredFactor * targetB;
        } else if (currentA >= targetA) {
            requiredFactor = calculateMinimumScalingFactor(currentA, targetA);
            currentA = requiredFactor * targetA;
            currentB = requiredFactor * targetB;
        } else {
            requiredFactor = calculateMinimumScalingFactor(currentB, targetB);
            currentA = requiredFactor * targetA;
            currentB = requiredFactor * targetB;
        }
    }
    console.log(currentA + currentB);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = fileContent.trim().split("\n");
processInputData(processedLines);
