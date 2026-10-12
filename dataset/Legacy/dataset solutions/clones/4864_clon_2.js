function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let lineSegments = rawData.split("\n");

  // The first line contains dimensions (e.g., "H W").
  // We only need the second part (width/columns) for the inner loop limit.
  const dimensionsInfo = lineSegments[0].split(" ");

  // Remove the dimension line from the array, leaving only the grid data.
  lineSegments.shift();

  // Convert the 1D array of strings (each representing a row)
  // into a 2D array where each inner array is a row of individual cells.
  let gridData = convertToOneDToTwoD(lineSegments);

  // Iterate through each row of the grid.
  for (let rowIndex = 0; rowIndex < gridData.length; rowIndex++) {
    // Iterate through each column in the current row, up to the specified width.
    for (let colIndex = 0; colIndex < dimensionsInfo[1]; colIndex++) {
      // Check if the current cell contains the target string.
      if (gridData[rowIndex][colIndex] === "snuke") {
        // If "snuke" is found, calculate and print its coordinate.
        // Column is converted to a letter (A=0, B=1, etc.)
        // Row is 1-indexed.
        console.log(String.fromCharCode(65 + colIndex) + (rowIndex + 1));
        // Once "snuke" is found in a row, no need to check further columns in that row.
        break;
      }
    }
  }
}

// Helper function to transform a 1D array of space-separated strings
// into a 2D array of individual string elements.
function convertToOneDToTwoD(oneDArray) {
  // Loop through each string in the input array.
  for (let idx = 0; idx < oneDArray.length; idx++) {
    // Split each string by space and replace the original string with the new array.
    oneDArray[idx] = oneDArray[idx].split(" ");
  }
  // Return the now 2D array.
  return oneDArray;
}

// Entry point: Read input from standard input, trim whitespace, and pass to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
