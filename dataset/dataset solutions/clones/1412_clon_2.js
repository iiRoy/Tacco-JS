function processInputData(inputRows) {
  // Iterate through the input rows until a specific termination condition is met.
  for (var rowIdx = 0; ; rowIdx++) {
    // Check if the current input row signifies the end of data.
    if (inputRows[rowIdx] === '0 0') {
      break; // Exit the loop if the termination string is found.
    }
    
    // Split the current row string to extract height and width values.
    var dimensionsStr = inputRows[rowIdx].split(/\s+/);
    // Convert the first part to an integer for height.
    var heightVal = parseInt(dimensionsStr[0], 10);
    // Convert the second part to an integer for width.
    var widthVal = parseInt(dimensionsStr[1], 10);

    // Initialize a 2D array (grid) based on the parsed height.
    var gridMatrix = new Array(heightVal);
    // Loop through each row index to populate the grid.
    for (var rowCoord = 0; rowCoord < gridMatrix.length; rowCoord++) {
      // Initialize each row with an array based on the parsed width.
      gridMatrix[rowCoord] = new Array(widthVal);
      // Loop through each column index in the current row.
      for (var colCoord = 0; colCoord < gridMatrix[rowCoord].length; colCoord++) {
        // Assign '#' or '.' based on the checkerboard pattern (sum of coordinates parity).
        gridMatrix[rowCoord][colCoord] = (colCoord + rowCoord) % 2 === 0 ? '#' : '.';
      }
      // Join the characters in the current row to form a string and append a newline.
      gridMatrix[rowCoord] = gridMatrix[rowCoord].join('') + '\n';
    }
    // Join all the row strings to form the complete grid output.
    gridMatrix = gridMatrix.join('');

    // Print the generated grid to the console.
    console.log(gridMatrix);
  }
}

// An array to store incoming data chunks from standard input.
var dataParts = [];
// Attach an event listener for 'data' events on the standard input stream.
process.stdin.on('data', function(dataPiece) {
  // Push each received data chunk into the dataParts array.
  dataParts.push(dataPiece);
});
// Attach an event listener for the 'end' event on the standard input stream.
process.stdin.on('end', function() {
  // Concatenate all data chunks, convert to a string, and then split into individual lines.
  var inputRows = dataParts.join('').split('\n');
  // Call the main processing function with the prepared array of input lines.
  processInputData(inputRows);
});
