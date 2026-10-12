const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawData = fileContent
    .split(/\n| /)
    .slice(0, -1)
    .map(val => parseInt(val, 10));

const [gridHeight, gridWidth, ...rawCoordsList] = rawData;

const coordinatePairs = [];
for (let coordIdx = 1; coordIdx < rawCoordsList.length; coordIdx += 2) {
    const firstCoordValue = rawCoordsList[coordIdx];
    const secondCoordValue = rawCoordsList[coordIdx + 1];
    coordinatePairs.push([firstCoordValue, secondCoordValue]);
}

const rowCounts = Array.from({ length: gridHeight }, () => 0);
const colCounts = Array.from({ length: gridWidth }, () => 0);

for (const pair of coordinatePairs) {
    const targetRowIndex = pair[0] - 1;
    const targetColIndex = pair[1] - 1;
    rowCounts[targetRowIndex]++;
    colCounts[targetColIndex]++;
}

const maxRowCount = Math.max(...rowCounts);
const maxRowIndices = [];
rowCounts.forEach((count, idx) => {
    if (count === maxRowCount) {
        maxRowIndices.push(idx);
    }
});

const maxColCount = Math.max(...colCounts);
const maxColIndices = [];
colCounts.forEach((count, idx) => {
    if (count === maxColCount) {
        maxColIndices.push(idx);
    }
});

const isCoordinatePairPresent = (r, c, existingPairs) => {
    for (let k = 0; k < existingPairs.length; k++) {
        const currentPair = existingPairs[k];
        if (currentPair[0] === r && currentPair[1] === c) {
            return true;
        }
    }
    return false;
};

let optimalCellFoundAndPrinted = false;

for (const currentRowIdx of maxRowIndices) {
    for (const currentColIdx of maxColIndices) {
        const oneIndexedRow = currentRowIdx + 1;
        const oneIndexedCol = currentColIdx + 1;

        if (!isCoordinatePairPresent(oneIndexedRow, oneIndexedCol, coordinatePairs)) {
            console.log(maxRowCount + maxColCount);
            optimalCellFoundAndPrinted = true;
            break;
        }
    }
    if (optimalCellFoundAndPrinted) {
        break;
    }
}

if (!optimalCellFoundAndPrinted) {
    console.log(maxRowCount + maxColCount - 1);
}
