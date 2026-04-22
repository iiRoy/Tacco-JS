const inputHandler = require('readline');
const collectedLines = [];

const streamProcessor = inputHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

streamProcessor.on('line', (contentLine) => {
    collectedLines.push(contentLine);
});

streamProcessor.on('close', () => {
    const [headerData, pointData] = collectedLines;

    const [requiredSegments, totalPoints] = headerData.split(' ').map(Number);
    const initialCoordinates = pointData.split(' ').map(Number);

    const sortedCoordinates = initialCoordinates.slice().sort((valA, valB) => valA - valB);

    const gapLengths = sortedCoordinates.slice(1).map((currentCoord, index) => {
        const previousCoord = sortedCoordinates[index];
        return currentCoord - previousCoord;
    });

    const orderedGapLengths = gapLengths.sort((valA, valB) => valA - valB);

    const segmentsToInclude = totalPoints - requiredSegments;

    const finalAccumulation = orderedGapLengths
        .slice(0, segmentsToInclude)
        .reduce((summation, length) => summation + length, 0);

    console.log(finalAccumulation);
});