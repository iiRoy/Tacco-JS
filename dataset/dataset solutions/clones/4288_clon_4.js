const inputSystem = require('readline').createInterface({
    input: process.stdin
});

let recordedLines = [];

inputSystem.on('line', (incomingLine) => {
    recordedLines.push(incomingLine);
});

inputSystem.on('close', () => {
    executeLogic(recordedLines);
});

function calculateSeriesResult(numericValues) {
    const totalCount = numericValues.length;
    let runningTotal = 0;

    for (let currentPosition = totalCount - 1; currentPosition >= 0; currentPosition--) {
        const remainingSegmentLength = totalCount - 1 - currentPosition;
        const powerOfThreeComponent = Math.pow(3, remainingSegmentLength);

        let currentElementContribution;
        if (numericValues[currentPosition] % 2 === 0) {
            currentElementContribution = powerOfThreeComponent + 2 * runningTotal;
        } else {
            currentElementContribution = 2 * powerOfThreeComponent + runningTotal;
        }
        runningTotal = currentElementContribution;
    }
    return runningTotal;
}

function executeLogic(allInputLines) {
    const elementQuantity = parseInt(allInputLines[0], 10);
    const valueSet = allInputLines[1].split(' ').map(item => parseInt(item, 10));

    const finalOutputValue = calculateSeriesResult(valueSet);
    console.log(finalOutputValue);
}