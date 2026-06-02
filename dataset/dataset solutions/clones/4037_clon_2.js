function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let processedLines = rawData.split("\n");

  // Parse the first number from the first line of input.
  let firstNumber = Number.parseInt(processedLines[0].split(" ")[0]);

  // Parse the second number from the first line of input.
  let secondNumber = Number.parseInt(processedLines[0].split(" ")[1]);

  // Initialize a variable to store the outcome.
  let resultValue = -1;

  // Check if the first number is not perfectly divisible by the second number.
  if (firstNumber % secondNumber !== 0) {
    // If there's a remainder, assign the first number to the result.
    resultValue = firstNumber;
  }

  // Output the final computed value to the console.
  console.log('%s', resultValue);
}

// Read the entire content from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
