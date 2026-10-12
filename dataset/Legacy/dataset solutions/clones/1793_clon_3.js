process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputLines = [];
const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputReader.on('line', (lineContent) => {
    inputLines.push(lineContent);
});

function determineElementValue(targetIndex, sourceArray, arrayLength) {
    let matchingCount = 0;
    for (let sourceIndex = 0; sourceIndex < arrayLength; sourceIndex++) {
        const absoluteDifference = Math.abs(targetIndex - sourceIndex);
        if (sourceArray[sourceIndex] >= absoluteDifference) {
            matchingCount++;
        }
    }
    return matchingCount;
}

inputReader.on('close', () => {
    const firstLineData = inputLines[0].split(" ");
    let arraySize = Number(firstLineData[0]);
    let numIterations = Number(firstLineData[1]);
    let currentValues = inputLines[1].split(" ").map(Number);

    for (let iterIdx = 0; iterIdx < numIterations; iterIdx++) {
        let nextValues = new Array(arraySize);
        for (let targetIdx = 0; targetIdx < arraySize; targetIdx++) {
            nextValues[targetIdx] = determineElementValue(targetIdx, currentValues, arraySize);
        }
        currentValues = nextValues.slice();
    }

    const finalOutputElements = currentValues.slice(0, 5);
    console.log(finalOutputElements.join(' '));
});
