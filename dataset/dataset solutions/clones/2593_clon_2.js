function processInput(dataLines) {
  // Parse the first numerical value from the input string
  let firstNum = dataLines[0].split(" ")[0] - 0;

  // Parse the second numerical value from the input string
  let secondNum = dataLines[0].split(" ")[1] - 0;

  // Initialize a counter for the result
  let resultCount = 1;

  // Iterate while the loop index is less than the second number
  for (let loopIndex = firstNum; loopIndex < secondNum; loopIndex += firstNum - 1) {
    // Increment the result counter in each iteration
    resultCount++;
  }

  // Output the final calculated count to the console
  console.log(resultCount);
}

// Read input from standard input, decode as UTF-8, and split by newline characters
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
