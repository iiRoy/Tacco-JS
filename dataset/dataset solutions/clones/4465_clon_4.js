const inputProcessor = require('readline');

const terminalInterface = inputProcessor.createInterface({
    input: process.stdin,
    output: process.stdout
});

let accumulatedLines = [];

terminalInterface.on('line', (currentInputLine) => {
    accumulatedLines.push(currentInputLine);
});

terminalInterface.on('close', () => {
    const parameterLine = accumulatedLines[0].split(' ').map(Number);
    const totalElements = parameterLine[0]; 
    const targetValue = parameterLine[1];   

    const numericalCollection = accumulatedLines[1].split(' ').map(Number).sort((valA, valB) => valA - valB);

    const targetIsPresent = numericalCollection.includes(targetValue);

    if (targetIsPresent) {
        process.stdout.write("POSSIBLE\n");
        return;
    }

    const primaryElement = numericalCollection[0];

    const hasAnyNonMultiple = numericalCollection.slice(1).some(element => element % primaryElement !== 0);

    const hasAnyExceedingTarget = numericalCollection.some(element => element > targetValue);

    if (hasAnyNonMultiple && hasAnyExceedingTarget) {
        process.stdout.write("POSSIBLE\n");
    } else {
        process.stdout.write("IMPOSSIBLE\n");
    }
});