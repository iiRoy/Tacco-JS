function processInput(rawData) {
  // Define constants for grid dimensions to improve readability and maintainability.
  const GRID_DIMENSION = 100;
  const HALF_GRID_DIMENSION = GRID_DIMENSION / 2;
  const LAST_ROW_INDEX = GRID_DIMENSION - 1;

  // Parse input values. Using an explicit radix for parseInt is good practice.
  const inputLines = rawData.split("\n");
  const firstLineData = inputLines[0].split(" ");
  const valA = parseInt(firstLineData[0], 10);
  const valB = parseInt(firstLineData[1], 10);

  // Helper function to create a new array row filled with a specified character.
  const createFilledRow = (size, fillChar) => new Array(size).fill(fillChar);

  // Initialize the main grid structure.
  // The first half of the grid is filled with '.', the second half with '#'.
  // Using Array.from for a more functional approach to grid initialization.
  const outputGrid = Array.from({ length: GRID_DIMENSION }, (_, rowIndex) => {
    const charToFill = rowIndex < HALF_GRID_DIMENSION ? "." : "#";
    return createFilledRow(GRID_DIMENSION, charToFill);
  });

  // Helper function to calculate the specific row and column for placing characters.
  // This encapsulates the original coordinate calculation logic.
  const determinePlacementCoordinates = (index) => {
    // Replicates the original Math.round(i/50)*2 logic for row calculation.
    const calculatedRowOffset = Math.round(index / HALF_GRID_DIMENSION) * 2;
    // Replicates the original (i%50)*2 logic for column calculation.
    const calculatedColOffset = (index % HALF_GRID_DIMENSION) * 2;
    return {
      row: calculatedRowOffset,
      col: calculatedColOffset
    };
  };

  // Place '#' characters on the grid based on the value of valB.
  // The loop iterates B-1 times.
  for (let bCharIndex = 0; bCharIndex < valB - 1; bCharIndex++) {
    const { row, col } = determinePlacementCoordinates(bCharIndex);
    outputGrid[row][col] = "#";
  }

  // Place '.' characters on the grid based on the value of valA.
  // The loop iterates A-1 times.
  for (let aCharIndex = 0; aCharIndex < valA - 1; aCharIndex++) {
    const { row, col } = determinePlacementCoordinates(aCharIndex);
    // The row for '.' placement is inverted from the '#' placement.
    outputGrid[LAST_ROW_INDEX - row][col] = ".";
  }

  // Convert the 2D array grid into a single string for output.
  // Each inner array (row) is joined by an empty string, then all rows are joined by newline characters.
  const gridRowsAsStrings = outputGrid.map(rowArray => rowArray.join(""));
  const finalResultString = gridRowsAsStrings.join("\n");

  // Output the final string to the console.
  console.log('%s', finalResultString);
}

// This function is for debugging purposes, as indicated in the original code.
// It reads input from a DOM element.
function runDebug() {
  // Using querySelector for a slightly different but equivalent DOM access method.
  const debugInputContent = document.querySelector("#input").value;
  processInput(debugInputContent);
}

// Main execution block: reads input from stdin and passes it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
