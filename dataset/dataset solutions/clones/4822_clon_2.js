function processInputData(rawData) {
  // Split the entire input string into individual lines
  const lineSegments = rawData.split('\n');

  // Extract dimensions from the first line: height and width
  const [numRows, numCols] = lineSegments[0].split(' ');

  // Initialize an array to store the content of each row
  let rowContent = new Array(parseInt(numRows, 10)); // Explicitly parse to integer for array size

  // Populate the row content array from the input lines
  for (let rowIndex = 0; rowIndex < parseInt(numRows, 10); rowIndex++) {
    rowContent[rowIndex] = lineSegments[rowIndex + 1];
  }

  // Iterate through the stored rows and print each one twice
  for (let rowIndex = 0; rowIndex < parseInt(numRows, 10); rowIndex++) {
    console.log(rowContent[rowIndex]); // Output the current row's data
    console.log(rowContent[rowIndex]); // Output the same row's data again
  }
}

// Read input from standard input and pass it to the main processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
