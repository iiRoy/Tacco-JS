const inputSystem = require('readline');

const dataStream = inputSystem.createInterface({
    input: process.stdin
});

let collectedLines = [];

dataStream.on('line', (individualLine) => {
    collectedLines.push(individualLine);
});

dataStream.on('close', () => {
    performTransformation(collectedLines);
});

function performTransformation(entryLines) {
    const sequenceDimension = Number(entryLines[0]);
    const swapOperationCount = Number(entryLines[1]);

    const initialArrangement = Array.from({ length: sequenceDimension }, (_, i) => i + 1);

    const operations = entryLines
        .slice(2, 2 + swapOperationCount)
        .map(line => line.split(',').map(Number));

    const finalArrangement = operations.reduce((currentArrangementState, currentSwapPair) => {
        const [posA_oneIndexed, posB_oneIndexed] = currentSwapPair;
        const posA_zeroIndexed = posA_oneIndexed - 1;
        const posB_zeroIndexed = posB_oneIndexed - 1;

        const nextArrangementState = [...currentArrangementState]; 
        [nextArrangementState[posA_zeroIndexed], nextArrangementState[posB_zeroIndexed]] = 
        [nextArrangementState[posB_zeroIndexed], nextArrangementState[posA_zeroIndexed]];
        
        return nextArrangementState;
    }, initialArrangement);

    finalArrangement.forEach(elementValue => {
        console.info(elementValue);
    });
}