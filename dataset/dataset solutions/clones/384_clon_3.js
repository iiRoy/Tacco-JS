const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputData.endsWith('\n') ? rawInputData.slice(0, -1).split('\n') : rawInputData.split('\n');

const numberOfTestCases = Number(processedLines.shift());

function calculatePathSequence(initialValue, targetValue) {
    let currentValue = initialValue;
    const resultSequence = [currentValue];

    if (currentValue === targetValue) {
        return resultSequence;
    }

    if (currentValue < targetValue) {
        while (currentValue !== targetValue) {
            currentValue++;
            resultSequence.push(currentValue);
        }
    } else if (currentValue > targetValue && currentValue <= 5) {
        while (currentValue !== targetValue) {
            currentValue--;
            resultSequence.push(currentValue);
        }
    } else {
        const CYCLE_RESET_THRESHOLD = 10;
        const CYCLE_START_VALUE = 5;
        while (currentValue !== targetValue) {
            currentValue++;
            if (currentValue === CYCLE_RESET_THRESHOLD) {
                currentValue = CYCLE_START_VALUE;
            }
            resultSequence.push(currentValue);
        }
    }
    return resultSequence;
}

for (let caseIdx = 0; caseIdx < numberOfTestCases; caseIdx++) {
    const currentCaseLine = processedLines[caseIdx];
    const [startNumber, goalNumber] = currentCaseLine.split(" ").map(Number);

    const finalPath = calculatePathSequence(startNumber, goalNumber);

    console.log(finalPath.join(" "));
}
