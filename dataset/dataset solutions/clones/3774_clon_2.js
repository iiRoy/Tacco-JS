'use strict';
function ProcessData(rawData) {
    // Split the raw input string by any whitespace characters to get individual values.
    let processedValues = rawData.split(/\s+/);

    // Convert all string values in the array to integers.
    for (let idx = 0; idx < processedValues.length; idx++) {
        processedValues[idx] = parseInt(processedValues[idx]);
    }

    // Extract the grid dimension (N) and the number of available colors (C).
    let gridDimension = processedValues.shift();
    let colorCount = processedValues.shift();

    // Initialize a 2D array to store the discomfort matrix (D).
    // D[i][j] represents the penalty for changing color i to color j.
    let discomfortMatrix = [];
    for (let rowIdx = 0; rowIdx < colorCount; rowIdx++) {
        discomfortMatrix[rowIdx] = [];
        for (let colIdx = 0; colIdx < colorCount; colIdx++) {
            discomfortMatrix[rowIdx][colIdx] = processedValues[colorCount * rowIdx + colIdx];
        }
    }

    // Initialize a 2D array to store the actual colors of the grid tiles.
    // The colors are adjusted to be 0-indexed.
    let actualGridColors = [];
    for (let gridRow = 0; gridRow < gridDimension; gridRow++) {
        actualGridColors[gridRow] = [];
        for (let gridCol = 0; gridCol < gridDimension; gridCol++) {
            actualGridColors[gridRow][gridCol] = processedValues[colorCount * colorCount + gridDimension * gridRow + gridCol] - 1;
        }
    }

    // Create three groups based on (row + column) % 3.
    // Each group will contain the colors of the tiles belonging to that group.
    let colorGroups = [[], [], []];
    for (let r = 0; r < gridDimension; r++) {
        for (let col_val = 0; col_val < gridDimension; col_val++) {
            colorGroups[(r + col_val) % 3].push(actualGridColors[r][col_val]);
        }
    }

    // Calculate the total discomfort for each group to be colored with a specific target color.
    // totalDiscomforts[group_idx][target_color_idx] holds the sum of penalties for a group to adopt a specific hue.
    let totalDiscomforts = [[], [], []];
    for (let gIdx = 0; gIdx < 3; gIdx++) {
        for (let targetColor = 0; targetColor < colorCount; targetColor++) {
            totalDiscomforts[gIdx][targetColor] = 0;
            for (let tileIndex = 0; tileIndex < colorGroups[gIdx].length; tileIndex++) {
                totalDiscomforts[gIdx][targetColor] += discomfortMatrix[colorGroups[gIdx][tileIndex]][targetColor];
            }
        }
    }

    // Find the top 3 best colors and their scores for each of the three groups.
    // topColorsPerGroup[group_idx][rank] stores the identifier of the optimal shade for a group.
    let topColorsPerGroup = [[], [], []];
    // topScoresPerGroup[group_idx][rank] stores the penalty value associated with the optimal hue.
    let topScoresPerGroup = [[], [], []];

    for (let groupIndex = 0; groupIndex < 3; groupIndex++) {
        for (let rankIndex = 0; rankIndex < 3; rankIndex++) {
            // Find the minimum score for the current group.
            topScoresPerGroup[groupIndex][rankIndex] = Math.min.apply(null, totalDiscomforts[groupIndex]);
            // Find the index (color) corresponding to this minimum score.
            topColorsPerGroup[groupIndex][rankIndex] = totalDiscomforts[groupIndex].indexOf(topScoresPerGroup[groupIndex][rankIndex]);
            // Set the chosen color's score to Infinity to prevent re-selection in subsequent ranks.
            totalDiscomforts[groupIndex][topColorsPerGroup[groupIndex][rankIndex]] = Infinity;
        }
    }

    // Explore all combinations of the top 3 colors for each group to find the overall minimum discomfort.
    let potentialSolutions = [];
    let currentCombinationScore = [];
    let currentCombinationColors = [];

    for (let firstGroupChoice = 0; firstGroupChoice < 3; firstGroupChoice++) {
        currentCombinationColors[0] = topColorsPerGroup[0][firstGroupChoice];
        currentCombinationScore[0] = topScoresPerGroup[0][firstGroupChoice];

        for (let secondGroupChoice = 0; secondGroupChoice < 3; secondGroupChoice++) {
            currentCombinationColors[1] = topColorsPerGroup[1][secondGroupChoice];

            // Ensure distinct colors for group 0 and group 1.
            if (currentCombinationColors[0] === currentCombinationColors[1]) continue;

            currentCombinationScore[1] = topScoresPerGroup[1][secondGroupChoice];

            for (let thirdGroupChoice = 0; thirdGroupChoice < 3; thirdGroupChoice++) {
                currentCombinationColors[2] = topColorsPerGroup[2][thirdGroupChoice];

                // Ensure distinct colors for all three groups.
                if (currentCombinationColors[0] === currentCombinationColors[2] || currentCombinationColors[1] === currentCombinationColors[2]) continue;

                currentCombinationScore[2] = topScoresPerGroup[2][thirdGroupChoice];
                // Add the total score of this valid color combination to potential solutions.
                potentialSolutions.push(currentCombinationScore[0] + currentCombinationScore[1] + currentCombinationScore[2]);
            }
        }
    }

    // Find the absolute minimum discomfort among all valid combinations.
    let overallMinimum = Math.min.apply(null, potentialSolutions);
    console.log(overallMinimum);
}

// Node.js specific code to read from standard input.
let fileSystemModule = require('fs');
let inputDataString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
ProcessData(inputDataString);