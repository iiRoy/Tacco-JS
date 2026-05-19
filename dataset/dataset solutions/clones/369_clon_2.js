function FindDuplicates(inputArray) {
  // Initialize an array to count occurrences of numbers 0-9.
  // Assuming numbers are single digits as per original logic (v-0).
  let occurrenceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Populate occurrence counts for each number in the input array.
  inputArray.forEach(function(currentValue) {
    occurrenceCounts[+currentValue]++;
  });

  // Identify numbers that appear two or more times.
  let duplicateValues = [];
  occurrenceCounts.forEach(function(count, index) {
    if (count >= 2) {
      duplicateValues.push(index);
    }
  });

  // Collect the indices of elements in the original array that are duplicates.
  let duplicateIndices = [];
  inputArray.forEach(function(elementValue, elementIndex) {
    if (duplicateValues.indexOf(elementValue) !== -1) {
      duplicateIndices.push(elementIndex);
    }
  });

  return duplicateIndices;
}

// Read input from standard input.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into lines and remove leading/trailing whitespace.
let lines = rawData.trim().split("\n");

// Get the number of test cases.
let testCaseCount = Number(lines.shift());

// Process each test case.
for (let caseIterator = 0; caseIterator < testCaseCount; caseIterator++) {
  // Initialize arrays to store the Sudoku grid data and error markers.
  let gridData = [];
  let errorMarkers = [];

  // Read the 9x9 Sudoku grid for the current test case.
  for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
    let rowString = lines.shift().split(" ").map(Number);
    gridData.push(rowString);
    // Initialize error marker grid with zeros.
    errorMarkers.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }

  // Check for duplicates in each row.
  for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
    let duplicatePositions = FindDuplicates(gridData[rowIdx]);
    duplicatePositions.forEach(function(pos) {
      errorMarkers[rowIdx][pos]++;
    });
  }

  // Check for duplicates in each column.
  for (let colIdx = 0; colIdx < 9; colIdx++) {
    let columnValues = [];
    for (let colElementIdx = 0; colElementIdx < 9; colElementIdx++) {
      columnValues.push(gridData[colElementIdx][colIdx]);
    }
    let duplicatePositions = FindDuplicates(columnValues);
    duplicatePositions.forEach(function(pos) {
      errorMarkers[pos][colIdx]++;
    });
  }

  // Check for duplicates in each 3x3 subgrid.
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      let startRow = blockRow * 3;
      let startCol = blockCol * 3;

      // Define coordinates for the current 3x3 block.
      let blockCoordinates = [
        [startRow + 0, startCol + 0], [startRow + 0, startCol + 1], [startRow + 0, startCol + 2],
        [startRow + 1, startCol + 0], [startRow + 1, startCol + 1], [startRow + 1, startCol + 2],
        [startRow + 2, startCol + 0], [startRow + 2, startCol + 1], [startRow + 2, startCol + 2]
      ];

      // Extract values from the current 3x3 block.
      let blockValues = [];
      blockCoordinates.forEach(function(coordPair) {
        blockValues.push(gridData[coordPair[0]][coordPair[1]]);
      });

      // Find duplicate positions within the block.
      let duplicatePositions = FindDuplicates(blockValues);
      duplicatePositions.forEach(function(pos) {
        // Mark the corresponding cell in the error marker grid.
        errorMarkers[blockCoordinates[pos][0]][blockCoordinates[pos][1]]++;
      });
    }
  }

  // Format the output grid: mark cells with errors with an asterisk.
  gridData.forEach(function(rowArray, rowIndex) {
    rowArray.forEach(function(cellValue, colIndex) {
      gridData[rowIndex][colIndex] = (errorMarkers[rowIndex][colIndex] > 0) ? "*" + cellValue : " " + cellValue;
    });
  });

  // Print the formatted grid, joining rows with newlines and removing commas.
  console.log(gridData.join("\n").replace(/,/g, ""));
}
