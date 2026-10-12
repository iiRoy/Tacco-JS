const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const colorMapping = { 'W': '0', 'B': '1', 'R': '2' };
const processedLines = rawData.trim().split('\n').map(line =>
    Array.from(line).map(char => colorMapping[char] || char).join('')
);

const dimensions = processedLines.shift().split(' ').map(Number);
const rowCount = dimensions[0];
const colCount = dimensions[1];

const rowColorCosts = processedLines.map(lineContent => {
    const colorCounts = Array(3).fill(0);
    for (const charCode of lineContent) {
        colorCounts[parseInt(charCode, 10)]++;
    }
    return colorCounts.map(count => colCount - count);
});

const cumulativeCosts = Array(3).fill(null).map(() => Array(rowCount + 1).fill(0));

for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    for (let colorIndex = 0; colorIndex < 3; colorIndex++) {
        cumulativeCosts[colorIndex][rowIndex + 1] = cumulativeCosts[colorIndex][rowIndex] + rowColorCosts[rowIndex][colorIndex];
    }
}

let minimumTotalCost = Infinity;

for (let firstSplit = 1; firstSplit < rowCount - 1; firstSplit++) {
    for (let secondSplit = firstSplit + 1; secondSplit < rowCount; secondSplit++) {
        const costForWhiteSection = cumulativeCosts[0][firstSplit];
        const costForBlueSection = cumulativeCosts[1][secondSplit] - cumulativeCosts[1][firstSplit];
        const costForRedSection = cumulativeCosts[2][rowCount] - cumulativeCosts[2][secondSplit];

        const currentPartitionCost = costForWhiteSection + costForBlueSection + costForRedSection;
        minimumTotalCost = Math.min(minimumTotalCost, currentPartitionCost);
    }
}

console.log(minimumTotalCost);
