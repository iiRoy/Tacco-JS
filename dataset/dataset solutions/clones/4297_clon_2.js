// This module provides a specialized function for processing and transforming a grid represented as text.
// It aims to analyze each cell within the grid, particularly for "empty" cells,
// and compute the count of "occupied" neighbors within a 3x3 area surrounding them.

const OCCUPIED_CELL_SYMBOL = '#'; // Denotes a cell that is considered "occupied" or a "wall".
const NEWLINE_DELIMITER = '\n';    // The character used to separate lines in the input and output.
const INITIAL_LINE_SKIP = 1;       // Specifies how many initial lines of the input should be ignored.
const ZERO_COUNT_VALUE = 0;        // A constant representing a zero count, used in various calculations.

/**
 * Executes a transformation on an input string that represents a grid.
 * For every non-occupied cell, it calculates the number of adjacent occupied cells
 * in its immediate 3x3 neighborhood (including the cell itself if it were counted, but it's not here).
 *
 * @param {string} initialTextData - The raw string data, expected to be composed of lines separated by newlines.
 * @returns {string} A newly generated string that reflects the transformed grid state.
 */
const processGridData = initialTextData =>
  initialTextData
    .split(NEWLINE_DELIMITER) // Deconstruct the entire input string into an array of individual line strings.
    .slice(INITIAL_LINE_SKIP) // Remove the first line of the array, as it's typically ignored.
    .filter(lineContent => lineContent.length > ZERO_COUNT_VALUE) // Filter out any lines that are effectively empty strings.
    .map(gridRowText => gridRowText.split('')) // Convert each valid line string into an array of its constituent characters (cells).
    .map((currentCellsArray, currentLineIndex, entireGridMap) => // Iterate through each row (array of characters) in the grid.
      currentCellsArray.map((cellCharacter, cellColumnIndex) => { // Iterate through each character (cell) within the current row.
        if (cellCharacter === OCCUPIED_CELL_SYMBOL) {
          return OCCUPIED_CELL_SYMBOL; // If the current cell is an 'occupied' symbol, preserve its state.
        } else {
          // For cells that are not occupied, we compute the count of occupied neighbors.
          // This involves examining the 3x3 area centered around the current cell.
          const candidateRowIndices = [currentLineIndex - 1, currentLineIndex, currentLineIndex + 1];
          const totalOccupiedNeighbors = candidateRowIndices
            .filter(adjRowIndex => // Ensure the neighbor row index is within the valid bounds of the grid.
              adjRowIndex >= ZERO_COUNT_VALUE && adjRowIndex < entireGridMap.length
            )
            .map(adjRowIndex => { // For each valid neighboring row index...
              const adjacentRow = entireGridMap[adjRowIndex];
              const candidateColIndices = [cellColumnIndex - 1, cellColumnIndex, cellColumnIndex + 1];
              return candidateColIndices
                .filter(adjColIndex => // Ensure the neighbor column index is within the valid bounds of the adjacent row.
                  adjColIndex >= ZERO_COUNT_VALUE && adjColIndex < adjacentRow.length
                )
                .map(adjColIndex => // Determine if the neighboring cell is occupied.
                  adjacentRow[adjColIndex] === OCCUPIED_CELL_SYMBOL ? 1 : ZERO_COUNT_VALUE
                )
                .reduce((rowNeighborSum, cellStateValue) => rowNeighborSum + cellStateValue, ZERO_COUNT_VALUE); // Sum up occupied cells in this specific neighbor row segment.
            })
            .reduce((overallTotal, rowSum) => overallTotal + rowSum, ZERO_COUNT_VALUE); // Sum up all occupied counts from the valid neighbor rows.
          return totalOccupiedNeighbors; // Return the final count of occupied neighbors for the current cell.
        }
      }).join('') // Concatenate the processed characters of the current row back into a single string.
    )
    .join(NEWLINE_DELIMITER); // Combine all processed row strings into a single output string, separated by newlines.

// --- Program Entry Point ---

// Obtain the Node.js 'fs' (file system) module for file operations.
const fileSystemUtility = require('fs');

// Define the standard input file path for reading data.
const standardInputPath = '/dev/stdin';

// Specify the character encoding to be used when reading the file.
const inputEncodingScheme = 'utf8';

// Synchronously read the entire content of the standard input file.
const rawGridInputContent = fileSystemUtility.readFileSync(standardInputPath, inputEncodingScheme);

// Apply our grid processing function to the raw input data.
const resultantProcessedGrid = processGridData(rawGridInputContent);

// Output the final transformed grid string to the console.
console.log(resultantProcessedGrid);