let collectedDataUnits = [];

const mathOperationRegistry = new Map([
    ['+', (valA, valB) => valA + valB],
    ['-', (valA, valB) => valA - valB],
    ['*', (valA, valB) => valA * valB],
    ['/', (valA, valB) => valA / valB],
]);

function computeLineResult(inputLineText) {
    const lineComponents = inputLineText.split(" ");
    
    const operandOneString = lineComponents[0];
    const operatorSymbolString = lineComponents[1];
    const operandTwoString = lineComponents[2];

    const operandOneValue = Number(operandOneString);
    const operandTwoValue = Number(operandTwoString);

    if (operatorSymbolString === "?") {
        return false;
    }

    const operationFunction = mathOperationRegistry.get(operatorSymbolString);

    if (operationFunction) {
        return operationFunction(operandOneValue, operandTwoValue);
    } else {
        // If no operator matches (e.g., "1 X 2", "1 2", or empty string),
        // the original function implicitly returns undefined. We mimic that.
        return undefined;
    }
}

process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingData) => {
    collectedDataUnits.push(incomingData);
});

process.stdin.on('end', () => {
    const allInputContent = collectedDataUnits.join('');
    const individualLines = allInputContent.split("\n");

    individualLines.forEach(currentStatement => {
        const calculatedOutcome = computeLineResult(currentStatement);
        if (calculatedOutcome !== false) {
            console.log(calculatedOutcome);
        }
    });
});

process.stdin.resume();