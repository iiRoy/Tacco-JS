let inputLines = [];

const readlineModule = require('readline');

const inputProcessor = readlineModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputProcessor.on('line', function (currentInputLine) {
    inputLines.push(currentInputLine);
});

inputProcessor.on('close', function () {
    const numberOfElements = Number(inputLines[0]);
    let numericSequence = inputLines[1].split(" ").map(itemString => Number(itemString));

    numericSequence.unshift(0);
    numericSequence.push(0);

    let totalPathCost = 0;
    for (let currentPosition = 1; currentPosition < numberOfElements + 2; currentPosition++) {
        totalPathCost += Math.abs(numericSequence[currentPosition] - numericSequence[currentPosition - 1]);
    }

    for (let targetIndex = 1; targetIndex < numberOfElements + 1; targetIndex++) {
        const modifiedPathCost = totalPathCost - (Math.abs(numericSequence[targetIndex] - numericSequence[targetIndex - 1]) + Math.abs(numericSequence[targetIndex + 1] - numericSequence[targetIndex])) + Math.abs(numericSequence[targetIndex - 1] - numericSequence[targetIndex + 1]);
        console.log(modifiedPathCost);
    }
});
