var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

function generatePathSequence(initialPosition, finalDestination) {
    let currentPosition = initialPosition;
    const pathResult = [currentPosition];
    let movementDirection = 1; // Represents the 'plus' variable from original

    if (currentPosition < finalDestination) {
        while (currentPosition !== finalDestination) {
            currentPosition++;
            pathResult.push(currentPosition);
        }
    } else if (currentPosition > finalDestination && currentPosition <= 5) {
        while (currentPosition !== finalDestination) {
            currentPosition--;
            pathResult.push(currentPosition);
        }
    } else if (currentPosition > finalDestination && currentPosition >= 6 && finalDestination >= 6) {
        while (currentPosition !== finalDestination) {
            currentPosition++;
            if (currentPosition === 10) {
                currentPosition = 5;
            }
            pathResult.push(currentPosition);
        }
    } else if (currentPosition > finalDestination && currentPosition >= 6 && finalDestination <= 5) {
        while (currentPosition !== finalDestination) {
            currentPosition += movementDirection;
            if (currentPosition === 10) {
                currentPosition = 5;
                movementDirection = -1;
            }
            pathResult.push(currentPosition);
        }
    }
    return pathResult;
}

const allInputLines = fileContent.trim().split("\n");
const numberOfTestCases = parseInt(allInputLines.shift(), 10);

for (let caseIterator = 0; caseIterator < numberOfTestCases; caseIterator++) {
    const currentCaseNumbers = allInputLines[caseIterator].split(" ").map(Number);
    const startValue = currentCaseNumbers[0];
    const targetValue = currentCaseNumbers[1];

    const computedPath = generatePathSequence(startValue, targetValue);
    console.log(computedPath.join(" "));
}
