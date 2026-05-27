function processInput(dataArray) {
  // Extract the first element from the input array and convert it to a numerical type.
  let numericValue = dataArray[0] - 0;

  // Calculate the product of the ceiling and floor of half the numeric value, then print it.
  console.log(Math.ceil(numericValue / 2) * Math.floor(numericValue / 2));
}

// Read data from standard input, decode it as UTF-8, remove leading/trailing whitespace,
// split it into an array by newline characters, and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
