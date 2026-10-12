function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  const processedData = rawData.split("\n");

  // Parse the dimensions from the first line.
  const dimensions = processedData[0].split(" ");
  const rowDim = parseInt(dimensions[0], 10); // Height of the grid
  const colDim = parseInt(dimensions[1], 10); // Width of the grid

  // Parse the number of distinct blocks from the second line.
  const numBlocks = parseInt(processedData[1], 10);

  // Get the string representation of block counts from the third line.
  const blockCountsStr = processedData[2].split(" ");

  // Initialize an array to store the flattened sequence of block identifiers.
  const flattenedBlocks = [];

  // Populate the flattenedBlocks array based on block counts.
  // Each block identifier (i + 1) is added 'currentBlockCount' times.
  for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
    const currentBlockCount = parseInt(blockCountsStr[blockIdx], 10);
    for (let count = 0; count < currentBlockCount; count++) {
      flattenedBlocks.push(blockIdx + 1);
    }
  }

  // Initialize an empty string to accumulate the final output.
  let finalOutputString = "";

  // Create an array to hold the string representation of each row.
  const rowStrings = new Array(rowDim).fill("");

  // Iterate through each row to construct its string representation.
  for (let currRow = 0; currRow < rowDim; currRow++) {
    // Set the first element of the current row string.
    rowStrings[currRow] = String(flattenedBlocks[currRow * colDim]);

    // Append or prepend subsequent elements based on row parity (snake pattern).
    for (let currCol = 1; currCol < colDim; currCol++) {
      if (currRow % 2 === 0) {
        // Even row: append elements normally.
        rowStrings[currRow] = rowStrings[currRow] + " " + String(flattenedBlocks[currRow * colDim + currCol]);
      } else {
        // Odd row: prepend elements to reverse the order.
        rowStrings[currRow] = String(flattenedBlocks[currRow * colDim + currCol]) + " " + rowStrings[currRow];
      }
    }
    // Add a newline character to the end of the current row string.
    rowStrings[currRow] = rowStrings[currRow] + "\n";
    // Append the completed row string to the final output.
    finalOutputString += rowStrings[currRow];
  }

  // Remove the trailing newline character if it exists.
  if (finalOutputString.slice(-1) === "\n") {
    finalOutputString = finalOutputString.slice(0, -1);
  }

  // Print the final formatted output to the console.
  console.log('%s', finalOutputString);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
