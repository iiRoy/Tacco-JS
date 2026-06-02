const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericStrings = fileContent.match(/\d+/g);
const parsedNumbers = numericStrings.map(Number);

const [boardHeight, boardWidth, ...rawCoordinates] = parsedNumbers;

const { coordinatePairs, coordinatePresence } = rawCoordinates.reduce(
    (accumulator, value, index, array) => {
        if (index % 2 === 0) {
            const rowValue = value;
            const columnValue = array[index + 1];
            accumulator.coordinatePairs.push([rowValue, columnValue]);
            accumulator.coordinatePresence.add(`${rowValue}-${columnValue}`);
        }
        return accumulator;
    },
    { coordinatePairs: [], coordinatePresence: new Set() }
);

const rowFrequencies = new Map();
const colFrequencies = new Map();

for (let i = 1; i <= boardHeight; i++) {
    rowFrequencies.set(i, 0);
}
for (let i = 1; i <= boardWidth; i++) {
    colFrequencies.set(i, 0);
}

coordinatePairs.forEach(([rCoord, cCoord]) => {
    rowFrequencies.set(rCoord, rowFrequencies.get(rCoord) + 1);
    colFrequencies.set(cCoord, colFrequencies.get(cCoord) + 1);
});

const maxRowCount = Math.max(...rowFrequencies.values());
const maxColCount = Math.max(...colFrequencies.values());

const maxRowIndices = Array.from(rowFrequencies.entries())
    .filter(([, count]) => count === maxRowCount)
    .map(([index,]) => index);

const maxColIndices = Array.from(colFrequencies.entries())
    .filter(([, count]) => count === maxColCount)
    .map(([index,]) => index);

const hasUnoccupiedIntersection = maxRowIndices.some(rIndex =>
    maxColIndices.some(cIndex => !coordinatePresence.has(`${rIndex}-${cIndex}`))
);

if (hasUnoccupiedIntersection) {
    console.log(maxRowCount + maxColCount);
} else {
    console.log(maxRowCount + maxColCount - 1);
}
