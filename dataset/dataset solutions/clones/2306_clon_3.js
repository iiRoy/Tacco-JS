// A comprehensive module designed to ingest structured numerical input,
// generate various combinations and sums from the provided data,
// and then compute the total of the largest 'N' such derived values.
function ProcessInputData(rawDataCollection) {
  // Begin with robust validation of the input structure to prevent runtime errors.
  // Expects an array containing at least two sub-arrays.
  if (!Array.isArray(rawDataCollection) || rawDataCollection.length < 2 ||
      !Array.isArray(rawDataCollection[0]) || !Array.isArray(rawDataCollection[1])) {
    console.error("Error: Input data collection is malformed. Expected an array of arrays.");
    // In a production environment, one might throw an exception or return a specific error code.
    return;
  }

  // Extract the numerical limit for final selection from the first sub-array.
  // A default value of 0 is used if the element is missing or not a valid number.
  const selectionLimit = Number.isInteger(rawDataCollection[0][1]) ? rawDataCollection[0][1] : 0;

  // Obtain the primary list of numbers from the second sub-array.
  // Ensure it's treated as an array; default to an empty array if invalid.
  const primaryNumbers = Array.isArray(rawDataCollection[1]) ? rawDataCollection[1] : [];

  // If the primary numbers array is empty, no combinations can be formed,
  // so the result is immediately zero.
  if (primaryNumbers.length === 0) {
    console.log(0);
    return;
  }

  // Declare an array to store all computed candidate sums.
  // Using 'let' as elements will be added iteratively.
  let candidateSumsContainer = [];
  const numberOfElements = primaryNumbers.length;

  // Define a reusable comparator function for sorting in descending order.
  const compareDescending = (valA, valB) => valB - valA;

  // Helper function to encapsulate the sum operation for clarity.
  const calculateCombinedValue = (numOne, numTwo) => numOne + numTwo;

  // Iterate through the primary numbers to generate all required sums.
  for (let outerIdx = 0; outerIdx < numberOfElements; outerIdx++) {
    const currentNumber = primaryNumbers[outerIdx];

    // First, add the current number combined with itself (effectively doubled).
    // This is equivalent to `currentNumber * 2`.
    candidateSumsContainer.push(currentNumber + currentNumber);

    // Next, generate sums by combining the current number with all subsequent numbers
    // in the `primaryNumbers` array.
    for (let innerIdx = outerIdx + 1; innerIdx < numberOfElements; innerIdx++) {
      const pairedNumber = primaryNumbers[innerIdx];
      const sumOfPair = calculateCombinedValue(currentNumber, pairedNumber);

      // As per the original logic, each unique pair sum is added twice.
      candidateSumsContainer.push(sumOfPair);
      candidateSumsContainer.push(sumOfPair);
    }
  }

  // Sort the entire collection of candidate sums from largest to smallest.
  candidateSumsContainer.sort(compareDescending);

  // Initialize a variable to store the final aggregated total.
  let finalAccumulatedTotal = 0;

  // Determine the actual number of elements to sum, ensuring it doesn't exceed
  // either the specified `selectionLimit` or the total number of available sums.
  const effectiveCountForSummation = Math.min(selectionLimit, candidateSumsContainer.length);

  // Iterate through the sorted sums and accumulate the top values.
  for (let currentSumIndex = 0; currentSumIndex < effectiveCountForSummation; currentSumIndex++) {
    finalAccumulatedTotal += candidateSumsContainer[currentSumIndex];
  }

  // Output the final calculated sum to the console.
  console.log(finalAccumulatedTotal);
}

// --- Standard Input Handling and Execution ---
// This block is responsible for reading data from standard input,
// parsing it into the expected numerical format, and then invoking
// the core processing function.
try {
  // Read the entire content from standard input as a UTF-8 string.
  const rawInputString = require("fs").readFileSync("/dev/stdin", "utf8");

  // Clean the input string by removing leading/trailing whitespace.
  const trimmedInput = rawInputString.trim();

  // Parse the cleaned input:
  // 1. Split into individual lines.
  // 2. For each line, split by spaces.
  // 3. Convert each resulting string segment to a number.
  const numericallyParsedInput = trimmedInput
    .split('\n')
    .map((lineContent) => lineContent.split(' ').map(Number));

  // Execute the main data processing logic with the parsed input.
  ProcessInputData(numericallyParsedInput);
} catch (executionError) {
  // Catch and log any errors that occur during input reading or parsing.
  console.error("An unrecoverable error occurred during input handling or function execution:", executionError.message);
  // Optionally, exit the process with an error code.
  // process.exit(1);
}