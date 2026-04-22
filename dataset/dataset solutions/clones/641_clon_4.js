const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineFragments = dataSource.trim().split('\n');
const dimensions = lineFragments.shift().split(' ').map(Number);
const totalRows = dimensions[0];
const rowLength = dimensions[1];

const charToColorIndex = { 'W': 0, 'B': 1, 'R': 2 };

const colorMismatchQuantities = lineFragments.map( (line) => {
    const rowColorCounts = [0, 0, 0];
    for (const character of line) {
        rowColorCounts[charToColorIndex[character]]++;
    }
    return [
        rowLength - rowColorCounts[0],
        rowLength - rowColorCounts[1],
        rowLength - rowColorCounts[2]
    ];
});

const cumulativeSums = [[], [], []];

for (let r = 0; r < totalRows; r++) {
    cumulativeSums[0][r] = (r > 0 ? cumulativeSums[0][r-1] : 0) + colorMismatchQuantities[r][0];
    cumulativeSums[1][r] = (r > 0 ? cumulativeSums[1][r-1] : 0) + colorMismatchQuantities[r][1];
    cumulativeSums[2][r] = (r > 0 ? cumulativeSums[2][r-1] : 0) + colorMismatchQuantities[r][2];
}

const retrieveCumulativeSum = (colorIndex, rowIndex) => {
    if (rowIndex < 0) {
        return 0;
    }
    return cumulativeSums[colorIndex][rowIndex];
};

let lowestChangeCount = rowLength * totalRows;

for (let topDivisor = 1; topDivisor <= totalRows - 3; topDivisor++) {
    for (let middleDivisor = topDivisor + 1; middleDivisor <= totalRows - 2; middleDivisor++) {
        let currentChangeCount = 0;

        currentChangeCount += retrieveCumulativeSum(0, topDivisor);

        currentChangeCount += retrieveCumulativeSum(1, middleDivisor - 1) - retrieveCumulativeSum(1, topDivisor - 1);

        currentChangeCount += retrieveCumulativeSum(2, totalRows - 2) - retrieveCumulativeSum(2, middleDivisor - 1);

        lowestChangeCount = Math.min(lowestChangeCount, currentChangeCount);
    }
}

console.log(lowestChangeCount);