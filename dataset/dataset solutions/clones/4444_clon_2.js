function obtainInputStream() {
  // This utility function is responsible for fetching raw text data from the standard input.
  // It leverages the Node.js 'fs' module to perform a synchronous file read operation.
  // The retrieved content is then trimmed to remove any leading or trailing whitespace characters.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function emitOutput(content) {
  // This function serves to display the provided string or object to the standard output stream.
  // Essentially, it prints the given content to the console.
  console.log(content);
}

// A versatile helper function designed for various input data transformations.
// The 'type' parameter dictates the specific processing mode to apply.
//
// [transformationType] descriptions:
// 0: Identity operation; the input 'item' is returned without any modification.
// 1: Parses the input 'item' string and converts it into an integer number.
// 2: Splits the input 'item' string into an array of substrings using a single space as the delimiter.
// 3: Splits the input 'item' string into an array of substrings using a newline character as the delimiter.
// 4: First, splits the input 'item' string by spaces, then maps each resulting substring to its numerical equivalent.
// 5: First, splits the input 'item' string by newlines, then maps each resulting substring to its numerical equivalent.
// 6: Breaks down the input 'item' string into an array where each element is a single character.
// 7: First, breaks down the input 'item' string into individual characters, then maps each character to its numerical equivalent.
function processData(item, type) {
  switch (type) {
    case 0:
      return item;

    case 1:
      return parseInt(item, 10); // Explicitly specifying radix for best practice.

    case 2:
      return item.split(" ");

    case 3:
      return item.split("\n");

    case 4:
      return item.split(" ").map((element) => Number(element));

    case 5:
      return item.split("\n").map((element) => Number(element));

    case 6:
      return item.split("");

    case 7:
      return item.split("").map((element) => Number(element));

    default:
      // In case of an unrecognized type, fall back to returning the original item.
      return item;
  }
}

function primaryExecution(initialData) {
  // The first step involves processing the raw input string by dividing it into separate lines.
  initialData = processData(initialData, 3);

  // Extract the grid's spatial dimensions (rows and columns) from the first line of input.
  // The first value represents the row count, and the second value signifies the column count.
  const dimensions = processData(initialData[0], 4);
  let rowCount = dimensions[0];
  let colCount = dimensions[1];

  // Retrieve the total number of distinct item types from the second line of input.
  let totalItems = processData(initialData[1], 1);

  // Obtain the array containing the initial counts for each distinct tile type from the third line.
  let tileCounts = processData(initialData[2], 4);

  // Initialize a two-dimensional array (grid) that will ultimately hold the final arrangement of tiles.
  let resultGrid = new Array(rowCount);
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    resultGrid[rowIndex] = new Array(colCount);
  }

  // Initialize the identifier for the current tile being placed, starting from 1.
  let currentTileIdentifier = 1;

  // Iterate sequentially through each row of the grid to fill it with tiles.
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    // Implement an alternating traversal pattern for rows:
    // For even-numbered rows (e.g., 0, 2, 4...), traverse from the leftmost column to the rightmost.
    if (rowIndex % 2 === 0) {
      for (let colIndex = 0; colIndex < colCount; colIndex++) {
        // Check if the supply of the current tile type has been fully used.
        // If so, increment to the next tile type identifier.
        if (tileCounts[currentTileIdentifier - 1] === 0) {
          currentTileIdentifier++;
        }
        // Decrement the remaining count for the current tile type.
        tileCounts[currentTileIdentifier - 1]--;
        // Assign the current tile's identifier to the corresponding cell in the result grid.
        resultGrid[rowIndex][colIndex] = currentTileIdentifier;
      }
    } else {
      // For odd-numbered rows (e.g., 1, 3, 5...), traverse from the rightmost column to the leftmost.
      for (let colIndex = colCount - 1; colIndex >= 0; colIndex--) {
        // Check if the supply of the current tile type has been fully used.
        // If so, increment to the next tile type identifier.
        if (tileCounts[currentTileIdentifier - 1] === 0) {
          currentTileIdentifier++;
        }
        // Decrement the remaining count for the current tile type.
        tileCounts[currentTileIdentifier - 1]--;
        // Assign the current tile's identifier to the corresponding cell in the result grid.
        resultGrid[rowIndex][colIndex] = currentTileIdentifier;
      }
    }
  }

  // After the grid is filled, transform each row array into a space-separated string.
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    resultGrid[rowIndex] = resultGrid[rowIndex].join(" ");
  }

  // Finally, join all the row strings with newline characters to form the complete output,
  // and then display this final formatted string.
  emitOutput(resultGrid.join("\n"));
}

// Initiate the primary execution flow of the program by first obtaining the standard input,
// and then passing that input to the main processing function.
primaryExecution(obtainInputStream());