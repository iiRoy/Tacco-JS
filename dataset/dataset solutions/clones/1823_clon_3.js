console.log((function() {
  // Helper function to safely parse string values into integers.
  // This adds robustness by explicitly using Number() and Math.floor(),
  // and could be extended for error handling, though for this problem
  // we assume well-formed numeric input where applicable.
  const convertToNumericValue = (textualRepresentation) => {
    const parsedNumber = Number(textualRepresentation);
    // If the conversion results in NaN, we might want to throw an error
    // or return a default value based on requirements. For this context,
    // we assume valid numeric input that won't produce NaN for the core logic.
    if (isNaN(parsedNumber)) {
      // Potentially log an error or return a specific error code/value.
      // For now, returning 0 as a fallback for non-numeric input,
      // though the main logic's validations should catch most issues.
      return 0;
    }
    return Math.floor(parsedNumber); // Ensure integer value
  };

  // --- Input Acquisition ---
  // Read the entire content from the standard input file as a UTF-8 string.
  const fullInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

  // --- Initial Input Validation and Preprocessing ---
  // Check if the input buffer is empty after trimming whitespace.
  if (!fullInputBuffer || fullInputBuffer.trim().length === 0) {
    // If no meaningful input is provided, return an error message.
    return "Input Processing Error: No data received or data is empty.";
  }

  // Split the raw input string into an array of individual lines.
  // Trim each line and filter out any lines that are empty after trimming.
  const individualInputLines = fullInputBuffer
                                 .trim()
                                 .split('\n')
                                 .filter(line => line.trim().length > 0);

  // Ensure there's at least one line (for the count of entries).
  if (individualInputLines.length === 0) {
    return "Input Processing Error: No valid lines found after filtering.";
  }

  // --- Extracting Configuration and Data ---
  // The first line contains the total number of data pairs.
  // We only care about the first number on this line.
  const entryCountString = individualInputLines[0].split(' ')[0];
  const totalPairCount = convertToNumericValue(entryCountString);

  // Validate the parsed entry count.
  if (totalPairCount <= 0) {
    return "Configuration Error: The number of entries must be a positive integer.";
  }
  // Validate that the number of data lines matches the declared count.
  // (individualInputLines.length - 1) because the first line is the count itself.
  if (individualInputLines.length - 1 < totalPairCount) {
    return `Configuration Error: Declared ${totalPairCount} data pairs, but found only ${individualInputLines.length - 1} actual data lines.`;
  }

  // Initialize two separate arrays to hold the first and second components
  // of each data pair, respectively. These are renamed for clarity.
  const firstComponentValues = [];  // Corresponds to the original 'A'
  const secondComponentValues = []; // Corresponds to the original 'B'

  // Iterate through the data lines, starting from the second line (index 1),
  // up to the total number of pairs specified.
  for (let lineIndex = 0; lineIndex < totalPairCount; ++lineIndex) {
    const currentPairLine = individualInputLines[1 + lineIndex]; // +1 to skip the count line.
    const stringSegments = currentPairLine.split(' ');

    // Basic validation for the format of each data pair line.
    if (stringSegments.length < 2) {
      return `Data Format Error: Line ${lineIndex + 2} ("${currentPairLine}") does not contain two numeric components.`;
    }

    // Parse and push the two components into their respective arrays.
    firstComponentValues.push(convertToNumericValue(stringSegments[0]));
    secondComponentValues.push(convertToNumericValue(stringSegments[1]));
  }

  // --- Core Logic: Sorting and Calculation ---

  // Sort both arrays numerically in ascending order.
  // This is a critical step for correctly identifying the median-related elements.
  firstComponentValues.sort((val1, val2) => val1 - val2);
  secondComponentValues.sort((val1, val2) => val1 - val2);

  let finalComputationResult; // Variable to hold the result of the calculation.

  // The calculation logic depends on whether the total number of pairs is odd or even.
  if (totalPairCount % 2 !== 0) {
    // Case 1: The total number of entries is odd.
    // The median index is simply (N-1)/2.
    const centralMedianIndex = (totalPairCount - 1) / 2;

    // The result is the difference between the median second component
    // and the median first component, plus one.
    finalComputationResult = secondComponentValues[centralMedianIndex] -
                             firstComponentValues[centralMedianIndex] + 1;
  } else {
    // Case 2: The total number of entries is even.
    // For even counts, we consider the two middle elements.
    // The "right" median index is N/2, and the "left" median index is (N/2) - 1.
    const medianRightPosition = totalPairCount / 2;
    const medianLeftPosition = medianRightPosition - 1;

    // The calculation involves summing the two middle second components,
    // summing the two middle first components, then finding their difference, and adding one.
    // This expression is grouped to enhance readability.
    finalComputationResult = (secondComponentValues[medianRightPosition] +
                              secondComponentValues[medianLeftPosition]) -
                             (firstComponentValues[medianRightPosition] +
                              firstComponentValues[medianLeftPosition]) + 1;
  }

  // Return the final computed result.
  return finalComputationResult;

})()); // Immediately Invoked Function Expression (IIFE) to encapsulate the logic.