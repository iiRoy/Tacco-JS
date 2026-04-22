const acquireInputData = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let capturedContent = '';

acquireInputData.on('line', (lineFragment) => {
    capturedContent += lineFragment + '\n';
});

acquireInputData.on('close', () => {
    const computedAnswer = processInputAndDerive(capturedContent.trim());
    process.stdout.write(computedAnswer + '\n');
});

function processInputAndDerive(completeTextStream) {
    const separatedLines = completeTextStream.split('\n');
    if (separatedLines.length !== 2) {
        throw new Error("Data input mismatch: Expected two distinct lines for processing.");
    }

    const quantitySpecifier = parseInt(separatedLines[0], 10);
    if (isNaN(quantitySpecifier)) {
        throw new Error("Parsing failure: First line value is not a valid numerical representation.");
    }

    const numericalDataString = separatedLines[1];
    const parsedNumericalElements = numericalDataString.split(' ').map(Number);

    if (parsedNumericalElements.some(Number.isNaN)) {
        throw new Error("Parsing failure: Second line contains non-numeric entries.");
    }

    const finalCalculationResult = calculateDivisibleByTwoCount(parsedNumericalElements);
    return String(finalCalculationResult);
}

const calculateDivisibleByTwoCount = (collectionOfNumbers) => {
    return collectionOfNumbers.reduce((runningTotal, currentElement) => {
        let workingValue = currentElement;
        let individualDivisionCounter = 0;
        while (workingValue % 2 === 0 && workingValue !== 0) {
            individualDivisionCounter++;
            workingValue /= 2;
        }
        return runningTotal + individualDivisionCounter;
    }, 0);
};