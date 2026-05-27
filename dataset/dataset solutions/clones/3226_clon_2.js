function processInput(rawData) {
  // Split the raw input string into individual lines
  let lineSegments = rawData.split('\n');

  // Extract the number of pieces from the first line
  // Convert the first element of the split string to a number
  let numPieces = lineSegments[0].split(" ").map(Number)[0];

  // Process the second line: trim whitespace, split by space, convert to numbers, and sort ascending
  let pointPositions = lineSegments[1].trim().split(" ").map(Number).sort((a, b) => a - b);

  // Initialize an array to store differences between consecutive positions
  let diffs = [];

  // Iterate through the sorted point positions to calculate differences
  pointPositions.forEach((currentPos, idx) => {
    // For all elements except the first, calculate the difference with the previous element
    if (idx > 0) {
      diffs.push(currentPos - pointPositions[idx - 1]);
    }
  });

  // Sort the differences in ascending order
  // Then, slice the array to keep only the smallest differences,
  // excluding the largest (numPieces - 1) differences.
  diffs = diffs.sort((a, b) => a - b).slice(0, diffs.length - numPieces + 1);

  // Calculate the sum of the remaining differences and print it to the console
  console.log(diffs.reduce((accumulator, currentVal) => accumulator + currentVal, 0));
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
