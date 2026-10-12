function ProcessGridData(rawData) {
  // Split the raw input string into individual lines for processing.
  let processedLines = rawData.split('\n');

  // Parse grid dimensions (height and width) from the first line of input.
  const gridDimensions = processedLines[0].split(' ');
  let gridHeight = parseInt(gridDimensions[0], 10); // Explicitly use base 10 for parsing.
  let gridWidth = parseInt(gridDimensions[1], 10);

  // Remove the dimension line from the array of processed input lines.
  processedLines.shift();

  // Convert the remaining lines into a 2D array of characters, representing the grid cells.
  let gridCells = processedLines.map(lineContent => lineContent.split(''));

  // Trim any excess rows from the grid if the input contains more than specified by gridHeight.
  gridCells.splice(gridHeight, gridCells.length - gridHeight);

  // Initialize two dynamic programming tables.
  // 'horizontalLengths' will store the length of continuous '.' cells horizontally.
  // 'verticalLengths' will store the length of continuous '.' cells vertically.
  let horizontalLengths = new Array(gridHeight);
  let verticalLengths = new Array(gridHeight);

  // Populate the DP tables with initial values. Each cell starts with a length of 1 if it's a '.'
  // (representing itself), or 0 if it's a '#'. The actual calculation will refine this.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    let tempRowHoriz = new Array(gridWidth).fill(1); // Default length for a single cell.
    let tempRowVert = new Array(gridWidth).fill(1);
    horizontalLengths[rowIdx] = tempRowHoriz;
    verticalLengths[rowIdx] = tempRowVert;
  }

  // First pass: Calculate horizontal continuous '.' lengths from left to right.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      if (colIdx === 0) { // For the first column in each row.
        if (gridCells[rowIdx][colIdx] === '#') {
          horizontalLengths[rowIdx][colIdx] = 0; // A '#' blocks light, so length is zero.
        }
        // If it's '.', it retains its initial value of 1.
      } else { // For subsequent columns.
        if (gridCells[rowIdx][colIdx] === '.') {
          // If the current cell is '.', its horizontal length is 1 plus the length of the cell to its left.
          horizontalLengths[rowIdx][colIdx] = horizontalLengths[rowIdx][colIdx - 1] + 1;
        } else {
          horizontalLengths[rowIdx][colIdx] = 0; // A '#' resets the continuous length.
        }
      }
    }
  }

  // Second pass: Propagate maximum horizontal lengths from right to left.
  // This ensures that every '.' cell within a continuous horizontal segment holds the total length of that segment.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (let colIdx = gridWidth - 2; colIdx >= 0; colIdx--) { // Iterate from the second-to-last column backwards.
      if (gridCells[rowIdx][colIdx] === '.') {
        // If the cell to the right is part of a continuous segment (length > 0),
        // then the current cell's length should be updated to match the cell to its right.
        if (horizontalLengths[rowIdx][colIdx + 1] !== 0) {
          horizontalLengths[rowIdx][colIdx] = horizontalLengths[rowIdx][colIdx + 1];
        }
      }
    }
  }

  // Third pass: Calculate vertical continuous '.' lengths from top to bottom.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      if (rowIdx === 0) { // For the first row in each column.
        if (gridCells[rowIdx][colIdx] === '#') {
          verticalLengths[rowIdx][colIdx] = 0; // Blocked.
        }
        // If it's '.', it retains its initial value of 1.
      } else { // For subsequent rows.
        if (gridCells[rowIdx][colIdx] === '.') {
          // If the current cell is '.', its vertical length is 1 plus the length of the cell above it.
          verticalLengths[rowIdx][colIdx] = verticalLengths[rowIdx - 1][colIdx] + 1;
        } else {
          verticalLengths[rowIdx][colIdx] = 0; // Blocked, reset length.
        }
      }
    }
  }

  // Fourth pass: Propagate maximum vertical lengths from bottom to top.
  // Similar to horizontal propagation, this ensures each '.' cell within a vertical segment
  // holds the total length of that segment.
  for (let rowIdx = gridHeight - 2; rowIdx >= 0; rowIdx--) { // Iterate from the second-to-last row upwards.
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      if (gridCells[rowIdx][colIdx] === '.') {
        // If the cell below is part of a continuous segment,
        // then the current cell's length should be updated to match the cell below it.
        if (verticalLengths[rowIdx + 1][colIdx] !== 0) {
          verticalLengths[rowIdx][colIdx] = verticalLengths[rowIdx + 1][colIdx];
        }
      }
    }
  }

  let maxIlluminatedCells = 0; // Initialize the maximum count of illuminated cells found.

  // Final pass: Calculate the total illuminated cells for each '.' cell and find the overall maximum.
  // For each '.' cell, the total illuminated cells are (horizontal length + vertical length - 1)
  // because the current cell itself is counted in both the horizontal and vertical lengths.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      maxIlluminatedCells = Math.max(maxIlluminatedCells, horizontalLengths[rowIdx][colIdx] + verticalLengths[rowIdx][colIdx] - 1);
    }
  }

  // Output the final result to the standard console.
  console.log('%s', maxIlluminatedCells);
  return maxIlluminatedCells; // Return the computed maximum value.
}

// This function is intended for testing within a specific HTML environment,
// comparing computed results against expected outputs from DOM elements.
function testSolution(testCaseNum) {
  // Retrieve input data from a DOM element identified by its ID.
  const testInputData = document.getElementById('input' + testCaseNum).value;

  // Execute the main processing logic with the retrieved test input.
  const computedAnswer = ProcessGridData(testInputData);

  let testOutcome = 'WA'; // Default outcome: Wrong Answer.

  // Compare the computed answer with the expected output from another DOM element.
  // The expected output is parsed as an integer from the first line of the element's value.
  if (computedAnswer === parseInt(document.getElementById('output' + testCaseNum).value.split('\n')[0], 10)) {
    testOutcome = 'AC'; // If they match, the outcome is Correct Answer.
  }

  // Display the test outcome in a designated DOM element.
  document.getElementById('result' + testCaseNum).innerHTML = testOutcome;
}

// Entry point for execution when run in a Node.js-like environment.
// Reads input from standard input (typically a file) and passes it to the main processing function.
ProcessGridData(require('fs').readFileSync('/dev/stdin', 'utf8'));
