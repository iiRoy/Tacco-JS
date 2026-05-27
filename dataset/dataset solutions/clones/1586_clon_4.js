const { format } = require('path');

const rawData = require('fs').readFileSync('./sample_e.txt', 'utf8')
    .split(/\n| /)
    .slice(0, -1);

const [rawHeight, rawWidth, ...rawCoords] = rawData;
const gridHeight = parseInt(rawHeight);
const gridWidth = parseInt(rawWidth);

const coordPairs = rawCoords.slice(1);

const rowTally = Array(gridHeight).fill(0);
const colTally = Array(gridWidth).fill(0);
const intersectionAdjustments = new Map();

for (let i = 0; i < coordPairs.length; i += 2) {
    const currentY = parseInt(coordPairs[i]);
    const currentX = parseInt(coordPairs[i + 1]);

    const targetRow = currentY - 1;
    const targetCol = currentX - 1;

    rowTally[targetRow]++;
    colTally[targetCol]++;

    const intersectionKey = `${targetRow},${targetCol}`;
    intersectionAdjustments.set(intersectionKey, (intersectionAdjustments.get(intersectionKey) || 0) + 1);
}

const resultGrid = Array.from({ length: gridHeight }, (_, rIdx) =>
    Array.from({ length: gridWidth }, (_, cIdx) => {
        const key = `${rIdx},${cIdx}`;
        return rowTally[rIdx] + colTally[cIdx] - (intersectionAdjustments.get(key) || 0);
    })
);

const peakValue = Math.max(...resultGrid.flat());

console.log(peakValue);
