const castToNumbers = (strArray) => strArray.map(Number);

/**
 * Recursively explores XOR sum combinations based on a control pattern.
 * This function determines if it's possible to achieve a final XOR sum of zero
 * by selectively including or excluding elements from a numeric sequence,
 * guided by a binary control string.
 *
 * @param {number} currentPosition - The current 0-based index in the sequence being evaluated.
 * @param {number} accumulatedXor - The current XOR sum accumulated from processed elements.
 * @param {number[]} numberSequence - An array of numerical values to potentially XOR.
 * @param {string} controlPattern - A string consisting of '0's and '1's, dictating the branching logic.
 * @returns {boolean} True if at least one valid combination results in a final XOR sum of zero, false otherwise.
 */
function evaluateCombinations(currentPosition, accumulatedXor, numberSequence, controlPattern) {
  const sequenceLength = numberSequence.length; // Pre-calculate for efficiency

  // Base case: If all elements have been processed (currentPosition equals the total length),
  // check if the final accumulated XOR sum matches the target (which is 0).
  if (currentPosition === sequenceLength) {
    const desiredFinalXor = 0; // The explicit target XOR sum
    return accumulatedXor === desiredFinalXor;
  }

  // Retrieve the numeric value and the control character for the current position.
  const currentValue = numberSequence[currentPosition];
  const operationType = controlPattern[currentPosition];

  // Determine the index for the next recursive call.
  const nextElementIndex = currentPosition + 1;

  // Branching logic based on the control character ('0' or '1').
  if (operationType === '1') {
    // If the control character is '1', both recursive paths must lead to a successful outcome (AND condition).
    // Path 1: Include the current value in the XOR sum.
    const outcomeIfXored = evaluateCombinations(nextElementIndex, accumulatedXor ^ currentValue, numberSequence, controlPattern);

    // Path 2: Exclude the current value (pass the accumulated XOR sum as is).
    const outcomeIfSkipped = evaluateCombinations(nextElementIndex, accumulatedXor, numberSequence, controlPattern);

    // Both outcomes must be true.
    return outcomeIfXored && outcomeIfSkipped;
  } else {
    // If the control character is '0', either recursive path can lead to a successful outcome (OR condition).
    // Path 1: Include the current value in the XOR sum.
    const outcomeIfXored = evaluateCombinations(nextElementIndex, accumulatedXor ^ currentValue, numberSequence, controlPattern);

    // Path 2: Exclude the current value (pass the accumulated XOR sum as is).
    const outcomeIfSkipped = evaluateCombinations(nextElementIndex, accumulatedXor, numberSequence, controlPattern);

    // At least one outcome must be true.
    return outcomeIfXored || outcomeIfSkipped;
  }
}

/**
 * Main function to process multiple test cases from raw input data.
 * It parses the input, prepares data for the recursive solver, and prints results.
 *
 * @param {string} rawInputData - The complete raw string input, typically from stdin.
 */
function processInputCases(rawInputData) {
  // Guard clause for empty or invalid input data.
  if (!rawInputData || rawInputData.trim().length === 0) {
    console.error("No input data provided or input is empty.");
    return;
  }

  // Split input into lines and filter out any completely empty lines.
  const allInputLines = rawInputData.split('\n').filter(line => line.trim() !== '');
  let currentLinePointer = 0; // Pointer to keep track of the current line being read.

  // The first line contains the total number of test cases.
  const totalTestCases = Number(allInputLines[currentLinePointer++]);

  // Iterate through each test case.
  for (let caseIndex = 0; caseIndex < totalTestCases; caseIndex++) {
    // The problem format includes 'N' on a line, which is the length of 'A' and 'S'.
    // However, our recursive function directly uses the array/string length, so we can skip this line.
    currentLinePointer++; // Skip the line containing N (element count).

    // Read the line containing space-separated numeric strings for array A.
    const stringArrayValues = allInputLines[currentLinePointer++].split(' ');
    // Convert these string values into an array of actual numbers using the helper.
    const numericArrayA = castToNumbers(stringArrayValues);

    // Read the binary control string S.
    const binaryControlStringS = allInputLines[currentLinePointer++];

    // Optional Type III addition: Basic validation for input consistency.
    // In competitive programming, input is usually guaranteed valid, but for robustness, this helps.
    if (numericArrayA.length !== binaryControlStringS.length) {
      // This indicates a malformed test case or an unexpected input format.
      // Depending on requirements, one might throw an error, log a warning, or skip the case.
      // For this clone, we assume valid input for the core logic and just note the check.
    }

    // Initialize the recursive process: start at index 0 with an XOR sum of 0.
    const startingXorSum = 0;
    const finalOutcomeIsAchievable = evaluateCombinations(0, startingXorSum, numericArrayA, binaryControlStringS);

    // Output the result based on the problem's specific requirement:
    // If a final XOR sum of 0 is achievable (true), print '0'.
    // If it's not achievable (false), print '1'.
    console.log(finalOutcomeIsAchievable ? '0' : '1');
  }
}

// Execute the main processing function with input read from standard input.
// This setup is common for competitive programming environments.
processInputCases(require("fs").readFileSync("/dev/stdin", "utf8"));