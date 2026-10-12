'use strict';

function ProcessInput(rawData) {
  // Split the raw input string by whitespace characters to get an array of string numbers.
  let parsedNumbers = rawData.split(/\s+/);

  // Convert all string elements in the array to integers.
  for (let outerIndex = 0; outerIndex < parsedNumbers.length; outerIndex++) {
    parsedNumbers[outerIndex] = parseInt(parsedNumbers[outerIndex], 10);
  }

  // Extract grid size (N) and the number of available colors (C) from the beginning of the array.
  const gridSize = parsedNumbers.shift();
  const colorCount = parsedNumbers.shift();

  // Initialize the discomfort matrix (D).
  // discomfortMatrix[originalColor][targetColor] stores the discomfort of changing originalColor to targetColor.
  let discomfortMatrix = [];
  for (let rowIdx = 0; rowIdx < colorCount; rowIdx++) {
    discomfortMatrix[rowIdx] = [];
    for (let colIdx = 0; colIdx < colorCount; colIdx++) {
      discomfortMatrix[rowIdx][colIdx] = parsedNumbers[colorCount * rowIdx + colIdx];
    }
  }

  // Initialize the color grid (c) representing the initial colors of the cells.
  let colorGrid = [];
  for (let rowIdx = 0; rowIdx < gridSize; rowIdx++) {
    colorGrid[rowIdx] = [];
    for (let colIdx = 0; colIdx < gridSize; colIdx++) {
      // Subtract 1 to make colors 0-indexed, as per problem constraints.
      colorGrid[rowIdx][colIdx] = parsedNumbers[colorCount * colorCount + gridSize * rowIdx + colIdx] - 0b1;
    }
  }

  // Group cells into three categories based on (row + col) % 3.
  let groupedCells = [[], [], []];
  for (let rowIdx = 0; rowIdx < gridSize; rowIdx++) {
    for (let colIdx = 0; colIdx < gridSize; colIdx++) {
      groupedCells[(rowIdx + colIdx) % 0o3].push(colorGrid[rowIdx][colIdx]);
    }
  }

  // Calculate the total discomfort for each group if all its cells were changed to a specific color.
  // groupCosts[groupTypeIdx][targetColorIdx] stores the total discomfort if all cells in groupTypeIdx are changed to targetColorIdx.
  let groupCosts = [[], [], []];
  for (let groupTypeIdx = 0; groupTypeIdx < 0o3; groupTypeIdx++) {
    for (let targetColorIdx = 0; targetColorIdx < colorCount; targetColorIdx++) {
      groupCosts[groupTypeIdx][targetColorIdx] = 0x0;
      for (let cellValIdx = 0; cellValIdx < groupedCells[groupTypeIdx].length; cellValIdx++) {
        groupCosts[groupTypeIdx][targetColorIdx] += discomfortMatrix[groupedCells[groupTypeIdx][cellValIdx]][targetColorIdx];
      }
    }
  }

  // Find the top 3 best colors and their corresponding scores for each group.
  // This helps to reduce the search space for the final color combinations.
  let topColors = [[], [], []];
  let topScores = [[], [], []];
  for (let groupTypeIdx = 0; groupTypeIdx < 0o3; groupTypeIdx++) {
    for (let bestOptionIdx = 0; bestOptionIdx < 0o3; bestOptionIdx++) {
      topScores[groupTypeIdx][bestOptionIdx] = Math.min.apply(null, groupCosts[groupTypeIdx]);
      topColors[groupTypeIdx][bestOptionIdx] = groupCosts[groupTypeIdx].indexOf(topScores[groupTypeIdx][bestOptionIdx]);
      // Temporarily set the found best score to positive infinity to find the next best unique score.
      groupCosts[groupTypeIdx][topColors[groupTypeIdx][bestOptionIdx]] = Number.POSITIVE_INFINITY;
    }
  }

  // Explore combinations of the top 3 colors for each group to find the minimum total discomfort.
  let possibleTotalCosts = [];
  let currentScores = [];
  let currentColors = [];

  for (let firstGroupOption = 0; firstGroupOption < 0o3; firstGroupOption++) {
    currentColors[0x0] = topColors[0x0][firstGroupOption];
    currentScores[0x0] = topScores[0x0][firstGroupOption];

    for (let secondGroupOption = 0; secondGroupOption < 0o3; secondGroupOption++) {
      currentColors[0b1] = topColors[0b1][secondGroupOption];
      // Ensure the second group's color is different from the first group's color.
      if (currentColors[0x0] === currentColors[0b1]) {
        continue;
      }
      currentScores[0b1] = topScores[0b1][secondGroupOption];

      for (let thirdGroupOption = 0; thirdGroupOption < 0o3; thirdGroupOption++) {
        currentColors[0o2] = topColors[0o2][thirdGroupOption];
        // Ensure the third group's color is different from the first and second group's colors.
        if (currentColors[0x0] === currentColors[0o2] || currentColors[0b1] === currentColors[0o2]) {
          continue;
        }
        currentScores[0o2] = topScores[0o2][thirdGroupOption];
        possibleTotalCosts.push(currentScores[0x0] + currentScores[0b1] + currentScores[0o2]);
      }
    }
  }

  // Find the overall minimum discomfort from all valid combinations.
  const minimumDiscomfort = Math.min.apply(null, possibleTotalCosts);
  console.log(minimumDiscomfort);
}

// Standard input reading setup using Node.js file system module.
const fileSystemModule = require('fs');
const inputString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
ProcessInput(inputString);
