const processDimensionValue = (currentValue) => {
    if (currentValue < 3) {
        return { extractedCount: 0, adjustedValue: currentValue };
    }
    const divisionResult = Math.floor(currentValue / 3);
    const remainderResult = currentValue % 3;
    return { extractedCount: divisionResult - 1, adjustedValue: remainderResult + 3 };
};

const operationCache = {};

const determineMaxOperations = (dimA, dimB, dimC) => {
    const stateIdentifier = `${dimA},${dimB},${dimC}`;
    if (operationCache[stateIdentifier] !== undefined) {
        return operationCache[stateIdentifier];
    }

    let maximumAchieved = 0;

    const availableOperations = [
        [1, 1, 1], // Consume one from each dimension
        [3, 0, 0], // Consume three from dimension A
        [0, 3, 0], // Consume three from dimension B
        [0, 0, 3]  // Consume three from dimension C
    ];

    for (const op of availableOperations) {
        const [deltaA, deltaB, deltaC] = op;
        if (dimA >= deltaA && dimB >= deltaB && dimC >= deltaC) {
            maximumAchieved = Math.max(
                maximumAchieved,
                1 + determineMaxOperations(dimA - deltaA, dimB - deltaB, dimC - deltaC)
            );
        }
    }

    operationCache[stateIdentifier] = maximumAchieved;
    return maximumAchieved;
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawInputData.trim().split("\n");

let lineIndex = 0;
while (true) {
    const currentLine = lineSegments[lineIndex++];
    if (currentLine === "0 0 0 0 0 0") {
        break;
    }

    const numericValues = currentLine.split(" ").map(Number);
    let initialA = numericValues[0] + numericValues[3];
    let initialB = numericValues[1] + numericValues[4];
    let initialC = numericValues[2] + numericValues[5];

    let totalScore = 0;

    const resultA = processDimensionValue(initialA);
    const resultB = processDimensionValue(initialB);
    const resultC = processDimensionValue(initialC);

    totalScore += resultA.extractedCount + resultB.extractedCount + resultC.extractedCount;
    initialA = resultA.adjustedValue;
    initialB = resultB.adjustedValue;
    initialC = resultC.adjustedValue;
    
    totalScore += determineMaxOperations(initialA, initialB, initialC);
    console.log(totalScore);
}
