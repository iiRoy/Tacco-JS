const inputReader = require('readline');
const inputBuffer = [];

const interfaceHandler = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandler.on('line', function(currentLine) {
    inputBuffer.push(currentLine);
});

interfaceHandler.on('close', function() {
    const initialConfigLine = inputBuffer.shift();
    const configParts = initialConfigLine.split(" ");
    const numSegmentsToKeep = parseInt(configParts[0], 10);
    const totalPoints = parseInt(configParts[1], 10);
    let accumulatedSum = 0;

    const rawCoordsString = inputBuffer[0];
    const coordsStrArray = rawCoordsString.split(" ");
    const pointCoordinates = coordsStrArray.map(coordStr => parseInt(coordStr, 10));
    pointCoordinates.sort((valA, valB) => valA - valB);

    const calculatedDifferences = [];
    for (let k = 1; k < totalPoints; k++) {
        calculatedDifferences.push(pointCoordinates[k] - pointCoordinates[k - 1]);
    }
    const segmentLengthsWithZero = [0, ...calculatedDifferences];
    segmentLengthsWithZero.sort((valA, valB) => valA - valB);
        
    const loopLimit = segmentLengthsWithZero.length - (numSegmentsToKeep - 1);
    for (let k = 0; k < loopLimit; k++) {
        accumulatedSum += segmentLengthsWithZero[k];
    }

    console.log(accumulatedSum);
});
