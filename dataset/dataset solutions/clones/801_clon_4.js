const fileSystem = require('fs');

let entireContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
let contentLines = entireContent.split('\n').filter(Boolean); // Filter(Boolean) removes empty strings

let currentPosition = 0;

const fetchLine = () => {
    if (currentPosition < contentLines.length) {
        return contentLines[currentPosition++];
    }
    return null;
};

const executeDataCycle = () => {
    const configData = fetchLine();
    if (configData === null) return;

    const numericConfig = configData.split(' ').map(Number);

    const quantityOfItems = numericConfig[0];
    const targetElementOffset = numericConfig[1] - 1; // Adjust to 0-indexed
    const deductionFactor = numericConfig[2];

    // Termination condition: 0 0 0 (which becomes 0 -1 0 after adjustment)
    if (quantityOfItems === 0 && targetElementOffset === -1 && deductionFactor === 0) {
        return;
    }

    const collectedValues = Array.from({ length: quantityOfItems }, () => Number(fetchLine()));

    const grossWeightedTotal = collectedValues.reduce((accumulator, valueElement) => {
        return accumulator + (valueElement * 100);
    }, 0);

    const netAdjustedTotal = grossWeightedTotal * (100 - deductionFactor) / 100;

    let finalComputation = 0;
    if (collectedValues[targetElementOffset] !== 0) {
        finalComputation = Math.trunc(netAdjustedTotal / collectedValues[targetElementOffset]);
    }

    console.log(finalComputation);

    // Recursively process the next data cycle
    executeDataCycle();
};

// Initiate the processing
executeDataCycle();