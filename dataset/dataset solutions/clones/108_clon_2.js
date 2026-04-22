/* This module handles file operations for reading standard input. */
var fileSystemUtil = require('fs');
// Determine the total byte size of the standard input stream
var streamContentSize = fileSystemUtil.fstatSync(process.stdin.fd).size;
// Allocate a memory block to hold the input data
var dataMemoryBlock = Buffer.alloc(streamContentSize);
// Read the input stream into the allocated buffer
var actualBytesRead = fileSystemUtil.readSync(process.stdin.fd, dataMemoryBlock, 0, streamContentSize, 0);
// Convert buffer to string using ASCII and split into an array of lines
var parsedInputLines = dataMemoryBlock.toString('ascii', 0, actualBytesRead).split('\n');

// Initiate the primary processing routine
processInputData();

/**
 * Main function to process the collected input.
 */
function processInputData() {
  // Create a local copy of the input lines for manipulation.
  var currentInputSet = parsedInputLines;

  /*
   * Initialize a 14x14 grid with zeros.
   * This grid will store impact values based on input coordinates.
   */
  var impactGrid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

  // Get the number of relevant input entries.
  var numEntries = currentInputSet.length - 1;

  // Iterate backwards through each input entry.
  for (; numEntries--;) {
    var entryData = currentInputSet[numEntries]; // Current line being processed.

    // Parse X and Y coordinates from the entry, adding an offset.
    var xCoordinate = Number.parseInt(entryData[0]) + 2;
    var yCoordinate = Number.parseInt(entryData[2]) + 2;

    // Apply different impact patterns based on a specific character in the entry.
    switch (entryData[4]) {
      case '3':
        // Case '3': Applies a wide impact pattern (no break, falls through).
        impactGrid[yCoordinate + 2][xCoordinate]++;
        impactGrid[yCoordinate - 2][xCoordinate]++;
        impactGrid[yCoordinate][xCoordinate - 2]++;
        impactGrid[yCoordinate][xCoordinate + 2]++;
      case '2':
        // Case '2': Applies a diagonal impact pattern (no break, falls through).
        impactGrid[yCoordinate + 1][xCoordinate - 1]++;
        impactGrid[yCoordinate + 1][xCoordinate + 1]++;
        impactGrid[yCoordinate - 1][xCoordinate - 1]++;
        impactGrid[yCoordinate - 1][xCoordinate + 1]++;
      case '1':
        // Case '1': Applies a cross-shaped impact pattern and then breaks.
        impactGrid[yCoordinate + 1][xCoordinate]++;
        impactGrid[yCoordinate][xCoordinate - 1]++;
        impactGrid[yCoordinate][xCoordinate]++;
        impactGrid[yCoordinate][xCoordinate + 1]++;
        impactGrid[yCoordinate - 1][xCoordinate]++;
        break; // Exit switch after this case.
    }
  }

  // Variables to track unaffected cells and the highest impact value.
  var unaffectedCellCount = 0; // Cells with zero impact.
  var highestImpactValue = 0; // Maximum impact value found in the grid.

  // Iterate through a 10x10 sub-grid of the impactGrid.
  var rowIterator = 10;
  for (; rowIterator--;) {
    var colIterator = 10;
    for (; colIterator--;) {
      // Increment unaffectedCellCount if the current cell has no impact.
      unaffectedCellCount += !(impactGrid[rowIterator + 2][colIterator + 2]);
      // Update highestImpactValue using the helper function.
      highestImpactValue = calculateMaximum(impactGrid[rowIterator + 2][colIterator + 2], highestImpactValue);
    }
  }

  // Output the total count of unaffected cells.
  console.log(unaffectedCellCount);
  // Output the highest impact value recorded.
  console.log(highestImpactValue);
}

/**
 * A bitwise function to determine the maximum of two numbers without
 * using traditional comparison operators.
 * @param {number} value1 - The first numerical value.
 * @param {number} value2 - The second numerical value.
 * @returns {number} The greater of the two input values.
 */
function calculateMaximum(value1, value2) {
  return value1 - ((value1 - value2) & ((value1 - value2) >> 31));
}