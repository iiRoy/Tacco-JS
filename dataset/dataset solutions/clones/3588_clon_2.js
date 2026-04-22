'use strict';
/**
 * Orchestrates the processing of a raw text grid.
 * This function takes a multi-line string, converts it to a boolean matrix,
 * performs filtering operations, transposes the data, and finally renders
 * the processed grid into a displayable string format.
 * @param {string} rawGridString The initial text representation of the grid.
 */
function processGridData(rawGridString) {
  // First, break the incoming text into individual row strings.
  let gridRowsString = rawGridString.split('\n');

  // Discard the very first row, as it's often a header or empty line.
  gridRowsString.shift();

  // Initialize a structure to hold the grid data as boolean values.
  let booleanGridMatrix = [];

  // Iterate over each string row to convert character data into booleans.
  gridRowsString.forEach((singleRowString) => {
    // Split the current row string into its constituent characters.
    let rowCharacters = singleRowString.split('');

    // Transform each character into a boolean: '.' becomes true, anything else becomes false.
    let rowBooleans = rowCharacters.map((charElement) => {
      if (charElement === '.') {
        return true;
      } else {
        return false;
      }
    });

    // Append the newly formed boolean row to our matrix.
    booleanGridMatrix.push(rowBooleans);
  });

  // Apply the first filtering pass: remove rows where all elements are 'true'.
  // We're looking for rows that contain at least one 'false'.
  let filteredRowsInitial = booleanGridMatrix.filter((dataRow) => {
    return !dataRow.reduce((accumulator, currentValue) => {
      return (accumulator && currentValue);
    });
  });

  // Transpose the matrix to switch rows and columns for the next processing step.
  let transposedInitial = transposeMatrix(filteredRowsInitial);

  // Apply a second filtering pass on the transposed data.
  // This effectively filters out columns where all elements are 'true' in the original context.
  let filteredColumns = transposedInitial.filter((dataRow) => {
    return !dataRow.reduce((accumulator, currentValue) => {
      return (accumulator && currentValue);
    });
  });

  // Transpose back to the original orientation and then convert boolean values
  // into human-readable characters ('.' for true, '#' for false).
  let finalOutputGrid = renderGridPattern(transposeMatrix(filteredColumns));

  // Output the final processed grid to the console, joining rows with newlines.
  console.log(
    finalOutputGrid.map((outputLine) => {
      return outputLine.join('');
    }).join('\n')
  );
};

// Define a utility function to transpose a 2D array (matrix).
const transposeMatrix = (inputMatrix) => {
  // Map over the columns of the first row to create new rows.
  // This assumes the input matrix is not empty and its first row has elements.
  return inputMatrix[0].map((_, columnIndex) => {
    // For each column index, collect the element from that column across all original rows.
    return inputMatrix.map((rowData) => rowData[columnIndex]);
  });
};

/**
 * Converts a boolean matrix into a character-based grid pattern.
 * True values are represented by a '.', and false values by a '#'.
 * @param {Array<Array<boolean>>} booleanPatternMatrix The 2D array of boolean values.
 * @returns {Array<Array<string>>} A 2D array where booleans are replaced by '.' or '#'.
 */
const renderGridPattern = (booleanPatternMatrix) => {
  // Initialize a new matrix to store the character representation.
  let charPatternMatrix = booleanPatternMatrix.map((patternRow) => {
    // Map each boolean value in the row to its corresponding character.
    return patternRow.map((cellValue) => {
      if (cellValue) {
        return '.'; // Represent 'true' with a dot.
      } else {
        return '#'; // Represent 'false' with a hash.
      }
    });
  });
  return charPatternMatrix; // Return the final character matrix.
};

// Execute the primary function by reading input from standard input.
processGridData(require('fs').readFileSync('/dev/stdin', 'utf8'));