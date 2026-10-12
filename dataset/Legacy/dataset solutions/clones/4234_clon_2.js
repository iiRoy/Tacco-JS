function processInput(inputString) {
  // First, we take the raw input string.
  // We split it by newline characters and take only the very first line.
  // Then, that line is split by spaces to get individual string representations of numbers.
  // Finally, each string is converted into a numerical value.
  let numericValues = inputString.split("\n")[0].split(" ").map(currentValue => Number(currentValue));

  // We perform a specific arithmetic operation using the parsed numbers.
  // The calculation is (first_number - third_number) divided by (second_number + third_number).
  // The result is then floored to the nearest whole number.
  let calculationResult = Math.floor((numericValues[0] - numericValues[2]) / (numericValues[1] + numericValues[2]));

  // The final computed value is printed to the standard output.
  console.log(calculationResult);
}

// The program reads the entire content of standard input as a UTF-8 string.
// This string is then passed to our primary processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
