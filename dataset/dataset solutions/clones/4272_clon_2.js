function processInput(inputLines) {
  // Split the entire input string into an array of lines
  let parsedLines = inputLines.split("\n");

  // Parse the first line as an integer and store it
  const firstValue = parseInt(parsedLines[0], 10);

  // Parse the second line as an integer and store it
  const secondValue = parseInt(parsedLines[1], 10);

  // Calculate the result based on the given formula and print it
  console.log(2 * secondValue - firstValue);
}

// Read the input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
