/**
 * This function processes a string input, performs calculations,
 * and prints the result to the console.
 * It expects a space-separated string of three numbers.
 * @param {string} inputLine The raw input string from stdin.
 */
function ProcessData(inputLine) {
  // Split the input string by spaces and convert each part to a number.
  // The unary plus operator `+` is used for type conversion.
  let numericValues = inputLine.split(" ").map(itemStr => +itemStr);

  // Extract the first number from the parsed array.
  let valN = numericValues[0];

  // Extract the second number, then subtract one.
  let valMAdjusted = numericValues[0b1] - 0b1;

  // Extract the third number.
  let valD = numericValues[0x2];

  // Determine a calculation factor based on the third number.
  // If valD is truthy (non-zero), factor is 2; otherwise, it's 1.
  let calcFactor = valD ? 0x2 : 0b1;

  // Perform the final calculation and output the result.
  // The formula is (valMAdjusted * (valN - valD) * calcFactor) / (valN * valN).
  console.log(valMAdjusted * (valN - valD) * calcFactor / (valN * valN));
}

// Read the input from standard input asynchronously and pass it to the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
