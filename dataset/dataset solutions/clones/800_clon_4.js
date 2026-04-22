const outputResult = console.log;
const rdl = require('readline');

let capturedInput = [];
const inputReader = rdl.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

inputReader.on('line', (row) => {
    capturedInput.push(row);
});

inputReader.on('close', () => {
    initiateProcessing(capturedInput);
});

function initiateProcessing(dataRows) {
    let currentDataIndex = 0;

    const processNextChunk = () => {
        if (currentDataIndex >= dataRows.length) {
            return;
        }

        const headerRowContent = dataRows[currentDataIndex].split(' ').map(Number);
        currentDataIndex++;

        const currentN = headerRowContent[0];
        const currentM = headerRowContent[1];

        if (currentN === 0 && currentM === 0) {
            return;
        }

        const historicalValues = dataRows.slice(currentDataIndex, currentDataIndex + currentN).map(Number);
        currentDataIndex += currentN;

        const weightValues = dataRows.slice(currentDataIndex, currentDataIndex + currentM).map(Number);
        currentDataIndex += currentM;

        computeIntersection(historicalValues, weightValues);
        processNextChunk();
    };

    processNextChunk();
}

function computeIntersection(firstSet, secondSet) {
    const firstFrequencies = sumFrequencyCounter(firstSet);
    const secondFrequencies = sumFrequencyCounter(secondSet);
    outputResult(commonProductSum(firstFrequencies, secondFrequencies));
}

function sumFrequencyCounter(collection) {
    const sumCounts = new Map();

    collection.forEach((_, startIndex) => {
        let currentSegmentSum = 0;
        for (let endIndex = startIndex; endIndex >= 0; endIndex--) {
            currentSegmentSum += collection[endIndex];
            sumCounts.set(currentSegmentSum, (sumCounts.get(currentSegmentSum) || 0) + 1);
        }
    });
    return sumCounts;
}

function commonProductSum(mapA, mapB) {
    let aggregate = 0;
    for (const [keyVal, freqA] of mapA.entries()) {
        if (mapB.has(keyVal)) {
            const freqB = mapB.get(keyVal);
            aggregate += freqA * freqB;
        }
    }
    return aggregate;
}