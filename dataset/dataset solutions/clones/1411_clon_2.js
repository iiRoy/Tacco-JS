function processInputData(inputLines) {
  // Loop through each line of input until the termination condition is met.
  for (let lineIndex = 0; ; lineIndex++) {
    // Check for the '0 0' termination signal.
    if (inputLines[lineIndex] === '0 0') {
      break; // Exit the loop if '0 0' is encountered.
    }

    // Parse the dimensions (height and width) from the current input line.
    const dimensionsStr = inputLines[lineIndex].split(/\s+/);
    const gridHeight = parseInt(dimensionsStr[0], 10); // Convert first part to integer for height.
    const gridWidth = parseInt(dimensionsStr[1], 10);   // Convert second part to integer for width.

    // Initialize an array to hold the rows of the generated grid.
    const outputGrid = new Array(gridHeight);

    // Populate the grid row by row.
    for (let rowIndex = 0; rowIndex < outputGrid.length; rowIndex++) {
      // Create a new array for the current row.
      // Note: The original code uses 'gridHeight' here, not 'gridWidth'.
      // This creates a square grid of size HxH, regardless of W.
      outputGrid[rowIndex] = new Array(gridHeight);
      
      // Fill the cells of the current row based on the checkerboard pattern.
      for (let colIndex = 0; colIndex < outputGrid[rowIndex].length; colIndex++) {
        outputGrid[rowIndex][colIndex] = (colIndex + rowIndex) % 2 === 0 ? '#' : '.';
      }
      
      // Join the characters in the current row and append a newline character.
      outputGrid[rowIndex] = outputGrid[rowIndex].join('') + '\n';
    }
    
    // Join all the processed rows into a single string for output.
    const finalOutput = outputGrid.join('');

    // Print the generated grid to the console.
    console.log(finalOutput);
  }
}

// Array to accumulate data chunks from standard input.
const dataParts = [];

// Event listener for incoming data from standard input.
process.stdin.on('data', function(dataSegment) {
  dataParts.push(dataSegment); // Add each data chunk to the array.
});

// Event listener for the end of standard input.
process.stdin.on('end', function() {
  // Join all data chunks, then split into individual lines.
  const allInputLines = dataParts.join('').split('\n');
  // Call the main processing function with the collected lines.
  processInputData(allInputLines);
});
