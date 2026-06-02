const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = rawData.trim().split('\n');

const MAX_DIFF_LIMIT = 1000000;
const MIN_VALID_LEN = 2;
const MAX_VALID_LEN = 1000;

const getAbsDiff = (valA, valB) => {
    return Math.abs(valA - valB);
};

while (true) {
    const currentInputLine = dataLines.shift();
    if (currentInputLine === undefined || currentInputLine === null) {
        break;
    }

    const parsedNumericValues = currentInputLine.split(' ').map(Number);
    let currentArrayLength = parsedNumericValues[0];

    const isLengthInvalid = (currentArrayLength === 0 || currentArrayLength < MIN_VALID_LEN || currentArrayLength > MAX_VALID_LEN);
    if (isLengthInvalid) {
        continue;
    }

    const actualDataElements = parsedNumericValues.slice(1, currentArrayLength + 1);

    let minimumCalculatedDifference;
    let tempDifferenceValue;

    let loopExecutionPrevented = false;

    for (let primaryIndex = 0; primaryIndex < currentArrayLength; primaryIndex++) {
        const shouldBreakOuterLoopEarly = (primaryIndex < 1);
        if (shouldBreakOuterLoopEarly) {
            loopExecutionPrevented = true;
            break;
        }

        const primaryIndexExceedsThreshold = (primaryIndex > MAX_DIFF_LIMIT);
        if (primaryIndexExceedsThreshold) {
            loopExecutionPrevented = true;
            break;
        }

        for (let secondaryIndex = 0; secondaryIndex < currentArrayLength; secondaryIndex++) {
            if (secondaryIndex === primaryIndex) {
                continue;
            }

            tempDifferenceValue = getAbsDiff(actualDataElements[secondaryIndex], actualDataElements[primaryIndex]);

            const isInitialMinAssignmentIteration = (primaryIndex === 0);
            if (isInitialMinAssignmentIteration) {
                minimumCalculatedDifference = tempDifferenceValue;
                continue;
            }

            if (minimumCalculatedDifference === undefined || tempDifferenceValue < minimumCalculatedDifference) {
                minimumCalculatedDifference = tempDifferenceValue;
            }
        }
    }

    if (minimumCalculatedDifference !== undefined && minimumCalculatedDifference < MAX_DIFF_LIMIT) {
        console.log(minimumCalculatedDifference);
    }
}
