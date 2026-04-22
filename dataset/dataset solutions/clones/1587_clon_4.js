const readSource = require('node:fs').readFileSync;

const rawData = readSource('/dev/stdin', 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const numRows = rawData[0];
const numCols = rawData[1];

const coordinateTuples = Array.from({ length: (rawData.length - 2) / 2 }, (_, index) => [
    rawData[2 + index * 2],
    rawData[3 + index * 2]
]);

const rowTallies = new Map();
const colTallies = new Map();

coordinateTuples.forEach(tuple => {
    rowTallies.set(tuple[0], (rowTallies.get(tuple[0]) || 0) + 1);
    colTallies.set(tuple[1], (colTallies.get(tuple[1]) || 0) + 1);
});

const peakRowCount = Math.max(0, ...Array.from(rowTallies.values()));
const peakColCount = Math.max(0, ...Array.from(colTallies.values()));

const optimalRows = Array.from(rowTallies.keys()).filter(rIdx => rowTallies.get(rIdx) === peakRowCount);
const optimalCols = Array.from(colTallies.keys()).filter(cIdx => colTallies.get(cIdx) === peakColCount);

const presentCoordinates = new Set(coordinateTuples.map(tuple => tuple.join(',')));

const allIntersectionsPopulated = optimalRows.every(rVal =>
    optimalCols.every(cVal =>
        presentCoordinates.has(`${rVal},${cVal}`)
    )
);

if (!allIntersectionsPopulated) {
    process.stdout.write((peakRowCount + peakColCount).toString());
} else {
    process.stdout.write((peakRowCount + peakColCount - 1).toString());
}