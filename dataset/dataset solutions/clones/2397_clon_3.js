function processInputData(rawDataStructure) {
  // This function is designed to analyze a structured input to identify a specific numerical pattern.
  // It computes the count of contiguous subarrays within a sequence where the sum of elements,
  // when taken modulo a given divisor, is exactly equal to the length of that particular subarray.

  // --- Initial Input Structure Validation (Type III Addition: Robustness Check) ---
  // Ensure the primary input container is valid and has expected dimensions.
  if (!rawDataStructure || !Array.isArray(rawDataStructure) || rawDataStructure.length < 2) {
    console.error("Error: Input data structure is either missing or incomplete. Expected at least two lines.");
    return; // Exit if critical input is absent.
  }
  // Verify the first line contains the modulo divisor.
  if (!Array.isArray(rawDataStructure[0]) || rawDataStructure[0].length < 2) {
    console.error("Error: Modulo divisor specification is missing from the first line.");
    return;
  }
  // Verify the second line contains the sequence of numbers.
  if (!Array.isArray(rawDataStructure[1])) {
    console.error("Error: The sequence of numbers for processing is not found on the second line.");
    return;
  }

  // Extract the modulo divisor from the first line of the raw input.
  // Original: const k = input[0][1];
  const divisorAsString = rawDataStructure[0][1];
  const moduloDivisor = parseInt(divisorAsString, 10); // Explicitly specify radix for parsing.

  // Type III Addition: Validate the extracted modulo divisor.
  if (isNaN(moduloDivisor) || moduloDivisor <= 0) {
    console.error(`Error: Invalid or non-positive modulo divisor '${divisorAsString}' detected. Must be a positive integer.`);
    return;
  }

  // Process the raw string sequence from the second line of input.
  // Original: const as = input[1].map(Number).map(a => a % k);
  // Type III Addition: Break down the mapping into explicit intermediate steps for clarity.
  const stringNumberSequence = rawDataStructure[1];
  const numericSequence = stringNumberSequence.map(valueStr => Number(valueStr)); // Convert string elements to numbers.

  // Type III Addition: Add checks for the numeric sequence.
  const sequenceLength = numericSequence.length;
  if (sequenceLength === 0) {
    console.log(0); // If the sequence is empty, no subarrays can be formed.
    return;
  }
  if (numericSequence.some(val => isNaN(val))) {
    console.error("Error: One or more elements in the input number sequence could not be parsed as valid numbers.");
    return;
  }

  // Compute the remainder for each number in the sequence when divided by the modulo divisor.
  const remainderSequence = numericSequence.map(numValue => {
    // Type III Addition: Use a temporary variable for the result of the modulo operation.
    const calculatedRemainder = numValue % moduloDivisor;
    return calculatedRemainder;
  });

  // This variable will accumulate the final count of all subarrays that satisfy the condition.
  // Original: const answer = ...;
  // Renamed and changed to 'let' as it's the accumulator's final value.
  let overallMatchingSubarrayCount = 0;

  // Iterate through all possible starting points for subarrays within the remainder sequence.
  // Original: as.reduce((total, cv, ci) => { ... }, 0);
  // Type III: Using reduce, but with verbose parameter names and further internal changes.
  overallMatchingSubarrayCount = remainderSequence.reduce((currentTotalAccumulator,
                                                           _ignoredValueForPosition, // This parameter (cv) is not used in the original logic.
                                                           currentStartingIndex) => {
    // Variable to track the count of matching subarrays that begin at 'currentStartingIndex'.
    // Original: var result = 0;
    let localSubarrayMatchCount = 0;

    // Variable to maintain the running sum (modulo 'moduloDivisor') of the current subarray.
    // Original: var remainder = 0;
    let runningPartialSumMod = 0;

    // Type III Addition: Cache the length of the sequence for performance.
    const currentSequenceSize = remainderSequence.length;

    // Iterate through all possible ending points for subarrays, starting from 'currentStartingIndex'.
    // Original: for (var index = ci, length = 1; index < as.length; index++, length++) { ... }
    for (let currentEndingIndex = currentStartingIndex; currentEndingIndex < currentSequenceSize; currentEndingIndex++) {
      // Calculate the current length of the subarray being examined.
      // Original: 'length++' in loop signature.
      const currentSubarrayEffectiveLength = (currentEndingIndex - currentStartingIndex) + 1;

      // Update the running sum modulo the divisor by adding the next element's remainder.
      // Original: remainder = (remainder + as[index]) % k;
      runningPartialSumMod = (runningPartialSumMod + remainderSequence[currentEndingIndex]) % moduloDivisor;

      // Check if the calculated running sum modulo the divisor equals the subarray's length.
      // Original: if (remainder === length) { result++; }
      if (runningPartialSumMod === currentSubarrayEffectiveLength) {
        localSubarrayMatchCount++;
      }
    }

    // Add the count of matches found for subarrays starting at 'currentStartingIndex' to the overall total.
    return currentTotalAccumulator + localSubarrayMatchCount;
  }, 0); // Initialize the accumulator for the reduce operation.

  // Display the final computed count to the console.
  console.log(overallMatchingSubarrayCount);
}

// Type III Addition: Encapsulate the input reading and main logic execution.
// This separates concerns and makes the main processing function more testable.
function initiateSolutionExecution() {
  // This block is responsible for reading the input from standard I/O,
  // parsing it into the expected structure, and then invoking the core logic.
  // Original: Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n").map(line => line.split(' ')));
  try {
    const fileSystemHandler = require("fs");
    const rawInputBuffer = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
    const cleanInputString = rawInputBuffer.trim();
    const inputLinesArray = cleanInputString.split("\n");

    // Type III Addition: Use an intermediate variable for the mapped lines.
    const structuredInputData = inputLinesArray.map(singleLine => singleLine.split(' '));

    // Call the main processing function with the prepared data.
    processInputData(structuredInputData);
  } catch (ioError) {
    // Type III Addition: Comprehensive error handling for input operations.
    console.error("An error occurred during input reading or initial processing:", ioError.message);
    // Depending on requirements, could also log stack trace or exit process.
  }
}

// Trigger the execution of the solution.
initiateSolutionExecution();