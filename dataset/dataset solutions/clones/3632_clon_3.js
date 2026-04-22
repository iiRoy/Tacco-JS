// This program identifies and counts the number of contiguous subarrays within a given
// sequence of integers whose sum is perfectly divisible by a specified modulus M.
// It employs a technique based on prefix sums and frequency mapping of remainders.

// Function to process the input string and compute the desired count.
function computeDivisibleSubarrayCount(rawInputContent) {
  // --- Input Validation and Parsing (Type III: Added Fragments, Rewrites) ---
  if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
    // In a production scenario, one might log an error or throw an exception.
    // For competitive programming, often a default or zero is returned.
    return 0;
  }

  // Split the raw input into individual lines, discarding any empty lines
  // that might result from trailing newlines or malformed input.
  const inputLines = rawInputContent.split('\n').filter(line => line.trim().length > 0);

  // The first line contains the array length (N) and the divisor (M).
  // Parse these values, ensuring they are integers.
  const sizeAndDivisorStrings = inputLines[0].split(' ');
  const arraySizeN = parseInt(sizeAndDivisorStrings[0], 10);
  const modulusM = parseInt(sizeAndDivisorStrings[1], 10);

  // Perform basic validation on the parsed numerical parameters.
  if (isNaN(arraySizeN) || isNaN(modulusM) || arraySizeN < 0 || modulusM <= 0) {
    // Invalid parameters would make the problem ill-defined or lead to errors.
    return 0;
  }

  // The second line contains the space-separated integer elements of the array.
  // Convert these string representations into an array of numbers.
  const dataElements = inputLines[1].split(' ').map(str => parseInt(str, 10));

  // A minor consistency check: ensure the actual number of elements matches N.
  // In competitive programming, inputs usually adhere strictly, but this is a Type III addition.
  if (dataElements.length !== arraySizeN) {
    // Depending on requirements, one might truncate, pad, or throw an error.
    // For this problem, we proceed with the provided `arraySizeN` for iteration.
    // If `dataElements.length` is less than `arraySizeN`, loop will stop early.
    // If `dataElements.length` is more, extra elements will be ignored by loop.
  }

  // --- Core Logic Initialization (Type II: Renaming, Type III: Using Map) ---
  // This variable will store the final count of subarrays whose sum is divisible by M.
  let matchingSubarrayCount = 0;

  // A Map is used to efficiently store and retrieve the frequencies of
  // prefix sum remainders modulo M. Keys are remainders, values are their counts.
  // Using Map provides clearer type handling for keys compared to a plain object.
  const remainderFrequencyTracker = new Map();

  // The running sum of elements modulo M. It starts at 0 for an empty prefix.
  let currentPrefixSumModulo = 0;

  // --- First Pass: Calculate Prefix Sums and Frequencies (Type II & III) ---
  // Iterate through each element of the input data array.
  for (let elementIdx = 0; elementIdx < arraySizeN; ++elementIdx) {
    const valueAtIndex = dataElements[elementIdx];

    // Ensure the current element is a valid number before processing.
    if (isNaN(valueAtIndex)) {
      // Skip invalid elements; a Type III robustness addition.
      continue;
    }

    // Update the current prefix sum modulo M.
    // The result of the modulo operator in JavaScript can be negative for negative dividends.
    // Assuming non-negative inputs, `(a + b) % n` is safe.
    currentPrefixSumModulo = (currentPrefixSumModulo + valueAtIndex) % modulusM;

    // Increment the frequency count for the current remainder.
    // If the remainder hasn't been seen before, initialize its count to 0 then increment.
    remainderFrequencyTracker.set(
      currentPrefixSumModulo,
      (remainderFrequencyTracker.get(currentPrefixSumModulo) || 0) + 1
    );
  }

  // --- Second Pass: Compute Total Subarray Count (Type II & III: Refactoring) ---
  // Helper function to calculate combinations (nC2) or (nC2 + n).
  // This is a Type III addition for code clarity and modularity.
  const calculateCombinationCount = (count, includeSingleElements = false) => {
    if (count <= 0) {
      return 0;
    }
    if (includeSingleElements) {
      // For remainder 0: count * (count + 1) / 2
      // This covers both individual prefix sums that are 0 (subarrays from index 0)
      // and pairs of prefix sums that are 0 (subarrays between indices).
      return count * (count + 1) / 2;
    } else {
      // For non-zero remainders: count * (count - 1) / 2
      // This only covers pairs of prefix sums that have the same non-zero remainder.
      // If count is 1, this correctly yields 0.
      return count * (count - 1) / 2;
    }
  };

  // Iterate over each unique remainder and its corresponding frequency stored in the map.
  for (const [remainderKey, frequency] of remainderFrequencyTracker.entries()) {
    // If the current remainder is 0, it means the prefix sum itself is divisible by M.
    // In this case, each occurrence contributes to a subarray starting from index 0,
    // in addition to forming pairs with other 0-remainder prefix sums.
    if (remainderKey === 0) {
      matchingSubarrayCount += calculateCombinationCount(frequency, true);
    } else {
      // For any non-zero remainder, we are only interested in pairs of prefix sums
      // that yield the same remainder. The difference between such prefix sums
      // will be divisible by M.
      matchingSubarrayCount += calculateCombinationCount(frequency, false);
    }
  }

  // The final accumulated count is the result.
  return matchingSubarrayCount;
}

// --- Execution Entry Point (Type II & III: Renaming, Try-Catch, Explicit Vars) ---
// This block handles reading input from standard input and printing the output.
// It's wrapped in a try-catch for robustness against potential I/O errors.
try {
  // Use the Node.js 'fs' (file system) module to read input.
  const fileSystemUtility = require("fs");
  const standardInputFilePath = "/dev/stdin"; // Standard path for input in many environments.
  const textEncoding = "utf8"; // Specify character encoding for input data.

  // Read the entire content of the standard input file synchronously.
  const fullInputData = fileSystemUtility.readFileSync(standardInputFilePath, textEncoding);

  // Call the main processing function with the gathered input.
  const finalCalculatedResult = computeDivisibleSubarrayCount(fullInputData);

  // Output the computed result to standard output.
  console.log(finalCalculatedResult);

} catch (executionError) {
  // If any error occurs during input reading or initial processing,
  // log it (for debugging) and potentially output a default value or error code.
  // console.error("An operational error occurred:", executionError.message);
  console.log(0); // A common practice in competitive programming for error cases.
}