const fileSystemModule = require('fs');

// Function alias for reading file content synchronously
const acquireFileData = fileSystemModule.readFileSync;

// Retrieve raw data from the standard input path
let fileContent = acquireFileData('/dev/stdin', 'UTF-8');

// Process the raw content: trim whitespace and split into individual lines
let inputLines = fileContent
  .trim() // Remove excess blank characters
  .split('\n'); // Divide the string by newline characters

// Main processing loop, continues indefinitely until a specific condition is met
while ( true )
{
  // Extract the first line from our collection of input lines
  let currentRecord = inputLines.shift();

  // Check for the termination sequence, which is six zero digits separated by spaces
  if (currentRecord === '0 0 0 0 0 0') {
    break; // Terminate the loop if the sentinel value is encountered
  }

  // Convert the current line string into an array of numeric values
  let numericValues = currentRecord
    .split(' ') // Split the string by space delimiters
    .map(parseInt); // Transform each segment into an integer

  // Calculate three separate sums based on specific index pairs from the numeric array
  let firstTotal = numericValues[0] + numericValues[3];
  let secondTotal = numericValues[1] + numericValues[4];
  let thirdTotal = numericValues[2] + numericValues[5];

  let operationCount = 0; // Initialize a counter for the total number of operations

  // Add initial operations based on the integer division of each sum by three
  operationCount += (firstTotal - (firstTotal % 3)) / 3;
  operationCount += (secondTotal - (secondTotal % 3)) / 3;
  operationCount += (thirdTotal - (thirdTotal % 3)) / 3;

  // Update each total to its remainder after division by three
  firstTotal = firstTotal % 3;
  secondTotal = secondTotal % 3;
  thirdTotal = thirdTotal % 3;

  // Perform additional operations as long as all three remainders are at least one
  while ( (firstTotal % 3 >= 1) && (secondTotal >= 1) && (thirdTotal >= 1) )
  {
    firstTotal--;     // Decrement the first total
    secondTotal--;    // Decrement the second total
    thirdTotal--;     // Decrement the third total
    operationCount++; // Increment the overall operation counter
  }

  // Alias for console.log to change the identifier name
  const displayResult = console.log;

  // Output the final calculated operation count for the current record
  displayResult(operationCount);
}