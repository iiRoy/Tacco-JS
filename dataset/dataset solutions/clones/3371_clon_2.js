function processInputData(dataLines) {
  // Extract the first line which contains global parameters
  const firstLineParts = dataLines[0].split(' ');
  // The first value 'n' is read but not used in the subsequent logic.
  const itemCount = firstLineParts[0];
  // Parse minimum height requirement
  const minHeight = parseInt(firstLineParts[1], 10);
  // Parse minimum width requirement
  const minWidth = parseInt(firstLineParts[2], 10);

  // Initialize a counter for items that meet the criteria
  let validItemsCount = 0;

  // Iterate through the remaining lines of input, starting from the second line
  for (let lineIndex = 1; lineIndex < dataLines.length; lineIndex++) {
    // Split the current line into its constituent parts
    const currentLineParts = dataLines[lineIndex].split(' ');
    // Parse the item's height
    const currentHeight = parseInt(currentLineParts[0], 10);
    // Parse the item's width
    const currentWidth = parseInt(currentLineParts[1], 10);

    // Check if the current item's dimensions meet or exceed the minimum requirements
    if (currentHeight >= minHeight && currentWidth >= minWidth) {
      // If both conditions are met, increment the counter
      validItemsCount++;
    }
  }

  // Output the final count of valid items to the console
  console.log(validItemsCount);
}

// This function is defined but not utilized in the main processing logic.
function convertLineToNumbers(textRow) {
  const numericValues = []; // Array to store parsed numbers
  const stringParts = textRow.split(' '); // Split the input string by spaces

  // Iterate over each string part
  for (let partIndex = 0; partIndex < stringParts.length; partIndex++) {
    // Convert the string part to an integer and add it to the result array
    numericValues.push(parseInt(stringParts[partIndex], 10));
  }
  return numericValues; // Return the array of numbers
}

// Global variable to accumulate all incoming data from standard input
let rawDataBuffer = '';

// Resume standard input stream to start receiving data
process.stdin.resume();
// Set the encoding for the standard input stream to UTF-8
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks received from stdin
process.stdin.on('data', function(chunk) {
  // Append each received chunk to the rawDataBuffer
  rawDataBuffer += chunk;
});

// Event listener for the 'end' of the standard input stream
process.stdin.on('end', function() {
  // Once all data is received, split the buffer into an array of lines
  // using the newline character as a delimiter
  const processedInputLines = rawDataBuffer.split('\n');
  // Call the main processing function with the array of lines
  processInputData(processedInputLines);
});
