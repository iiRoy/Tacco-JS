function processInput ( rawData ) {
  // Split the incoming string data by spaces to get individual arguments.
  const tokenizedData = rawData.split(' ');

  // Parse the first token as an integer with base 10.
  const firstNum = parseInt(tokenizedData[0], 10);

  // Parse the second token as an integer with base 10.
  const secondNum = parseInt(tokenizedData[1], 10);

  // Calculate the product of the two numbers, then divide by two, and print the result.
  console.log(firstNum * secondNum / 2);
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
