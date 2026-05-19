const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const colorMapping = { 'W': 0, 'B': 1, 'R': 2 };

const processedLines = fileContent.trim().split('\n');

const dimensionsArray = processedLines[0].split(' ').map(Number);
const totalRows = dimensionsArray[0];
const totalCols = dimensionsArray[1];

const rowChangeCosts = processedLines.slice(1).map(line => {
    const counts = [0, 0, 0];
    line.split('').forEach(char => {
        counts[colorMapping[char]]++;
    });
    return [
        totalCols - counts[0],
        totalCols - counts[1],
        totalCols - counts[2]
    ];
});

const prefixWhiteCosts = new Array(totalRows);
const prefixBlueCosts = new Array(totalRows);
const prefixRedCosts = new Array(totalRows);

prefixWhiteCosts[0] = rowChangeCosts[0][0];
prefixBlueCosts[0] = rowChangeCosts[0][1];
prefixRedCosts[0] = rowChangeCosts[0][2];

for (let k = 1; k < totalRows; k++) {
    prefixWhiteCosts[k] = prefixWhiteCosts[k - 1] + rowChangeCosts[k][0];
    prefixBlueCosts[k] = prefixBlueCosts[k - 1] + rowChangeCosts[k][1];
    prefixRedCosts[k] = prefixRedCosts[k - 1] + rowChangeCosts[k][2];
}

let minTotalChanges = 2500;

for (let wSplitPoint = 1; wSplitPoint < totalRows - 2; wSplitPoint++) {
    for (let bSplitPoint = wSplitPoint + 1; bSplitPoint < totalRows - 1; bSplitPoint++) {
        let currentTotalCost = 0;

        currentTotalCost += prefixWhiteCosts[wSplitPoint];

        currentTotalCost += prefixBlueCosts[bSplitPoint - 1] - prefixBlueCosts[wSplitPoint - 1];

        currentTotalCost += prefixRedCosts[totalRows - 2] - prefixRedCosts[bSplitPoint - 1];

        minTotalChanges = Math.min(minTotalChanges, currentTotalCost);
    }
}

console.log(minTotalChanges);
