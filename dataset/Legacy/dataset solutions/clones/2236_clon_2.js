function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  var parsedLines = rawData.split('\n');

  // Parse the first three lines as numbers
  var verticalDim = Math.floor(parsedLines[0]); // Represents the first dimension
  var horizontalDim = Math.floor(parsedLines[1]); // Represents the second dimension
  var blackCells = Math.floor(parsedLines[2]); // Represents a count of specific cells
  
  // Initialize a variable to store the computed outcome
  var resultValue = 0;
  
  // Determine the calculation based on the comparison of dimensions
  if (verticalDim > horizontalDim) {
    // If the first dimension is larger, calculate based on it
    resultValue = Math.ceil(blackCells / verticalDim);
  } else {
    // Otherwise, calculate based on the second dimension
    resultValue = Math.ceil(blackCells / horizontalDim);
  }
  
  // Output the final calculated result to the console
  console.log(resultValue);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
