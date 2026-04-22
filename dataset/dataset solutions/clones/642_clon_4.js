const sourceContent = require('fs').readFileSync(0, 'utf8');
const textLines = sourceContent.trim().split('\n');

const gridDimensions = textLines.shift().split(' ').map(Number);
const totalRows = gridDimensions[0];
const totalColumns = gridDimensions[1];

const colorIdentifierMap = { 'W': 0, 'B': 1, 'R': 2 };

const rowConversionCosts = textLines.map(lineValue => {
    const colorCounts = [0, 0, 0]; // Counts for 0, 1, 2
    for (let charPos = 0; charPos < totalColumns; charPos++) {
        colorCounts[colorIdentifierMap[lineValue[charPos]]]++;
    }
    // Calculate cost to make this row entirely white (0), blue (1), or red (2)
    return [
        totalColumns - colorCounts[0], // Cost for white
        totalColumns - colorCounts[1], // Cost for blue
        totalColumns - colorCounts[2]  // Cost for red
    ];
});

const accumulatedRowCosts = [];
for (let rowIdx = 0; rowIdx < totalRows; rowIdx++) {
    accumulatedRowCosts[rowIdx] = [0, 0, 0];
    if (rowIdx > 0) {
        accumulatedRowCosts[rowIdx][0] = accumulatedRowCosts[rowIdx - 1][0];
        accumulatedRowCosts[rowIdx][1] = accumulatedRowCosts[rowIdx - 1][1];
        accumulatedRowCosts[rowIdx][2] = accumulatedRowCosts[rowIdx - 1][2];
    }
    accumulatedRowCosts[rowIdx][0] += rowConversionCosts[rowIdx][0];
    accumulatedRowCosts[rowIdx][1] += rowConversionCosts[rowIdx][1];
    accumulatedRowCosts[rowIdx][2] += rowConversionCosts[rowIdx][2];
}

const obtainRangeSum = (beginIdx, endIdx, desiredColor) => {
    let sumValue = accumulatedRowCosts[endIdx][desiredColor];
    if (beginIdx > 0) {
        sumValue -= accumulatedRowCosts[beginIdx - 1][desiredColor];
    }
    return sumValue;
};

let minimumOverallCost = Number.MAX_SAFE_INTEGER;

if (totalRows === 3) {
    // Special case for 3 rows: 0=White, 1=Blue, 2=Red
    minimumOverallCost = rowConversionCosts[0][0] + rowConversionCosts[1][1] + rowConversionCosts[2][2];
}

// Loop through all possible split points for the three color sections
// 'endOfWhiteIdx' defines the last row index for the white section (0 to endOfWhiteIdx)
// 'endOfBlueIdx' defines the last row index for the blue section (endOfWhiteIdx to endOfBlueIdx - 1)
// The red section then covers (endOfBlueIdx to totalRows - 2)
// Note: This logic directly mirrors the original code's interpretation of split points and ranges,
// including its specific handling of `j` in the red section calculation.
for (let endOfWhiteIdx = 1; endOfWhiteIdx < totalRows - 2; endOfWhiteIdx++) {
    for (let endOfBlueIdx = endOfWhiteIdx + 1; endOfBlueIdx < totalRows - 1; endOfBlueIdx++) {
        let currentConfigurationCost = 0;

        // Cost for the white section: rows 0 to endOfWhiteIdx
        currentConfigurationCost += obtainRangeSum(0, endOfWhiteIdx, 0);

        // Cost for the blue section: rows endOfWhiteIdx to endOfBlueIdx - 1
        currentConfigurationCost += obtainRangeSum(endOfWhiteIdx, endOfBlueIdx - 1, 1);

        // Cost for the red section: rows endOfBlueIdx to totalRows - 2
        // This is based on the original code's `while (b != n - 1)` loop,
        // which iterated up to `n-2` (inclusive) for the red section.
        currentConfigurationCost += obtainRangeSum(endOfBlueIdx, totalRows - 2, 2);

        minimumOverallCost = Math.min(minimumOverallCost, currentConfigurationCost);
    }
}

console.log(minimumOverallCost);