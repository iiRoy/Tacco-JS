function ProcessInput(inputString) {
  // Split the incoming string by newline or space characters
  inputString = inputString.split(/\n|\s/);

  // Convert the first element to an integer using a bitwise OR operation
  inputString[0] |= 0;
  // Convert the second element to an integer
  inputString[1] |= 0;

  // Calculate an initial result using ceiling division
  let resultValue = Math.ceil(inputString[0] / (inputString[1] - 1));

  // Check for a specific condition where the second input is 2
  if (inputString[1] == 2) {
    // Adjust the result for this particular scenario
    resultValue = inputString[0] - 1;
  }
  // Otherwise, check another condition involving modulo
  else if ((inputString[0] % (inputString[1] - 1)) == 1) {
    // Decrement the result if the modulo condition is met
    resultValue--;
  }

  // Output the final computed result to the console
  console.log(resultValue);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
