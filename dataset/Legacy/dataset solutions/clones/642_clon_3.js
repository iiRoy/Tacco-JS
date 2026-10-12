const fileSystem = require('fs');

// Define constants for color codes to improve readability and maintainability.
const WHITE_COLOR_CODE = '0';
const BLUE_COLOR_CODE = '1';
const RED_COLOR_CODE = '2';

// Helper function to process the raw input string into an array of lines.
const processRawInput = (rawText) => {
    let cleanedText = rawText.trim();
    // Replace color characters with their numeric codes.
    cleanedText = cleanedText.replace(/W/g, WHITE_COLOR_CODE);
    cleanedText = cleanedText.replace(/B/g, BLUE_COLOR_CODE);
    cleanedText = cleanedText.replace(/R/g, RED_COLOR_CODE);
    return cleanedText.split("\n");
};

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let processedInputLines = processRawInput(rawInputData);

// Extract dimensions (N and M) from the first line.
const dimensionLine = processedInputLines.shift();
const [numRows, numCols] = dimensionLine.split(" ").map(Number);

// Helper function to calculate the cost to make a single row entirely of a specific color.
// Returns an array [cost_to_make_white, cost_to_make_blue, cost_to_make_red].
const calculateRowTransformationCosts = (rowString, totalColumns) => {
    const transformationCosts = [totalColumns, totalColumns, totalColumns]; // Initialize with max possible changes
    for (let charIdx = 0; charIdx < totalColumns; charIdx++) {
        const currentColorChar = rowString[charIdx];
        // Decrement the cost for the color that is already present.
        // This effectively calculates (totalColumns - count_of_currentColorChar).
        transformationCosts[parseInt(currentColorChar)]--;
    }
    return transformationCosts;
};

// Map each processed row string to its array of transformation costs.
const rowColorTransformationCosts = processedInputLines.map(rowStr =>
    calculateRowTransformationCosts(rowStr, numCols)
);

// Initialize the minimum cost found so far.
// The original code uses 2500 as an initial large value.
const INITIAL_MINIMUM_COST_VALUE = 2500;
let overallMinimumCost = INITIAL_MINIMUM_COST_VALUE;

// Handle the special case where N (numRows) is 3.
// In this specific case, the cost is fixed: row 0 all White, row 1 all Blue, row 2 all Red.
if (numRows === 3) {
    overallMinimumCost =
        rowColorTransformationCosts[0][0] + // Cost to make row 0 white
        rowColorTransformationCosts[1][1] + // Cost to make row 1 blue
        rowColorTransformationCosts[2][2];  // Cost to make row 2 red
}

// Helper function to sum costs for a contiguous segment of rows for a target color.
// The `endIndex` is exclusive, meaning rows from `startIndex` up to `endIndex - 1`.
const sumSegmentCosts = (startIndex, endIndex, targetColorIndex, costsMatrix) => {
    let segmentTotal = 0;
    for (let k = startIndex; k < endIndex; k++) {
        segmentTotal += costsMatrix[k][targetColorIndex];
    }
    return segmentTotal;
};

// Iterate through all possible split points for the White, Blue, and Red sections.
// `whiteSectionEndRow` (original `i`): The last row index for the white section.
// `blueSectionEndRow` (original `j`): The last row index for the blue section.
// Note: The original code's loop bounds and segment definitions are preserved for exact behavior.
// White section: rows 0 to `whiteSectionEndRow`.
// Blue section: rows `whiteSectionEndRow` to `blueSectionEndRow - 1`.
// Red section: rows `blueSectionEndRow` to `numRows - 1`.
for (let whiteSectionEndRow = 1; whiteSectionEndRow < numRows - 2; whiteSectionEndRow++) {
    let lastInnerLoopCost = 0; // This variable captures the 'cost' from the last 'j' iteration, replicating original bug.

    for (let blueSectionEndRow = whiteSectionEndRow + 1; blueSectionEndRow < numRows - 1; blueSectionEndRow++) {
        let currentIterationCost = 0;

        // Calculate cost for the White section (rows 0 to whiteSectionEndRow)
        currentIterationCost += sumSegmentCosts(0, whiteSectionEndRow + 1, 0, rowColorTransformationCosts);

        // Calculate cost for the Blue section (rows whiteSectionEndRow to blueSectionEndRow - 1)
        currentIterationCost += sumSegmentCosts(whiteSectionEndRow, blueSectionEndRow, 1, rowColorTransformationCosts);

        // Calculate cost for the Red section (rows blueSectionEndRow to numRows - 1)
        currentIterationCost += sumSegmentCosts(blueSectionEndRow, numRows, 2, rowColorTransformationCosts);

        lastInnerLoopCost = currentIterationCost; // Store the cost for the current (i, j) pair.
    }
    // This update is outside the inner loop, meaning `overallMinimumCost` is compared
    // only with the `lastInnerLoopCost` (which is the cost from the last `blueSectionEndRow` iteration for the current `whiteSectionEndRow`).
    // This behavior is intentionally preserved from the original code.
    overallMinimumCost = Math.min(overallMinimumCost, lastInnerLoopCost);
}

// Output the final minimum cost.
console.log(overallMinimumCost);
