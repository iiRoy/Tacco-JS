const fs = require('fs');

const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputData
    .trim()
    .replace(/W/g, "0")
    .replace(/B/g, "1")
    .replace(/R/g, "2")
    .split("\n");

const [totalRows, totalCols] = processedLines.shift().split(" ").map(Number);

const rowTransformationCosts = processedLines.map(rowString => {
    const colorCounts = [totalCols, totalCols, totalCols];
    for (let charIndex = 0; charIndex < totalCols; charIndex++) {
        colorCounts[parseInt(rowString[charIndex], 10)]--;
    }
    return colorCounts;
});

const cumulativeWhiteCosts = new Array(totalRows);
const cumulativeBlueCosts = new Array(totalRows);
const cumulativeRedCosts = new Array(totalRows);

for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    cumulativeWhiteCosts[rowIndex] = (rowIndex > 0 ? cumulativeWhiteCosts[rowIndex - 1] : 0) + rowTransformationCosts[rowIndex][0];
    cumulativeBlueCosts[rowIndex] = (rowIndex > 0 ? cumulativeBlueCosts[rowIndex - 1] : 0) + rowTransformationCosts[rowIndex][1];
    cumulativeRedCosts[rowIndex] = (rowIndex > 0 ? cumulativeRedCosts[rowIndex - 1] : 0) + rowTransformationCosts[rowIndex][2];
}

let overallMinimumFlips = 2500;

if (totalRows === 3) {
    overallMinimumFlips = rowTransformationCosts[0][0] + rowTransformationCosts[1][1] + rowTransformationCosts[2][2];
}

for (let blueSectionStartRow = 1; blueSectionStartRow < totalRows - 2; blueSectionStartRow++) {
    for (let redSectionStartRow = blueSectionStartRow + 1; redSectionStartRow < totalRows - 1; redSectionStartRow++) {
        let currentConfigurationFlips = 0;

        // Cost for White section (rows 0 to blueSectionStartRow inclusive)
        currentConfigurationFlips += cumulativeWhiteCosts[blueSectionStartRow];

        // Cost for Blue section (rows blueSectionStartRow to redSectionStartRow - 1 inclusive)
        currentConfigurationFlips += cumulativeBlueCosts[redSectionStartRow - 1] -
                                     (blueSectionStartRow > 0 ? cumulativeBlueCosts[blueSectionStartRow - 1] : 0);

        // Cost for Red section (rows redSectionStartRow to totalRows - 2 inclusive)
        currentConfigurationFlips += cumulativeRedCosts[totalRows - 2] -
                                     (redSectionStartRow > 0 ? cumulativeRedCosts[redSectionStartRow - 1] : 0);

        overallMinimumFlips = Math.min(overallMinimumFlips, currentConfigurationFlips);
    }
}

console.log(overallMinimumFlips);
