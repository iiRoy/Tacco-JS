const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\r?\n/);

const configParts = inputLines.shift().split(' ');

const gridHeight = Number(configParts[0]);
const gridWidth = Number(configParts[1]);
const numIgnoredPoints = parseInt(configParts[2], 10);

const finalGridOutput = [];

let currentRegionIdentifier = 1;

let previousFilledRowData = null;

for (let rowIterator = 0; rowIterator < gridHeight; rowIterator++) {
    const markerPositionsInCurrentRow = [];
    finalGridOutput[rowIterator] = [];

    for (let columnIterator = 0; columnIterator < gridWidth; columnIterator++) {
        if (inputLines[rowIterator][columnIterator] === '#') {
            markerPositionsInCurrentRow.push(columnIterator);
        }
    }

    if (markerPositionsInCurrentRow.length === 0) {
        if (previousFilledRowData !== null) {
            finalGridOutput[rowIterator] = previousFilledRowData;
        } else {
            finalGridOutput[rowIterator] = 'empty_row_placeholder';
        }
    } else {
        let currentColumnAssignment = 0;

        while (true) {
            const nextMarkerPosition = markerPositionsInCurrentRow.shift();
            if (nextMarkerPosition === undefined) {
                break;
            }

            while (currentColumnAssignment <= nextMarkerPosition) {
                finalGridOutput[rowIterator][currentColumnAssignment] = currentRegionIdentifier;
                currentColumnAssignment++;
            }
            currentRegionIdentifier++;
        }

        while (currentColumnAssignment < gridWidth) {
            finalGridOutput[rowIterator][currentColumnAssignment] = currentRegionIdentifier - 1;
            currentColumnAssignment++;
        }
        previousFilledRowData = finalGridOutput[rowIterator];
    }
}

if (finalGridOutput[0] === 'empty_row_placeholder') {
    let firstActualRowIndex = 1;

    while (finalGridOutput[firstActualRowIndex] === 'empty_row_placeholder') {
        firstActualRowIndex++;
    }

    previousFilledRowData = finalGridOutput[firstActualRowIndex];
    firstActualRowIndex--;

    while (firstActualRowIndex >= 0) {
        finalGridOutput[firstActualRowIndex--] = previousFilledRowData;
    }
}

console.log(
    finalGridOutput
        .map(rowContent => rowContent.join(" "))
        .join('\n')
);