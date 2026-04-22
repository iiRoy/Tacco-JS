// This function orchestrates the calculation of a specific derived value from an incoming text stream.
function processInputData(rawDataString) {
  /*
   * First, segment the comprehensive input string by spaces.
   * This yields an array where each element is a string representation of a number.
   */
  const stringComponents = rawDataString.split(" ");

  // Next, convert the initial string component into an integer using base 10.
  const operandAlpha = parseInt(stringComponents[0], 10);

  // Subsequently, convert the second string component into an integer, also using base 10.
  const operandBeta = parseInt(stringComponents[1], 10);

  /*
   * Perform the central arithmetic operation:
   * Multiply the first operand by three, add the second operand,
   * then divide the sum by two. Finally, truncate any decimal part.
   */
  const finalCalculation = Math.floor((operandAlpha * 3 + operandBeta) / 2);

  // Transmit the determined numerical outcome to the standard output device.
  console.log(finalCalculation);
}

// Initiate the data processing routine.
// This involves acquiring content from the standard input path (`/dev/stdin`)
// as a UTF-8 encoded string and feeding it to our primary processing function.
processInputData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);