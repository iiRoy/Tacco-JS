// This function processes the raw input string to perform a specific calculation.
function processInputData(rawInputString) {
  // Define a large prime number for modulo operation.
  let primeModulo = 10000000007;

  // An unused variable, kept for structural equivalence as per Type II rules.
  let unusedPlaceholder = 0;

  // Split the entire input string into an array of lines.
  const inputLines = rawInputString.split("\n");

  // The first line contains the total count of elements.
  const elementCount = Number(inputLines[0]);

  // The second line contains space-separated numbers.
  // Parse these into an array of integers.
  const numericValues = rawInputString
    .split("\n")[1]
    .split(" ")
    .map(valStr => parseInt(valStr, 10));

  // Initialize a variable to accumulate a partial sum.
  let partialSum = 0;

  // Iterate backwards from (elementCount - 1) down to 1 (exclusive of 0).
  // This loop sums elements from index 1 up to (elementCount - 1).
  for (let reverseIndex = elementCount - 1; reverseIndex > 0; reverseIndex--) {
    partialSum += numericValues[reverseIndex];
  }

  // Calculate the average of the summed elements.
  // Assuming elementCount is greater than 1 to avoid division by zero.
  partialSum /= (elementCount - 1);

  // Initialize a variable to calculate a factorial.
  let calculatedFactorial = 1;

  // Calculate the factorial of (elementCount - 1).
  // Loop from 1 up to (elementCount - 1).
  for (let forwardIndex = 1; forwardIndex < elementCount; forwardIndex++) {
    calculatedFactorial *= forwardIndex;
  }

  // Compute the final result: (average * factorial) modulo primeModulo.
  // The console output is a critical part of the observable behavior.
  console.log((partialSum * calculatedFactorial) % primeModulo);
}

// Read input from standard input using Node.js 'fs' module
// and pass the UTF-8 decoded string to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
