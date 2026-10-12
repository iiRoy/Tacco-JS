const inputReader = require('readline');
const inputBuffer = [];

const interfaceHandler = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandler.on('line', (currentLine) => {
    inputBuffer.push(currentLine);
});

interfaceHandler.on('close', () => {
    const [rawCounts, rawPositions] = inputBuffer;

    const [segmentCount, pointCount] = rawCounts.split(" ").map(Number);

    const sortedPositions = rawPositions.split(" ").map(Number).sort((a, b) => a - b);

    const differenceValues = sortedPositions.slice(1).map((currentPosition, index) => {
        return currentPosition - sortedPositions[index];
    });

    differenceValues.sort((a, b) => a - b);

    const numDifferencesToSum = pointCount - segmentCount;

    const totalDistance = differenceValues.slice(0, numDifferencesToSum).reduce((accumulator, value) => accumulator + value, 0);

    console.log(totalDistance);
});
