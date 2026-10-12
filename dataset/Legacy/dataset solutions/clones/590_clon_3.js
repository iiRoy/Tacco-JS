const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const dataLines = rawInputContent.trim().split("\n");

const SUBTRACTION_COUNT = 9;

let processingActive = true;

const getNextNumericValue = () => {
    const nextLine = dataLines.shift();
    return Number(nextLine);
};

while (processingActive) {
    const currentBlockInitialValue = getNextNumericValue();

    if (currentBlockInitialValue === 0) {
        processingActive = false;
        continue;
    }

    let accumulatedSubtraction = 0;
    let iterationCounter = 0;

    while (iterationCounter < SUBTRACTION_COUNT) {
        accumulatedSubtraction += getNextNumericValue();
        iterationCounter++;
    }

    const finalCalculatedDifference = currentBlockInitialInitialValue - accumulatedSubtraction;
    console.log(finalCalculatedDifference);
}
