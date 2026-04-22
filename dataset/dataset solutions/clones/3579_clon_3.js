const fileSystemHandler = require("fs");

// This extended script validates a numerical sequence obtained from standard input.
// It meticulously checks for specific structural patterns, including parity rules
// and block-based progression, to determine its validity.

// Read the raw textual input from the standard input stream.
// This is equivalent to the initial 'p' variable in the original code.
let rawInputContent = fileSystemHandler.readFileSync("/dev/stdin", "utf8");

// Define a constant for the negative validation outcome to enhance readability.
const SEQUENCE_INVALID_STATUS = "No";

// Process the raw input:
// 1. Split the string into an array of lines.
// 2. Filter out any lines that are empty or contain only whitespace.
// 3. Convert each non-empty line string into a numerical value.
// This forms the primary data array for sequence analysis.
const numericalSequenceData = rawInputContent
  .split('\n')
  .filter(lineText => lineText.trim() !== '')
  .map(Number);

// Execute the core validation logic and print the returned status to the console.
console.log(evaluateNumericalSequence());

/**
 * Determines if the numerical sequence conforms to a predefined set of validation rules.
 * This function encapsulates the main logic previously found in 'main()'.
 *
 * @returns {string} "Yes" if the sequence is valid, "No" otherwise.
 */
function evaluateNumericalSequence() {
  // A boolean flag to track if any validation rule has been violated.
  let validationFailed = false;

  // Helper arrow function to check if two numbers have differing parities.
  // Returns true if one is even and the other is odd; false if both are same parity.
  const checkParityMismatch = (firstNum, secondNum) => ((firstNum ^ secondNum) & 1) !== 0;

  // The first element of the sequence dictates the expected total number of subsequent elements.
  // This corresponds to 'n' in the original code.
  const expectedElementCount = numericalSequenceData[0];

  // Initial guard clause: Validate the basic structure and presence of the count element.
  if (numericalSequenceData.length === 0 || expectedElementCount === undefined || isNaN(expectedElementCount)) {
    console.error("Critical Error: Input sequence is either empty or the initial count element is invalid.");
    return SEQUENCE_INVALID_STATUS;
  }
  // Ensure the expected count doesn't exceed the actual number of elements available (minus the count itself).
  if (expectedElementCount > numericalSequenceData.length - 1) {
    console.error(`Critical Error: Expected ${expectedElementCount} elements, but only ${numericalSequenceData.length - 1} are provided.`);
    return SEQUENCE_INVALID_STATUS;
  }

  // A Set data structure to efficiently keep track of indices or values
  // that have been "marked" or "utilized" during block processing.
  // This replaces the 'a' object from the original implementation.
  const utilizedMarkers = new Set();

  // The main iteration loop traverses the sequence, starting from the first actual data point (index 1).
  // It processes elements in dynamic blocks based on their values.
  // 'currentScanIndex' corresponds to 'i' in the original code.
  for (let currentScanIndex = 1; currentScanIndex <= expectedElementCount; currentScanIndex++) {

    // Ensure array access is within valid bounds for robustness.
    if (currentScanIndex >= numericalSequenceData.length) {
      console.error(`Validation Error: Attempted to access index ${currentScanIndex} which is out of bounds.`);
      validationFailed = true;
      break;
    }

    const currentSequenceValue = numericalSequenceData[currentScanIndex];

    // Primary validation rule: The current sequence value and its index must share the same parity.
    // If parities differ, the sequence is immediately deemed invalid.
    if (checkParityMismatch(currentSequenceValue, currentScanIndex)) {
      validationFailed = true;
      break;
    }

    // 'currentBlockEndBoundary' defines the upper limit for the current block of elements being processed.
    // This variable correlates to 'u' in the original code.
    let currentBlockEndBoundary = currentSequenceValue;

    // 'initialBlockReferenceIndex' stores the starting index of the current block.
    // This variable correlates to 'v' in the original code.
    let initialBlockReferenceIndex = currentScanIndex;

    // This nested loop handles the processing of elements within the current block.
    // It continues as long as the 'currentScanIndex' has not reached the 'currentBlockEndBoundary'.
    while (currentScanIndex < currentBlockEndBoundary) {
      // Advance the index to consider the next element within the block.
      currentScanIndex++;

      // Guard against out-of-bounds access during block processing.
      if (currentScanIndex >= numericalSequenceData.length) {
        console.error(`Validation Error: Block processing exceeded array bounds at index ${currentScanIndex}.`);
        validationFailed = true;
        break;
      }

      // Secondary validation rule for elements within a block:
      // The element at the new index must be numerically equal to its index.
      if (numericalSequenceData[currentScanIndex] !== currentScanIndex) {
        validationFailed = true;
        break;
      }

      // Advance the index once more, as per the established pattern (skipping an element).
      currentScanIndex++;

      // Another bounds check after the second increment.
      if (currentScanIndex >= numericalSequenceData.length) {
        console.error(`Validation Error: Block processing exceeded array bounds after second increment at index ${currentScanIndex}.`);
        validationFailed = true;
        break;
      }

      const subsequentValueInBlock = numericalSequenceData[currentScanIndex];

      // Tertiary validation rule within a block: The newly accessed element
      // and its index must also have consistent parities.
      if (checkParityMismatch(subsequentValueInBlock, currentScanIndex)) {
        validationFailed = true;
        break;
      }

      // Conditional logic to adjust the block's boundaries or reference index.
      if (currentBlockEndBoundary < subsequentValueInBlock) {
        // If the current element's value is higher than the block's current upper boundary,
        // extend the boundary and mark this new higher boundary as utilized.
        currentBlockEndBoundary = subsequentValueInBlock;
        utilizedMarkers.add(currentBlockEndBoundary);
      } else if (initialBlockReferenceIndex === subsequentValueInBlock) {
        // If the current element's value matches the initial block reference index,
        // find the next available 'initialBlockReferenceIndex' by incrementing by 2
        // until an index not present in 'utilizedMarkers' is found.
        do {
          initialBlockReferenceIndex += 2;
        } while (utilizedMarkers.has(initialBlockReferenceIndex));
      } else {
        // If none of the above conditions are met, the sequence structure is invalid.
        validationFailed = true;
        break;
      }
    } // End of inner 'while' loop

    // If a failure occurred in the inner loop, propagate it to the outer loop.
    if (validationFailed) {
      break;
    }
  } // End of outer 'for' loop

  // After all checks, return "Yes" if no failures were detected, otherwise return "No".
  return validationFailed ? SEQUENCE_INVALID_STATUS : "Yes";
}