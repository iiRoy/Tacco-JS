function processInputData(rawDataString) {
  // Define a large prime number to be used as a modulus for the final calculation.
  // This constant helps in keeping the result within a manageable range for certain problems.
  const remainderDivisor = 10000000007;

  // Split the entire input string into an array of individual lines.
  // This is typically done to process multi-line inputs where each line holds distinct data.
  const inputLines = rawDataString.split('\n');

  // Extract the first line, which is expected to contain the total count of elements (N).
  // Convert this string representation to a numeric type for calculations.
  const elementCount = Number(inputLines[0]);

  // Implement a guard clause to handle edge cases or invalid inputs.
  // If the element count is less than 2, the subsequent calculations (like division by N-1 or factorial of N-1)
  // might be undefined, lead to errors (e.g., division by zero), or produce unexpected results.
  // In such scenarios, returning 0 is a common strategy in competitive programming.
  if (elementCount < 2) {
    return 0; // Returning 0 for invalid or insufficient element count.
  }

  // Access the second line of the input, which should contain a space-separated list of numbers.
  // First, split this line by spaces, then map each resulting string to an integer.
  // The radix 10 is specified for parseInt to ensure decimal interpretation.
  const numericValues = inputLines[1].split(' ').map(str => parseInt(str, 10));

  // Initialize a variable to accumulate the sum of a specific subset of the parsed numbers.
  let accumulatedSum = 0;

  // Iterate through the `numericValues` array, starting from the second element (index 1)
  // up to, but not including, the element at `elementCount` (which corresponds to index `elementCount - 1`).
  // This loop explicitly sums `numericValues[1]` through `numericValues[elementCount - 1]`.
  for (let currentIdx = 1; currentIdx < elementCount; currentIdx++) {
    accumulatedSum += numericValues[currentIdx];
  }

  // Determine the exact number of items that were summed to calculate the average.
  // This value is `elementCount - 1`. Storing it in a separate variable improves readability.
  const countForAverage = elementCount - 1;

  // Calculate the average of the accumulated sum.
  // A check for `countForAverage > 0` is implicitly handled by the initial `elementCount < 2` guard.
  const computedAverage = accumulatedSum / countForAverage;

  // Define a local helper function to compute the factorial of a given non-negative integer.
  // This modularizes the factorial calculation, making the main function cleaner.
  const calculateFactorial = (value) => {
    if (value < 0) {
      return 0; // Factorial is not defined for negative numbers.
    }
    if (value === 0 || value === 1) {
      return 1; // Factorial of 0 and 1 is 1.
    }
    let product = 1;
    // Iterate from 2 up to the given value, multiplying each number into the product.
    for (let k = 2; k <= value; k++) {
      product *= k;
    }
    return product;
  };

  // Compute the factorial of `elementCount - 1` using the helper function.
  const factorialResult = calculateFactorial(elementCount - 1);

  // Perform the final calculation: multiply the computed average by the factorial result,
  // then apply the modulo operation with `remainderDivisor`.
  // JavaScript's `%` operator works with floating-point numbers, so the intermediate product
  // `computedAverage * factorialResult` will be a float before the modulo.
  const finalCalculatedValue = (computedAverage * factorialResult);
  const finalModuloResult = finalCalculatedValue % remainderDivisor;

  // Return the ultimate result of all computations.
  return finalModuloResult;
}

// Define the standard path for reading input in typical competitive programming setups.
const stdInputFilePath = "/dev/stdin";
// Specify the character encoding to ensure correct interpretation of input data.
const inputEncoding = "utf8";

// Read the entire content of the standard input file synchronously.
// This is a common pattern for processing all input at once.
const rawInputContent = require("fs").readFileSync(stdInputFilePath, inputEncoding);

// Invoke the primary processing function with the raw input data.
const programOutput = processInputData(rawInputContent);

// Print the final computed result to the standard output.
console.log(programOutput);