// This function processes the provided data array.
function processInput(dataArray) {
  // Extract the first item from the array.
  let firstElement = dataArray[0];
  // Log a concatenated string to the console.
  console.log("ABC" + firstElement);
}

// Read input from standard input, decode it, trim whitespace, and split by newlines.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
