function ProcessInput(rawData) {
  // Split the incoming string by spaces to get individual values
  let parsedValues = rawData.split(" ");

  // Parse the first value as an integer, using base 10
  let firstNum = parseInt(parsedValues[0], 10);

  // Parse the second value as an integer, using base 10
  let secondNum = parseInt(parsedValues[1], 10);

  // Initialize a variable to accumulate the final result
  let resultCounter = 0;

  // Add the first number minus one to the result
  resultCounter += (firstNum - 1);

  // Check a condition involving the two numbers
  if (secondNum >= firstNum) {
    // If the condition is met, increment the result by one
    resultCounter += 1;
  }

  // Print the final computed value to the standard output
  console.log(resultCounter);
}

// Read the entire content from standard input, encoded as UTF-8,
// and then pass it to our main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
