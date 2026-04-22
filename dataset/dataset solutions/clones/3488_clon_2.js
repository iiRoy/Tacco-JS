function processInputData ( rawDataString ) {
  // Extract the first numerical value from the input string.
  let firstValueCount =
    parseInt(
      rawDataString.split(" ")[0],
      10
    ); // Base 10 for integer parsing

  // Obtain the second numerical value, expected on the second line.
  let operandOne =
    parseInt(
      rawDataString.split("\n")[1],
      10
    );

  // Retrieve the third numerical value, expected on the third line.
  let operandTwo =
    parseInt(
      rawDataString.split("\n")[2],
      10
    );

  /*
   * Determine the program's output based on the initial count.
   * If the count is one, print a greeting; otherwise, print the sum.
   */
  if ( firstValueCount === 1 ) {
    console.log("Hello World");
  } else {
    // Perform addition of the two operands.
    console.log(operandOne + operandTwo);
  }
}

// Acquire the necessary file system module for reading input.
const fileSystemModule = require("node:fs");

// Read the entire standard input as a UTF-8 string and pass it to the processing function.
processInputData(
  fileSystemModule.readFileSync("/dev/stdin", "utf-8")
);