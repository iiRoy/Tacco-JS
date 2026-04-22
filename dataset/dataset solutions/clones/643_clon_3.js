const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

// Helper function to process raw input content
const processRawInput = (inputContent) => {
    // Remove leading/trailing whitespace, then replace color characters with numeric codes.
    // 'W' (White) maps to '0', 'B' (Blue) maps to '1', 'R' (Red) maps to '2'.
    // Finally, divide the string into individual lines based on newline characters.
    const formattedLines = inputContent
        .trim()
        .replace(/W/g, "0")
        .replace(/B/g, "1")
        .replace(/R/g, "2")
        .split("\n");
    return formattedLines;
};

// Retrieve and prepare the input data
let gridDataRows = processRawInput(fileSystemModule.readFileSync(standardInputPath, 'utf8'));

// Parse the grid dimensions from the first line of input
const dimensionLine = gridDataRows.shift();
const [totalGridRows, totalGridColumns] = dimensionLine.split(" ").map(numericString => parseInt(numericString, 10));

// Defensive check for minimum rows needed for a 3-stripe flag
if (totalGridRows < 3) {
    // If fewer than 3 rows, a valid WBR flag cannot be formed.
    // The cost would typically be 0 if no changes are made, or an indicator of impossibility.
    // To align with the original logic's implicit handling (which would result in `overallMinimumCost`
    // remaining its initial high value if loops don't execute or conditions aren't met),
    // we'll proceed, and the loops will naturally not find any valid configurations.
}

// Function to compute the cost to make a single row a uniform color.
// The cost is the number of cells in that row that are *not* the target color.
const calculateSingleRowColorCosts = (rowContent, columnCount) => {
    const colorCountsInRow = { '0': 0, '1': 0, '2': 0 };

    // Count occurrences of each color (0, 1, 2) in the current row.
    for (let charPos = 0; charPos < columnCount; charPos++) {
        const colorDigit = rowContent[charPos];
        if (colorCountsInRow.hasOwnProperty(colorDigit)) {
            colorCountsInRow[colorDigit]++;
        }
    }

    // Return an array where:
    // [0] = cost to make this row entirely White (0)
    // [1] = cost to make this row entirely Blue (1)
    // [2] = cost to make this row entirely Red (2)
    return [
        columnCount - colorCountsInRow['0'],
        columnCount - colorCountsInRow['1'],
        columnCount - colorCountsInRow['2']
    ];
};

// Pre-calculate the cost arrays for each row.
// `perRowColorChangeCosts[k]` will contain `[cost_to_make_row_k_white, cost_to_make_row_k_blue, cost_to_make_row_k_red]`
const perRowColorChangeCosts = gridDataRows.map(rowLine =>
    calculateSingleRowColorCosts(rowLine, totalGridColumns)
);

// Initialize the overall minimum cost to a value guaranteed to be higher than any possible valid cost.
// The maximum possible cost would be if every cell in the grid needs changing: totalGridRows * totalGridColumns.
let overallMinimumCost = (totalGridRows * totalGridColumns) + 1; // A sentinel value

// Iterate through all possible ways to divide the flag into three distinct horizontal stripes: White, Blue, Red.
// 'whiteEndRowExclusive' denotes the row index *after* the white stripe ends (and where the blue stripe begins).
// It must be at least 1 (to have a white stripe) and at most `totalGridRows - 2` (to allow for blue and red stripes below).
for (let whiteEndRowExclusive = 1; whiteEndRowExclusive <= totalGridRows - 2; whiteEndRowExclusive++) {

    // 'blueEndRowExclusive' denotes the row index *after* the blue stripe ends (and where the red stripe begins).
    // It must be at least `whiteEndRowExclusive + 1` (to have a blue stripe) and at most `totalGridRows - 1` (to allow for a red stripe below).
    for (let blueEndRowExclusive = whiteEndRowExclusive + 1; blueEndRowExclusive <= totalGridRows - 1; blueEndRowExclusive++) {

        let currentFlagConfigurationCost = 0; // Accumulator for the current stripe setup

        // Calculate cost for the White stripe (from row 0 up to whiteEndRowExclusive - 1)
        for (let rowIdx = 0; rowIdx < whiteEndRowExclusive; rowIdx++) {
            currentFlagConfigurationCost += perRowColorChangeCosts[rowIdx][0]; // Cost to make this row white
        }

        // Calculate cost for the Blue stripe (from row whiteEndRowExclusive up to blueEndRowExclusive - 1)
        for (let rowIdx = whiteEndRowExclusive; rowIdx < blueEndRowExclusive; rowIdx++) {
            currentFlagConfigurationCost += perRowColorChangeCosts[rowIdx][1]; // Cost to make this row blue
        }

        // Calculate cost for the Red stripe (from row blueEndRowExclusive up to totalGridRows - 1)
        for (let rowIdx = blueEndRowExclusive; rowIdx < totalGridRows; rowIdx++) {
            currentFlagConfigurationCost += perRowColorChangeCosts[rowIdx][2]; // Cost to make this row red
        }

        // Update the global minimum cost if this configuration is more efficient.
        overallMinimumCost = Math.min(overallMinimumCost, currentFlagConfigurationCost);
    }
}

// Display the final computed minimum cost.
console.log(overallMinimumCost);