// Function to orchestrate the processing of raw input data
function processInputData(rawData) {
  // Define a constant for the large prime number used in modular arithmetic.
  // This value is crucial for specific mathematical operations or to keep results within a certain range.
  const primeDivisor = 10000000007;

  // Split the entire raw input string into an array of individual lines.
  // The expected format is N on the first line, followed by space-separated numbers on the second.
  const parsedLines = rawData.split("\n");

  // Implement a guard clause to ensure the input has the minimum required number of lines.
  // If not enough lines are provided, an error is logged, and the function terminates early.
  if (parsedLines.length < 2) {
    console.error("Input processing error: Not enough data lines supplied.");
    return; // Exit if the input structure is invalid
  }

  // Parse the first line to extract the total count of elements, converting it to an integer.
  // Explicitly using base 10 for robust parsing.
  const elementCount = Number.parseInt(parsedLines[0], 10);

  // Validate the parsed element count. It must be a positive integer for subsequent calculations to be meaningful.
  // If invalid, an error is logged, and the function exits.
  if (isNaN(elementCount) || elementCount <= 0) {
    console.error("Input processing error: Invalid or non-positive element count detected.");
    return;
  }

  // Define an internal helper function to parse a space-separated string of numbers into an array of integers.
  // This enhances code modularity and readability.
  const convertNumberStringToArray = (numberString) => {
    // Split the string by spaces, filter out any empty string segments (e.g., from multiple spaces),
    // and then map each valid string segment to its integer representation.
    return numberString.split(" ").filter(segment => segment !== '').map(segment => Number.parseInt(segment, 10));
  };

  // Utilize the helper function to parse the second line of input into an array of numeric values.
  const numericValues = convertNumberStringToArray(parsedLines[1]);

  // Initialize accumulator variables for the cumulative sum and a product sequence (akin to a factorial).
  // These variables will store intermediate results from the iteration.
  let cumulativeSum = 0;
  let productSequence = 1; // Start with 1 for multiplication

  // Conditional block to ensure the loop executes only if elementCount is greater than 1.
  // This prevents issues with array indexing and division by zero later.
  if (elementCount > 1) {
    // Iterate through a range of indices, typically starting from the second logical element.
    // The loop proceeds up to, but not including, the 'elementCount' value.
    for (let loopIndex = 1; loopIndex < elementCount; ++loopIndex) {
      // Before accessing the array, ensure the current loop index is within the bounds of 'numericValues'.
      // This is a defensive programming measure against malformed input.
      if (loopIndex < numericValues.length) {
        cumulativeSum += numericValues[loopIndex];
      } else {
        // Log a warning if the array is shorter than expected, indicating potential data inconsistency.
        console.warn(`Data integrity warning: 'numericValues' array unexpectedly short at index ${loopIndex}.`);
      }
      // Update the product sequence by multiplying it with the current loop index.
      productSequence *= loopIndex;
    }
  } else {
    // If 'elementCount' is 1 or less, the loop logic won't apply, and subsequent division might fail.
    console.warn("Calculation warning: 'elementCount' is too small for the iterative process.");
  }

  // Calculate the denominator for the averaging component.
  // This is 'elementCount - 1', which needs careful handling to avoid division by zero.
  const divisorForAverage = elementCount - 1;

  let finalComputedValue = 0; // Initialize the variable for the result before modulo.

  // Implement a robust check to prevent division by zero, which would lead to NaN or Infinity.
  if (divisorForAverage !== 0) {
    // Compute the average component: cumulative sum divided by the valid divisor.
    const averageComponent = cumulativeSum / divisorForAverage;

    // Multiply the average component by the accumulated product sequence.
    finalComputedValue = averageComponent * productSequence;
  } else {
    // If division by zero is unavoidable, log an error and set the intermediate result to a default.
    console.error("Mathematical error: Attempted division by zero for the average calculation.");
    // 'finalComputedValue' remains 0 as initialized, or could be set to another specific error value.
  }

  // Apply the modulo operation to the final computed value using the 'primeDivisor'.
  // The expression `(value % modulus + modulus) % modulus` ensures a positive result for the modulo operation,
  // which is good practice even if 'finalComputedValue' is expected to be positive.
  const modularResult = (finalComputedValue % primeDivisor + primeDivisor) % primeDivisor;

  // Output the ultimate calculated modular result to the console.
  console.log(modularResult);
}

// Main execution block: Reads input synchronously from standard input and passes it to the processing function.
// This setup is common for command-line utilities or competitive programming environments.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));