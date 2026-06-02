function ProcessInput(inputData) {
  // The incoming string is split by spaces, and each resulting part is converted into a number.
  // This creates an array of numerical values from the input.
  let numericalComponents = inputData.split(" ").map(currentPart => +currentPart);

  // A variable is initialized to hold the outcome symbol, defaulting to "x".
  var finalSymbol = "x";

  // Check if the sum of the first two numerical components equals fifteen.
  // If this condition is met, the symbol is updated to "+".
  if (numericalComponents[0] + numericalComponents[1] === 15) {
    finalSymbol = "+";
  }

  // Separately, check if the product of the first two numerical components equals fifteen.
  // If this condition is met, the symbol is updated to "*".
  // This check occurs after the sum check, meaning '*' will override '+' if both conditions are true.
  if (numericalComponents[0] * numericalComponents[1] === 15) {
    finalSymbol = "*";
  }

  // The determined symbol is then printed to the standard output.
  console.log(finalSymbol);
}

// The program reads the entire content of standard input as a UTF-8 encoded string.
// This content is then passed as an argument to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
