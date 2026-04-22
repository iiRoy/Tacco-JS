// This function serves as the primary entry point for processing numerical data.
// It reads raw input, parses relevant parameters, performs a specific calculation,
// and outputs the result, applying a modulo operation at the end.
function processComputationalTask(rawInputPayload) {
  // Define a constant for the modulo operation to be applied to the final result.
  const resultModulus = 10000000007; // A large prime number often used in competitive programming.

  // --- Input Validation and Parsing (Type III additions) ---

  // Basic validation: Check if the input payload is valid and not empty.
  if (!rawInputPayload || typeof rawInputPayload !== 'string' || rawInputPayload.trim() === '') {
    console.error("ERROR: Received an empty or invalid input payload. Cannot proceed with computation.");
    // In a production environment, an exception might be thrown. For competitive programming,
    // returning a default value (like 0) or NaN might be expected for invalid input.
    return; // Exit early.
  }

  // Split the entire input string into an array of lines.
  const inputLinesArray = rawInputPayload.split('\n');

  // Ensure that there are at least two lines in the input: one for the count (N) and one for the numbers.
  if (inputLinesArray.length < 2) {
    console.error("ERROR: Input payload contains insufficient lines. Expected at least two lines (count and numbers).");
    return; // Exit early.
  }

  // Parse the total number of elements (N) from the first line of the input.
  // Using parseInt with radix 10 ensures correct conversion.
  const totalElementsCount = parseInt(inputLinesArray[0], 10);

  // Validate the parsed element count. It must be a non-negative integer.
  if (isNaN(totalElementsCount) || totalElementsCount < 0) {
    console.error(`ERROR: Invalid or non-numeric element count detected: '${inputLinesArray[0]}'.`);
    return; // Exit early.
  }

  // Parse the sequence of numeric values from the second line.
  // Split by space, filter out any empty strings (e.g., from multiple spaces),
  // and then map each string to an integer.
  const numericSequence = inputLinesArray[1]
    .split(' ')
    .filter(strValue => strValue.trim() !== '') // Robustly handle multiple spaces or leading/trailing spaces
    .map(strValue => parseInt(strValue, 10));

  // Validate the parsed numeric sequence to ensure all elements are valid numbers.
  if (numericSequence.some(isNaN)) {
    console.error("ERROR: One or more values within the numeric sequence are not valid numbers.");
    return; // Exit early.
  }

  // --- Core Computation Initialization ---

  // Initialize a variable to accumulate the sum of relevant numbers.
  let partialSum = 0;
  // Initialize a variable to calculate the product of indices (effectively a factorial).
  // Starts at 1 because 0! = 1 and 1! = 1, suitable for multiplicative accumulation.
  let sequentialProduct = 1;

  // Determine the upper bound for the loop, which is (N - 1).
  // This value is used multiple times, so storing it in a constant improves readability.
  const loopUpperBound = totalElementsCount - 1;

  // --- Edge Case Handling (Type III addition) ---

  // Handle cases where totalElementsCount is 0 or 1.
  // If N=0 or N=1, then (N-1) is 0 or less. The loop will not execute,
  // and division by zero would occur in the final calculation.
  // The original code would output NaN for N=1. We explicitly replicate this behavior.
  if (loopUpperBound <= 0) {
    console.log(NaN); // Matches original behavior for N=1: (0 / 0) * 1 % mod -> NaN
    return; // Exit after printing NaN.
  }

  // --- Iterative Calculation ---

  // Loop through the relevant portion of the numeric sequence.
  // The loop starts from index 1 and goes up to (totalElementsCount - 1).
  // Note: numericSequence[0] is intentionally ignored in the sum.
  for (let currentIterationIndex = 1; currentIterationIndex <= loopUpperBound; currentIterationIndex++) {
    // Guard against potential out-of-bounds access if the numeric sequence is shorter than expected.
    if (currentIterationIndex >= numericSequence.length) {
      console.warn(`WARNING: Numeric sequence is shorter than indicated by 'totalElementsCount'. ` +
                   `Attempted to access index ${currentIterationIndex}, but sequence length is ${numericSequence.length}. ` +
                   `Stopping calculation prematurely.`);
      break; // Exit the loop if an invalid index is encountered.
    }
    // Add the current number to the cumulative sum.
    partialSum += numericSequence[currentIterationIndex];

    // Multiply the sequential product by the current index.
    // This calculates (N-1)! for N > 1.
    sequentialProduct *= currentIterationIndex;
  }

  // --- Final Result Calculation ---

  // The divisor for calculating the average is (N - 1).
  const divisorTerm = totalElementsCount - 1; // This is identical to loopUpperBound.

  // Calculate the average component: sum of elements from index 1 to N-1, divided by (N-1).
  const averageComponent = partialSum / divisorTerm;

  // Multiply the calculated average by the sequential product ((N-1)!).
  const intermediateResult = averageComponent * sequentialProduct;

  // Apply the modulo operation to the intermediate result to get the final output.
  const finalOutput = intermediateResult % resultModulus;

  // Output the computed final result.
  console.log(finalOutput);
}

// --- Input Acquisition Helper (Type III addition) ---

// Helper function to safely acquire input data from standard input.
function acquireStandardInput() {
  try {
    // Node.js specific: Read the entire content of standard input as a UTF-8 string.
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    return fileContent;
  } catch (error) {
    // Log an error if reading from stdin fails (e.g., file not found, permissions).
    console.error("FATAL ERROR: Unable to read input from /dev/stdin. Details:", error.message);
    return null; // Indicate failure to acquire input.
  }
}

// --- Execution Flow ---

// Acquire the raw input data.
const standardInputData = acquireStandardInput();

// If input data was successfully acquired, proceed with the computational task.
if (standardInputData !== null) {
  processComputationalTask(standardInputData);
}