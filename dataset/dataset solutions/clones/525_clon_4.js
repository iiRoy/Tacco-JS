const stdioMechanism = require('node:fs');
const bufferCapacity = 1048576; // 1MB
const inputBuffer = Buffer.alloc(bufferCapacity);
const bytesAcquired = stdioMechanism.readSync(0, inputBuffer, 0, bufferCapacity, 0);
const rawTextContent = inputBuffer.toString('utf8', 0, bytesAcquired).trim();
const textLines = rawTextContent.split('\n');

const firstNumericLine = textLines.shift().split(' ').map(Number);
const upperBoundary = firstNumericLine[0] - 1;
const totalCountOfItems = firstNumericLine[1];
const designatedPoint = firstNumericLine[2];

let rawMeasurements = textLines.slice(0, totalCountOfItems).map(Number);
let filteredMeasurements = rawMeasurements.filter(val => val !== designatedPoint);
filteredMeasurements.push(designatedPoint);

const numericSorter = (numA, numB) => numA - numB;
let orderedMeasurements = filteredMeasurements.sort(numericSorter);

let potentialCostCollection = [];

orderedMeasurements.map((currentMeasure, currentIdx, fullSet) => {
    const setSize = fullSet.length;

    if (currentMeasure < designatedPoint) {
        const baseCost = (designatedPoint - currentMeasure) * 2 + (upperBoundary - designatedPoint + 1);
        potentialCostCollection.push(baseCost);
        if (currentIdx > 0) {
            potentialCostCollection.push(baseCost + fullSet[currentIdx - 1]);
        }
    } else if (designatedPoint === currentMeasure) {
        if (currentIdx === 0) {
            potentialCostCollection.push(fullSet[setSize - 1] - currentMeasure);
        }
        if (currentIdx === setSize - 1) {
            potentialCostCollection.push(currentMeasure - fullSet[0]);
        }
        if (currentIdx < setSize - 1) {
            potentialCostCollection.push(designatedPoint + upperBoundary - fullSet[currentIdx + 1] + 1);
        }
        if (currentIdx > 0) {
            potentialCostCollection.push(upperBoundary - designatedPoint + 1 + fullSet[currentIdx - 1]);
        }
    } else { // designatedPoint < currentMeasure
        const baseCost = (currentMeasure - designatedPoint) * 2 + designatedPoint;
        potentialCostCollection.push(baseCost);
        if (currentIdx < setSize - 1) {
            potentialCostCollection.push(baseCost + (upperBoundary - fullSet[currentIdx + 1] + 1));
        }
    }
});

const finalCalculatedValue = Math.min(...potentialCostCollection) * 100;
process.stdout.write(finalCalculatedValue + '\n');