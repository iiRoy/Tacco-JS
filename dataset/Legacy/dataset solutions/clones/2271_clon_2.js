function processInput(rawData) {
  // Define the modulo value for the final calculation
  let moduloVal = 10000000007;

  // This variable is declared but not used in the original logic.
  // It's kept for structural equivalence.
  let tempVar = 0;

  // Split the raw input string into an array of lines
  const linesArray = rawData.split("\n");

  // Parse the first line to get the count of elements
  const countElements = Number(linesArray[0]);

  // Parse the second line, split by space, and convert to an array of integers
  const numberSequence = linesArray[1]
    .split(" ")
    .map(numStr => parseInt(numStr, 10));

  // Initialize variables for sum and factorial calculation
  let totalSum = 0;
  let productFactorial = 1;

  // Loop through the number sequence starting from the second element
  // (index 1) up to, but not including, countElements.
  for (let idx = 1; idx < countElements; idx++) {
    // Accumulate the sum of elements from index 1 onwards
    totalSum += numberSequence[idx];
    // Calculate the factorial of the loop index
    productFactorial *= idx;
  }

  // Perform the final calculation and print the result to the console.
  // The calculation is: ((sum / (N - 1)) * factorial) % mod
  console.log(((totalSum / (countElements - 1)) * productFactorial) % moduloVal);
}

// Read input from standard input and pass it to the main processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
