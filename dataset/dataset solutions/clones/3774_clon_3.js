'use strict';

/**
 * Orchestrates the processing of grid configuration data to determine
 * the minimum total discomfort required to re-color the grid.
 *
 * The grid cells are categorized into three groups based on (row + column) % 3.
 * Each group must eventually have a single, uniform color.
 * The three groups must each have a distinct final color.
 * The goal is to find the set of three distinct colors (one for each group)
 * that minimizes the total discomfort incurred.
 *
 * @param {string} rawInputString - The complete input data received as a single string.
 */
function processGridDiscomfort(rawInputString) {
    // --- Input Parsing and Initial Data Extraction ---

    // Clean, split, and convert all input string parts to numbers.
    const parsedNumericalValues = rawInputString.trim().split(/\s+/).map(Number);

    // Validate initial input for grid dimensions and color count.
    if (parsedNumericalValues.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least grid dimensions (N) and color variety (C).");
        return;
    }

    // Extract grid dimension (N) and available color count (C).
    const gridDimension = parsedNumericalValues.shift(); // N
    const availableColorCount = parsedNumericalValues.shift(); // C

    // Perform basic validation on extracted dimensions.
    if (gridDimension <= 0 || availableColorCount <= 0) {
        console.error(`Error: Grid dimension (${gridDimension}) and color variety (${availableColorCount}) must be positive integers.`);
        return;
    }

    // Calculate expected number of remaining values for matrices.
    const expectedRemainingValues = (availableColorCount * availableColorCount) + (gridDimension * gridDimension);
    if (parsedNumericalValues.length < expectedRemainingValues) {
        console.error(`Error: Input data is incomplete. Expected ${expectedRemainingValues} values for matrices, but found ${parsedNumericalValues.length}.`);
        return;
    }

    // Construct the discomfort matrix (D).
    // discomfortMatrix[originalColor][targetColor] stores the cost of changing.
    const discomfortMatrix = [];
    for (let sourceColorIndex = 0; sourceColorIndex < availableColorCount; sourceColorIndex++) {
        discomfortMatrix[sourceColorIndex] = [];
        for (let destinationColorIndex = 0; destinationColorIndex < availableColorCount; destinationColorIndex++) {
            // Using .shift() to consume values sequentially, a structural change from direct indexing.
            discomfortMatrix[sourceColorIndex][destinationColorIndex] = parsedNumericalValues.shift();
        }
    }

    // Construct the initial grid color matrix (c).
    // initialGridColors[row][col] stores the initial color of a cell.
    const initialGridColors = [];
    for (let row = 0; row < gridDimension; row++) {
        initialGridColors[row] = [];
        for (let col = 0; col < gridDimension; col++) {
            // Subtract 1 to convert to 0-indexed colors, as per problem convention.
            initialGridColors[row][col] = parsedNumericalValues.shift() - 1;
        }
    }

    // --- Grouping Cells by (row + column) % 3 Modulo ---

    // Initialize an array of arrays to hold original colors for each of the 3 modulo groups.
    // E.g., cellModuloGroups[0] will contain all original colors for cells where (r+c)%3 == 0.
    const cellModuloGroups = Array.from({ length: 3 }, () => []);

    for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
        for (let colIndex = 0; colIndex < gridDimension; colIndex++) {
            const currentGroupIdentifier = (rowIndex + colIndex) % 3;
            const cellOriginalColor = initialGridColors[rowIndex][colIndex];
            cellModuloGroups[currentGroupIdentifier].push(cellOriginalColor);
        }
    }

    // --- Calculating Discomfort for Each Group to Each Possible Target Color ---

    // clusterDiscomfortTotals[groupId][targetColor] will store the sum of discomfort
    // if all cells in 'groupId' were changed to 'targetColor'.
    const clusterDiscomfortTotals = Array.from({ length: 3 }, () => Array(availableColorCount).fill(0));

    for (let groupId = 0; groupId < 3; groupId++) {
        for (let potentialTargetColor = 0; potentialTargetColor < availableColorCount; potentialTargetColor++) {
            let accumulatedGroupCost = 0; // Temporary variable for current calculation.
            for (const originalCellColor of cellModuloGroups[groupId]) {
                accumulatedGroupCost += discomfortMatrix[originalCellColor][potentialTargetColor];
            }
            clusterDiscomfortTotals[groupId][potentialTargetColor] = accumulatedGroupCost;
        }
    }

    // --- Identifying Top 3 Optimal Target Colors and Their Scores for Each Group ---

    // Arrays to store the top 3 lowest discomfort scores and corresponding colors for each group.
    const topScoresPerGroup = Array.from({ length: 3 }, () => []);
    const topColorsPerGroup = Array.from({ length: 3 }, () => []);

    /**
     * Helper function to find the top 'n' smallest values and their original indices from an array.
     * This is a new helper function, a Type III addition.
     * @param {number[]} valuesArray - The array of discomfort values for a single group.
     * @param {number} count - The number of top values to retrieve (e.g., 3).
     * @returns {Array<{value: number, index: number}>} An array of objects, sorted by value.
     */
    const findTopNLowest = (valuesArray, count) => {
        const indexedScores = valuesArray.map((val, idx) => ({ value: val, index: idx }));
        // Sort by value in ascending order to find the lowest.
        indexedScores.sort((a, b) => a.value - b.value);
        return indexedScores.slice(0, count);
    };

    for (let groupId = 0; groupId < 3; groupId++) {
        const topCandidatesForGroup = findTopNLowest(clusterDiscomfortTotals[groupId], 3);

        // Populate the top scores and colors, ensuring 3 entries even if fewer colors are available.
        for (let rank = 0; rank < 3; rank++) {
            if (rank < topCandidatesForGroup.length) {
                topScoresPerGroup[groupId][rank] = topCandidatesForGroup[rank].value;
                topColorsPerGroup[groupId][rank] = topCandidatesForGroup[rank].index;
            } else {
                // If fewer than 3 distinct colors are available, fill with a very high score and an invalid color.
                // This is a robustness addition.
                topScoresPerGroup[groupId][rank] = Infinity;
                topColorsPerGroup[groupId][rank] = -1; // -1 signifies an unavailable/invalid color choice.
            }
        }
    }

    // --- Exploring Combinations of Top Colors and Calculating Total Discomforts ---

    // This array will hold the total discomfort for each valid combination of distinct colors.
    const validCombinationDiscomforts = [];

    // Temporary storage for the current color choices and their scores for a combination.
    const currentCombinationColors = new Array(3);
    const currentCombinationScores = new Array(3);

    // Iterate through the top 3 color choices for the first group.
    for (let choiceIdxG0 = 0; choiceIdxG0 < 3; choiceIdxG0++) {
        currentCombinationColors[0] = topColorsPerGroup[0][choiceIdxG0];
        currentCombinationScores[0] = topScoresPerGroup[0][choiceIdxG0];

        // Iterate through the top 3 color choices for the second group.
        for (let choiceIdxG1 = 0; choiceIdxG1 < 3; choiceIdxG1++) {
            currentCombinationColors[1] = topColorsPerGroup[1][choiceIdxG1];

            // Guard clause: Ensure the first two chosen colors are distinct.
            if (currentCombinationColors[0] === currentCombinationColors[1]) {
                continue; // Skip this combination, as group colors must be unique.
            }
            currentCombinationScores[1] = topScoresPerGroup[1][choiceIdxG1];

            // Iterate through the top 3 color choices for the third group.
            for (let choiceIdxG2 = 0; choiceIdxG2 < 3; choiceIdxG2++) {
                currentCombinationColors[2] = topColorsPerGroup[2][choiceIdxG2];

                // Guard clause: Ensure the third chosen color is distinct from the first two.
                if (currentCombinationColors[0] === currentCombinationColors[2] ||
                    currentCombinationColors[1] === currentCombinationColors[2]) {
                    continue; // Skip this combination.
                }
                currentCombinationScores[2] = topScoresPerGroup[2][choiceIdxG2];

                // If all three colors are distinct, calculate the total discomfort for this combination.
                const currentTotalDiscomfort = currentCombinationScores[0] +
                                               currentCombinationScores[1] +
                                               currentCombinationScores[2];
                validCombinationDiscomforts.push(currentTotalDiscomfort);
            }
        }
    }

    // --- Determining the Overall Minimum Discomfort ---

    let overallMinimumDiscomfort = Infinity; // Initialize with a very large value.

    // Guard clause: Check if any valid combinations were found.
    if (validCombinationDiscomforts.length === 0) {
        console.error("Error: No valid distinct color combinations could be formed. This might indicate an issue with problem constraints or input data.");
        // Depending on problem, could output 0 or throw error. For competitive programming, usually a very large number.
        // For now, we'll exit, as per previous error handling.
        return;
    }

    // Iterate through the valid combinations to find the absolute minimum.
    // This is a structural change from using Math.min.apply.
    for (const discomfortValue of validCombinationDiscomforts) {
        if (discomfortValue < overallMinimumDiscomfort) {
            overallMinimumDiscomfort = discomfortValue;
        }
    }

    console.log(overallMinimumDiscomfort);
}

// --- Standard Input Handling ---
// Renamed 'fs' to 'fileSystemModule' and 'I' to 'standardInputContent'.
const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Invoke the main processing function with the collected input.
processGridDiscomfort(standardInputContent);