var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var dataRows = rawData.split('\n'); // Split the input into an array of lines

// Main processing loop
while (true) {
  // Extract dimensions from the current line
  var currentDimensions = dataRows.shift().split(' ');
  var heightVal = +currentDimensions[0]; // Convert first part to number for height
  var widthVal = +currentDimensions[1]; // Convert second part to number for width

  // Check for termination condition (H=0 and W=0)
  if (heightVal + widthVal === 0) {
    break; // Exit the loop if both dimensions are zero
  }

  // Loop through rows to build the rectangle
  for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    // Loop through columns for each row
    for (var colIdx = 0; colIdx < widthVal; colIdx++) {
      // Determine if the current position is a border or an inner part
      if (rowIdx === 0 || rowIdx === heightVal - 1 || colIdx === 0 || colIdx === widthVal - 1) {
        process.stdout.write('#'); // Print hash for border
      } else {
        process.stdout.write('.'); // Print dot for inner part
      }
    }
    console.log(); // Newline after each row
  }
  console.log(); // Extra newline after each rectangle
}
