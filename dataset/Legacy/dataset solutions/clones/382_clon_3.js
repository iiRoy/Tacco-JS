const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedInputLines = rawInputContent.endsWith('\n')
    ? rawInputContent.slice(0, -1).split('\n')
    : rawInputContent.split('\n');

const numberOfTestCases = Number(processedInputLines.shift());

function getNextCyclicValue(currentValue) {
    let nextValue = currentValue + 1;
    if (nextValue === 10) {
        nextValue = 5;
    }
    return nextValue;
}

function produceNumberSequence(initialPoint, finalDestination) {
    const sequencePath = [initialPoint];
    let currentPosition = initialPoint;

    if (currentPosition === finalDestination) {
        // Already at the destination, no further steps needed.
    } else if (currentPosition < finalDestination) {
        // Increment current position until it reaches the final destination.
        while (currentPosition < finalDestination) {
            currentPosition++;
            sequencePath.push(currentPosition);
        }
    } else if (currentPosition > finalDestination && currentPosition <= 5) {
        // Decrement current position until it reaches the final destination, applicable for values up to 5.
        while (currentPosition > finalDestination) {
            currentPosition--;
            sequencePath.push(currentPosition);
        }
    } else { // currentPosition > finalDestination && currentPosition > 5, implies cyclic behavior.
        // Apply cyclic increment until the final destination is reached.
        while (currentPosition !== finalDestination) {
            currentPosition = getNextCyclicValue(currentPosition);
            sequencePath.push(currentPosition);
        }
    }
    return sequencePath;
}

for (let caseIdx = 0; caseIdx < numberOfTestCases; caseIdx++) {
    const currentCaseLine = processedInputLines[caseIdx];
    const [startValStr, targetValStr] = currentCaseLine.split(" ");

    const startPoint = Number(startValStr);
    const endPoint = Number(targetValStr);

    const generatedPath = produceNumberSequence(startPoint, endPoint);
    console.log(generatedPath.join(" "));
}
