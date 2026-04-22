// Function to process input data and generate a grid pattern.
function ProcessInputData(rawDataString) {
  // Split the entire input into individual lines for easier parsing.
  let parsedLines = rawDataString.split("\n");

  // Extract grid dimensions from the first line.
  // The first element is height, the second is width.
  const gridDimensions = parsedLines[0].split(" ");
  const gridHeight = parseInt(gridDimensions[0], 10);
  const gridWidth = parseInt(gridDimensions[1], 10);

  // Get the total number of distinct block types from the second line.
  const blockTypeCount = parseInt(parsedLines[1], 10);

  // Parse the counts of each block type from the third line.
  const blockCountsStr = parsedLines[2].split(" ");

  // This array will store the sequence of block IDs that fill the grid.
  // Each block ID will be repeated according to its count.
  let blockSequence = new Array();

  // Populate the block sequence array.
  // Iterate through each block type.
  for (let blockTypeIdx = 0; blockTypeIdx < blockTypeCount; blockTypeIdx++) {
    // Get the count for the current block type.
    const currentBlockCount = parseInt(blockCountsStr[blockTypeIdx], 10);

    // Add the block ID (blockTypeIdx + 1) to the sequence 'currentBlockCount' times.
    for (let blockInstanceIdx = 0; blockInstanceIdx < currentBlockCount; blockInstanceIdx++) {
      blockSequence.push(blockTypeIdx + 1);
    }
  }

  // String to accumulate the final grid output.
  let finalOutputString = "";
  // Array to hold string representations of each row before final assembly.
  let outputRowsArray = new Array(gridHeight).fill("");

  // Construct the grid row by row.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    // Initialize the current row string with the first element.
    outputRowsArray[rowIdx] = blockSequence[rowIdx * gridWidth];

    // Populate the rest of the current row.
    for (let colIdx = 1; colIdx < gridWidth; colIdx++) {
      // Determine the order of appending based on row index (even/odd for snake pattern).
      if (rowIdx % 2 === 0) {
        // For even rows, append elements from left to right.
        outputRowsArray[rowIdx] += " " + blockSequence[rowIdx * gridWidth + colIdx];
      } else {
        // For odd rows, prepend elements from right to left (simulating a reversed row).
        outputRowsArray[rowIdx] = blockSequence[rowIdx * gridWidth + colIdx] + " " + outputRowsArray[rowIdx];
      }

      // If it's the last column of the current row, add a newline character.
      if (colIdx === gridWidth - 1) {
        outputRowsArray[rowIdx] += "\n";
      }
    }
    // Append the completed row string to the overall output.
    finalOutputString += outputRowsArray[rowIdx];
  }

  // Remove the trailing newline character from the final output string.
  finalOutputString = finalOutputString.slice(0, -1);

  // Print the generated grid to the console.
  console.log('%s', finalOutputString);
}

// Read input from standard input and pass it to the processing function.
ProcessInputData( require("fs") . readFileSync( "/dev/stdin" ,  "utf8" ) );