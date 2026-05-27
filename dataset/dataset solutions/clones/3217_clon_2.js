function ProcessInput(rawData) {
  // This section handles the initial parsing of the input string.
  const tokenizedData = rawData.trim().split(' ');

  // Extract and convert the first numerical component.
  const firstValue = parseInt(tokenizedData[0]);

  // Extract and convert the second numerical component.
  // This variable is present in the original structure but not used in the final calculation.
  const secondValue = parseInt(tokenizedData[1]);

  // Perform the core arithmetic operation as defined.
  var resultantQuotient = firstValue / 3;

  // Display the computed result to the standard output.
  console.log(resultantQuotient);
}

// The program execution starts here, reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
