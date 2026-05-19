// This function serves as the primary entry point for processing the provided input data.
// It orchestrates the parsing, grid construction, and final output generation.
function ProcessInput(rawData) {
  // Divide the entire raw input string into individual lines based on newline characters.
  let inputLines = rawData.split("\n");

  // Extract grid dimensions (height and width) from the first line of input.
  // The values are space-separated.
  let dimensionStrings = inputLines[0].split(" ");
  let gridHeight = parseInt(dimensionStrings[0], 0x0A); // Convert height string to an integer (base 10).
  let gridWidth = parseInt(dimensionStrings[0x1], 0x0A);  // Convert width string to an integer (base 10).

  // Retrieve the total number of distinct colors from the second line of input.
  let colorCount = parseInt(inputLines[0x1], 0x0A);

  // Parse the string containing the amounts for each color from the third line.
  let colorAmountsStr = inputLines[0x2].split(" ");

  // Initialize an array to hold the numeric quantities for each color.
  // It's pre-filled with zeros.
  let colorAmounts = new Array(colorCount).fill(0x0);

  // Iterate through the string array and convert each color amount to an integer.
  for (let idx = 0x0; idx < colorCount; idx++) {
    colorAmounts[idx] = parseInt(colorAmountsStr[idx], 0x0A);
  }

  // Initialize an empty string that will accumulate the final formatted output.
  let outputString = "";

  // Prepare a 2D array (grid) structure to represent the final color arrangement.
  // Initially, it's an array of 'gridHeight' elements, each set to null.
  let resultGrid = new Array(gridHeight).fill(null);
  for (let rIdx = 0x0; rIdx < gridHeight; rIdx++) {
    // For each row, create a new array of 'gridWidth' elements, pre-filled with zeros.
    let rowBuffer = new Array(gridWidth).fill(0x0);
    resultGrid[rIdx] = rowBuffer; // Assign the newly created row array to the grid.
  }

  // Construct a flattened, one-dimensional list of colors.
  // Each color (represented by its 1-based index) is repeated according to its amount.
  let flattenedColors = new Array();
  for (let cIdx = 0x0; cIdx < colorCount; cIdx++) {
    for (let repIdx = 0x0; repIdx < colorAmounts[cIdx]; repIdx++) {
      flattenedColors.push(cIdx + 0x1); // Add the 1-based color index to the list.
    }
  }

  // Populate the 'resultGrid' with colors from 'flattenedColors',
  // applying a "snake" pattern where rows alternate direction.
  for (let rIdx = 0x0; rIdx < gridHeight; rIdx++) {
    // For even-indexed rows (0, 2, 4, ...), fill from left to right.
    if ((rIdx % 0x2) === 0x0) {
      for (let cIdx = 0x0; cIdx < gridWidth; cIdx++) {
        // Calculate the linear index in 'flattenedColors' for the current cell.
        resultGrid[rIdx][cIdx] = flattenedColors[(rIdx * gridWidth) + cIdx];
      }
    } else {
      // For odd-indexed rows (1, 3, 5, ...), fill from right to left,
      // using a specific indexing pattern from 'flattenedColors'.
      // Note: This indexing might result in 'undefined' values if it goes out of bounds,
      // which is a behavior preserved from the original code.
      for (let cIdx = 0x0; cIdx < gridWidth; cIdx++) {
        resultGrid[rIdx][cIdx] = flattenedColors[((rIdx + 0x1) * gridWidth) - cIdx];
      }
    }
  }

  // Generate the final output string by iterating through the grid's logical structure.
  // The output string directly uses 'flattenedColors' with the same indexing logic
  // as used for filling 'resultGrid'.
  for (let rIdx = 0x0; rIdx < gridHeight; rIdx++) {
    // Process even-indexed rows (left-to-right).
    if ((rIdx % 0x2) === 0x0) {
      for (let cIdx = 0x0; cIdx < gridWidth; cIdx++) {
        outputString += flattenedColors[(rIdx * gridWidth) + cIdx];
        // Append a space after each element, unless it's the last element in the row.
        if ((cIdx % gridWidth) !== (gridWidth - 0x1)) {
          outputString += " ";
        } else {
          // Append a newline character at the end of each row.
          outputString += "\n";
        }
      }
    } else {
      // Process odd-indexed rows (right-to-left, using the specific indexing).
      for (let cIdx = 0x0; cIdx < gridWidth; cIdx++) {
        outputString += flattenedColors[((rIdx + 0x1) * gridWidth) - cIdx];
        // Append a space after each element, unless it's the last element in the row.
        if ((cIdx % gridWidth) !== (gridWidth - 0x1)) {
          outputString += " ";
        } else {
          // Append a newline character at the end of each row.
          outputString += "\n";
        }
      }
    }
  }

  // Remove the very last newline character from the accumulated output string
  // to prevent an extra blank line at the end of the output.
  outputString = outputString.substring(0x0, outputString.length - 0x1);

  // Print the final formatted string to the standard output.
  console.log('%s', outputString);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the ProcessInput function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
