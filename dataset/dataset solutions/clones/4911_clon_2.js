const processInputData = (rawDataString) => {
  // Parse the input string to extract numerical values
  const [firstNumber, secondNumber] = rawDataString.trim().split(' ').map(currentElement => parseInt(currentElement, 10));

  let cumulativeResult = 0; // Initialize a variable to store the calculated total

  // Iterate a specific number of times based on the first input value
  for (let loopIndex = 0; loopIndex < firstNumber; loopIndex++) {
    // Special handling for the very first iteration
    if (loopIndex === 0) {
      cumulativeResult += secondNumber; // Add the second input value directly
      continue; // Skip to the next iteration
    }
    // For subsequent iterations, apply a different calculation
    cumulativeResult *= (secondNumber - 1); // Multiply by (secondNumber - 1)
  }

  // Output the final computed result to the console
  console.log(cumulativeResult);
};

// Read input from standard input and pass it to the processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
