function processInput(rawData) {
  // Define a large prime number for modulo operations
  let moduloValue = 10000000007;

  // A temporary variable, currently unused but part of the original structure
  let tempVar = 0;

  // Split the raw input string into an array of lines
  const linesArray = rawData.split("\n");

  // Parse the first line to get the count of elements
  const countElements = Number(linesArray[0]);

  // Process the second line: split by space, then convert to integers
  const numericValues = rawData
    .split("\n")[1]
    .split(" ")
    .map(numStr => parseInt(numStr, 10));

  // Output the parsed array of numbers
  console.log(numericValues);

  // Initialize variables for sum and factorial calculation
  let totalSum = 0;
  let productFactorial = 1;

  // Loop through the numeric values starting from the second element (index 1)
  for (let idx = 1; idx < countElements; idx++) {
    // Add the current number to the running total
    totalSum += numericValues[idx];
    // Log the current sum after each addition
    console.log(totalSum);
    // Multiply the factorial by the current loop index
    productFactorial *= idx;
  }

  // Calculate and log the intermediate result: (sum / (N - 1)) * factorial
  console.log((totalSum / (countElements - 1)) * productFactorial);

  // Calculate and log the final result, applying the modulo operation
  console.log(((totalSum / (countElements - 1)) * productFactorial) % moduloValue);
}

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
