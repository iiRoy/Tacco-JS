const rawData = require('fs') . readFileSync(
  '/dev/stdin', // Input file stream path
  'utf8' // Specify UTF-8 encoding
);

// Split the entire input content into an array of individual lines
let lineArray = rawData.split ( "\n" ) ;

/*
 * Iterate through each processed line in the array.
 * The loop will terminate if a line containing "0 0" is encountered,
 * signifying the end of input data for rectangle dimensions.
 */
for (let idx = 0 ; idx < lineArray.length; idx++ )
{
  // Parse the current line to extract numerical height and width values
  let currentDimensions = lineArray[idx].split(" ") .map(Number) ;

  // Assign the first element as height and the second as width
  let heightVal = currentDimensions[0];
  let widthVal = currentDimensions[1];

  // Check for the termination condition: both dimensions are zero
  if (heightVal === 0 && widthVal === 0 )
  {
    break; // Exit the main loop
  }

  // Initialize an empty string buffer to construct the current rectangle's pattern
  let outputBuffer = '';

  // Outer loop: iterates through each row of the rectangle
  for (let rowIterator = 0; rowIterator < heightVal; rowIterator++) {
    // Inner loop: iterates through each column in the current row
    for (let colIterator = 0; colIterator < widthVal; colIterator++) {
      // Determine if the current position is on the top or bottom border row
      if (rowIterator === 0 || rowIterator === heightVal - 1) {
        outputBuffer += '#'; // Place a hash for border
      } else {
        // For inner rows, check if the current position is on the left or right border column
        if (colIterator === 0 || colIterator === widthVal - 1) {
          outputBuffer += '#'; // Place a hash for border
        } else {
          outputBuffer += '.'; // Place a dot for the interior
        }
      }
    }
    // Append a newline character after completing each row
    outputBuffer += '\n';
  }
  // Display the fully constructed rectangle pattern to the console
  console.log(outputBuffer);
}