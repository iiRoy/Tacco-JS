var _internalTools = _internalTools || {};

// Helper to safely define properties on objects.
// Simplified from the original's specific `Array.prototype` / `Object.prototype` checks.
_internalTools._assignProperty = function(targetObjectRef, propertyIdentifier, propertyConfig) {
  if (typeof Object.defineProperty === "function") {
    Object.defineProperty(targetObjectRef, propertyIdentifier, propertyConfig);
  } else {
    // Basic fallback for environments without Object.defineProperty.
    targetObjectRef[propertyIdentifier] = propertyConfig.value;
  }
};

// Utility to determine the global execution context (window for browsers, global for Node.js).
_internalTools._obtainGlobalObject = function(currentExecutionScope) {
  if (typeof window !== "undefined" && window === currentExecutionScope) {
    return currentExecutionScope;
  }
  if (typeof global !== "undefined" && global !== null) {
    return global;
  }
  return currentExecutionScope; // Default to current scope if others not found.
};

// Store the determined global context within our utility namespace.
_internalTools._runtimeContext = _internalTools._obtainGlobalObject(this);


// Main function encapsulating the problem's logic.
function processNumericalSequence(rawInputText) {
  // Guard clause: Ensure input is a non-empty string.
  if (!rawInputText || typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
    console.log("NO_INPUT_PROVIDED");
    return;
  }

  // Split the input into individual lines and filter out any blank lines.
  const inputDataLines = rawInputText.split("\n").filter(line => line.trim().length > 0);

  // Guard clause: Check if we have enough lines (at least two: length and sequence).
  if (inputDataLines.length < 2) {
    console.log("INSUFFICIENT_INPUT_LINES");
    return;
  }

  // Parse the sequence length from the first line.
  const sequenceLengthString = inputDataLines[0].trim();
  const actualSequenceLength = parseInt(sequenceLengthString, 10);

  // Guard clause: Validate the parsed sequence length.
  if (isNaN(actualSequenceLength) || actualSequenceLength <= 0) {
    console.log("INVALID_SEQUENCE_LENGTH");
    return;
  }

  // Split the second line into string representations of numbers.
  const rawNumbersLine = inputDataLines[1].trim();
  const stringNumberTokens = rawNumbersLine.split(/\s+/); // Split by one or more whitespace characters.

  // Guard clause: Check if the number of provided elements matches the declared length.
  if (stringNumberTokens.length !== actualSequenceLength) {
    console.log("ELEMENT_COUNT_MISMATCH");
    return;
  }

  const originalValueSequence = [];
  // Populate the array with parsed integer values.
  for (let elementIndex = 0; elementIndex < actualSequenceLength; ++elementIndex) {
    const parsedNumericValue = parseInt(stringNumberTokens[elementIndex], 10);
    // Guard clause: Ensure all elements are valid numbers.
    if (isNaN(parsedNumericValue)) {
      console.log("NON_NUMERIC_ELEMENT_DETECTED");
      return;
    }
    originalValueSequence.push(parsedNumericValue);
  }

  // Create a sorted duplicate of the original sequence.
  // Using spread syntax for shallow copy and a custom comparator for numeric sort.
  const correctlyOrderedSequence = [...originalValueSequence].sort((valOne, valTwo) => valOne - valTwo);

  let differingElementCount = 0;
  const maximumAllowedDeviations = 2; // Introduce a constant for the comparison threshold.

  // Compare the original sequence with its sorted version to count differences.
  for (let currentItemPosition = 0; currentItemPosition < actualSequenceLength; ++currentItemPosition) {
    if (originalValueSequence[currentItemPosition] !== correctlyOrderedSequence[currentItemPosition]) {
      differingElementCount++;
    }
  }

  // Output the result based on the count of differences.
  if (differingElementCount <= maximumAllowedDeviations) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

// --- Input Reading and Execution ---
const fileSystemUtility = require("fs");
const standardInputFilePath = "/dev/stdin";
const defaultEncoding = "utf8";

try {
  const fileContents = fileSystemUtility.readFileSync(standardInputFilePath, defaultEncoding);
  processNumericalSequence(fileContents);
} catch (inputReadError) {
  console.error("ERROR_ACCESSING_INPUT:", inputReadError.message);
  // In a real application, you might want to exit or provide a default behavior.
  // process.exit(1);
}