// This function serves as the primary entry point for processing grid data.
function processInputData(inputData) {
  // Parse the grid dimensions from the first line of the input array.
  // The first number represents the height (number of rows).
  let rowDimension = parseInt(inputData[0].split(" ")[0], 10);
  // The second number represents the width (number of columns).
  let colDimension = parseInt(inputData[0].split(" ")[1], 10);

  // Initialize an array to store the 1-based coordinates of all cells containing odd numbers.
  let oddCoordinates = [];

  // Iterate through each row of the grid, starting from the first actual data row (index 1 in inputData).
  for (let rowIndex = 1; rowIndex <= rowDimension; rowIndex++) {
    // Split the current row string into an array of string-represented cell values.
    const currentRowValues = inputData[rowIndex].split(" ");

    // Process each cell in the current row to identify odd numbers and their positions.
    const currentOddCells = currentRowValues.map((cellValueString, colIndex) => {
      // Convert the string cell value to an integer.
      const numericValue = parseInt(cellValueString, 10);
      // Check if the numeric value is odd.
      if (numericValue % 2 === 1) {
        // If it's an odd number, return its 1-based [row, column] coordinates.
        return [rowIndex, colIndex + 1];
      } else {
        // If it's an even number, return null to be filtered out later.
        return null;
      }
    }).filter(coordEntry => coordEntry !== null); // Remove all null entries from the mapped array.

    // Concatenate the odd coordinates found in this row to the main list of odd coordinates.
    oddCoordinates = oddCoordinates.concat(currentOddCells);
  }

  // Initialize an array to store the generated sequence of moves.
  let moveInstructions = [];

  // Iterate through the collected odd coordinates, processing them in pairs.
  // Each pair defines a path from a starting odd number to an ending odd number.
  for (let pairIndex = 0; pairIndex < Math.floor(oddCoordinates.length / 2); pairIndex++) {
    let currentPos = oddCoordinates[pairIndex * 2]; // The starting coordinate for the current path.
    let targetPos = oddCoordinates[pairIndex * 2 + 1]; // The target coordinate for the current path.

    // This conditional check is preserved from the original logic,
    // although 'targetPos' should ideally not be null after the filtering step.
    if (targetPos === null) {
      break; // Exit the loop if an unexpected null target is encountered.
    }

    // Convert the target position array to a string for comparison purposes.
    // For example, an array [R, C] becomes the string "R,C". This is crucial for behavioral equivalence.
    const targetPosString = targetPos.toString();

    // Continue generating individual moves until the 'currentPos' reaches the 'targetPos'.
    while (currentPos.toString() !== targetPosString) {
      // If the current column is less than the target column, prioritize moving right.
      if (currentPos[1] < targetPos[1]) {
        // Record the move: from (current row, current col) to (current row, current col + 1).
        // The '++currentPos[1]' increments the column of 'currentPos' in place before using it.
        moveInstructions.push([currentPos[0], currentPos[1], currentPos[0], ++currentPos[1]]);
      } else {
        // Otherwise (if current column is greater than or equal to target column), move down.
        // Record the move: from (current row, current col) to (current row + 1, current col).
        // The '++currentPos[0]' increments the row of 'currentPos' in place before using it.
        moveInstructions.push([currentPos[0], currentPos[1], ++currentPos[0], currentPos[1]]);
      }
    }
  }

  // Output the total number of generated move instructions.
  console.log(moveInstructions.length);
  // Output each move instruction on a new line, as a string representation.
  console.log(moveInstructions.join("\n"));
}

// Read the entire content from standard input, assuming UTF-8 encoding.
// Then, trim any leading/trailing whitespace and split the content into an array of lines.
const fileInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
// Invoke the main processing function with the prepared input data.
processInputData(fileInputContent);
