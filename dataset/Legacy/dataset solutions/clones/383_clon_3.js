function generateBouncingPath(initialPosition, targetPosition) {
    let currentPosition = initialPosition;
    let currentDirection = 1;
    const pathSequence = [initialPosition];

    while (currentPosition !== targetPosition) {
        currentPosition += currentDirection;

        if (currentPosition === 10) {
            currentPosition = 5;
            currentDirection = -1;
        } else if (currentPosition === 0) {
            currentDirection = 1;
        }
        pathSequence.push(currentPosition);
    }
    return pathSequence;
}

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputContent.trim().split('\n');
const numberOfCases = parseInt(processedLines.shift(), 10);

for (let caseIterator = 0; caseIterator < numberOfCases; caseIterator++) {
    const currentCaseValues = processedLines[caseIterator].split(' ').map(Number);
    const initialValue = currentCaseValues[0];
    const finalValue = currentCaseValues[1];

    let computedPath = [initialValue];

    if (initialValue < finalValue) {
        let tempCurrent = initialValue;
        while (tempCurrent !== finalValue) {
            tempCurrent++;
            computedPath.push(tempCurrent);
        }
    } else if (initialValue > finalValue && initialValue <= 5) {
        let tempCurrent = initialValue;
        while (tempCurrent !== finalValue) {
            tempCurrent--;
            computedPath.push(tempCurrent);
        }
    } else if (initialValue > finalValue && initialValue >= 6) {
        computedPath = generateBouncingPath(initialValue, finalValue);
    }

    console.log(computedPath.join(' '));
}
