function FindDuplicates(inputArray) {
  // Initialize an array to count occurrences of numbers 0-9.
  // The size is 10 to accommodate indices 0 through 9.
  let occurrenceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Iterate through each element in the provided array.
  inputArray.forEach(function (currentValue) {
    // Increment the counter for the current number.
    // Subtracting 0 ensures the value is treated as a number for indexing.
    occurrenceCounts[currentValue - 0]++;
  });

  // This array will store numbers that appear two or more times.
  const duplicateValues = [];

  // Check the occurrence counts.
  occurrenceCounts.forEach(function (count, indexPosition) {
    // If a number appears at least twice, add its value (index) to the 'bad' list.
    if (count >= 2) {
      duplicateValues.push(indexPosition);
    }
  });

  // This array will store the original indices of elements that are duplicates.
  const duplicateIndices = [];

  // Iterate through the original input array again.
  inputArray.forEach(function (currentValue, indexPosition) {
    // If the current value is found in the list of duplicate values,
    // add its original index to the result array.
    if (duplicateValues.indexOf(currentValue) !== -1) {
      duplicateIndices.push(indexPosition);
    }
  });

  // Return the indices of elements that are part of a duplicate set.
  return duplicateIndices;
}

// Use Node.js 'fs' module to read synchronous input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input into an array of lines, then remove any leading/trailing whitespace.
const lineSegments = rawData.trim().split("\n");

// Initialize a string buffer to accumulate the formatted output.
let outputBuffer = "";

// The first line of input indicates the number of test cases.
// Convert it to a number.
const testCaseCount = lineSegments.shift() - 0;

// Process each test case.
for (let caseIterator = 0; caseIterator < testCaseCount; caseIterator++) {
  // Initialize a 9x9 grid to store the actual numbers.
  const gridData = [];
  // Initialize a 9x9 grid to mark cells that contain errors (duplicates).
  // Each cell will store a count of how many rules it violates.
  const errorMarkers = [];

  // Read the 9x9 grid for the current test case.
  for (let rowIterator = 0; rowIterator < 9; rowIterator++) {
    // Read a line, split by space, and convert each part to a number.
    const parsedRow = lineSegments.shift().split(" ").map(Number);
    gridData.push(parsedRow);
    // Initialize the corresponding row in the error marker grid with zeros.
    errorMarkers.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }

  // Check for duplicates within each row.
  for (let rowIterator = 0; rowIterator < 9; rowIterator++) {
    // Find indices of duplicate numbers in the current row.
    const foundProblemIndices = FindDuplicates(gridData[rowIterator]);
    // For each problematic index, increment the error marker in the corresponding cell.
    foundProblemIndices.forEach(function (problematicIndex) {
      errorMarkers[rowIterator][problematicIndex]++;
    });
  }

  // Check for duplicates within each column.
  for (let colIterator = 0; colIterator < 9; colIterator++) {
    // Extract all numbers for the current column.
    const columnData = [];
    for (let rowIterator = 0; rowIterator < 9; rowIterator++) {
      columnData.push(gridData[rowIterator][colIterator]);
    }
    // Find indices of duplicate numbers in the current column.
    const foundProblemIndices = FindDuplicates(columnData);
    // For each problematic index, increment the error marker in the corresponding cell.
    // Note: 'problematicIndex' here refers to the row index within the column.
    foundProblemIndices.forEach(function (problematicIndex) {
      errorMarkers[problematicIndex][colIterator]++;
    });
  }

  // Check for duplicates within each 3x3 subgrid (block).
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      // Define the coordinates of cells within the current 3x3 block.
      const blockCoordinates = [
        [0 + blockRow * 3, 0 + blockCol * 3], [0 + blockRow * 3, 1 + blockCol * 3], [0 + blockRow * 3, 2 + blockCol * 3],
        [1 + blockRow * 3, 0 + blockCol * 3], [1 + blockRow * 3, 1 + blockCol * 3], [1 + blockRow * 3, 2 + blockCol * 3],
        [2 + blockRow * 3, 0 + blockCol * 3], [2 + blockRow * 3, 1 + blockCol * 3], [2 + blockRow * 3, 2 + blockCol * 3]
      ];
      // Extract the values from the grid for these coordinates.
      const blockValues = [];
      blockCoordinates.forEach(function (coords) {
        blockValues.push(gridData[coords[0]][coords[1]]);
      });
      // Find indices of duplicate numbers within this 3x3 block.
      const foundProblemIndices = FindDuplicates(blockValues);
      // For each problematic index (relative to the blockValues array),
      // increment the error marker at its actual grid coordinates.
      foundProblemIndices.forEach(function (problematicIndex) {
        errorMarkers[blockCoordinates[problematicIndex][0]][blockCoordinates[problematicIndex][1]]++;
      });
    }
  }

  // Format the grid for output based on error markers.
  gridData.forEach(function (currentRow, rowIndex) {
    currentRow.forEach(function (currentCellVal, cellColIndex) {
      // If a cell has an error marker (value >= 1), prepend a '*' to its number.
      // Otherwise, prepend a space.
      gridData[rowIndex][cellColIndex] = (errorMarkers[rowIndex][cellColIndex] >= 1) ? "*" + currentCellVal : " " + currentCellVal;
    });
  });

  // Join the rows of the formatted grid with newlines.
  // Then remove all commas (which are default array separators when joining).
  // Append two newlines to separate test case outputs.
  outputBuffer += gridData.join("\n").replace(/,/g, "") + "\n\n";
}

// Print the accumulated output, removing any trailing newlines from the last test case.
console.log(outputBuffer.trim());
