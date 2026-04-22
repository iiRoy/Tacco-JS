// Function to analyze numerical sequence data.
// This processes raw input to determine frequencies of numbers within a specified range.
function ProcessNumericalSequence(dataPayload) {
  // Ensure the input payload is a string and not empty after trimming.
  // This serves as an initial guard clause for malformed input.
  if (typeof dataPayload !== 'string' || dataPayload.trim() === '') {
    // In a production environment, one might throw an error or return a specific status.
    // For this context, we'll simply exit or return undefined.
    return;
  }

  // Divide the entire data block into individual lines for structured processing.
  const inputRows = dataPayload.split('\n');

  // Extract the numerical upper bound for counting from the first line.
  // Use parseInt with radix 10 for reliable integer conversion.
  // Include a validation step to handle non-numeric or invalid boundary values.
  let upperBoundValue = parseInt(inputRows[0], 10);
  if (isNaN(upperBoundValue) || upperBoundValue <= 0) {
    // If the parsed value is invalid, set a default or minimal valid boundary.
    // This prevents potential errors like infinite loops or array out-of-bounds access.
    upperBoundValue = 1;
  }

  // Retrieve the sequence of string values from the second input line.
  // Filter out any empty string tokens that might arise from multiple spaces.
  const valueTokens = inputRows[1].split(' ').filter(token => token !== '');

  // Convert the string tokens into an array of integers.
  // The original problem processes 'N-1' elements from the input array.
  // We replicate this behavior using `slice`.
  // Further filter out any elements that failed to convert to a number (e.g., non-numeric strings).
  const numericObservations = valueTokens
    .slice(0, upperBoundValue - 1) // Adheres to the original logic of processing N-1 elements.
    .map(str => parseInt(str, 10))
    .filter(num => !isNaN(num)); // Ensures only valid numbers are included in the observation set.

  // Instead of sorting a large array and then scanning it multiple times,
  // we optimize by building a frequency map (hash map). This is a core Type III algorithmic change.
  // This map will store each unique number as a key and its count as the value.
  const frequencyMap = new Map();
  for (const obs of numericObservations) {
    // For each observed number, increment its count in the map.
    // If the number is encountered for the first time, its count is initialized to 0 before incrementing.
    frequencyMap.set(obs, (frequencyMap.get(obs) || 0) + 1);
  }

  // Iterate from 1 up to the `upperBoundValue` (inclusive).
  // For each number in this range, retrieve its frequency from the pre-computed map.
  // This replaces the sequential scan of a sorted array with efficient hash map lookups.
  for (let currentNumber = 1; currentNumber <= upperBoundValue; currentNumber++) {
    // Fetch the occurrence count for the current number.
    // If the number was not present in the `numericObservations`, its count defaults to 0.
    const occurrences = frequencyMap.get(currentNumber) || 0;
    // Output the calculated frequency to the console.
    console.log(occurrences);
  }
}

// This section serves as the execution entry point for the script.
// It reads the entire content of standard input (typically from a file or piped data)
// and passes it to our main processing function.
ProcessNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));