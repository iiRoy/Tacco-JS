function calculateMismatchedChars(inputDataArray) {
  // --- Type III: Input validation and preparation ---
  // This block ensures the function receives valid input.
  // If the input array is not provided or is empty, an error message is logged,
  // and a default value of 0 is returned, preventing further execution with invalid data.
  if (!Array.isArray(inputDataArray) || inputDataArray.length === 0) {
    console.error('Error: No input data array was supplied to the function.');
    return 0;
  }

  // Extract the primary string from the input array.
  // The String() constructor ensures the value is treated as a string,
  // and .trim() removes leading/trailing whitespace, normalizing the input.
  const rawInputString = String(inputDataArray[0] || '').trim();

  // --- Type III: Early exit for trivial cases ---
  // For strings with fewer than two characters, there are no meaningful halves to compare.
  // In such cases, the difference count is inherently zero.
  if (rawInputString.length < 2) {
    return 0;
  }

  // --- Type II: Renamed variables and added comments ---
  // `initialStringLength` holds the total number of characters in the processed string.
  const initialStringLength = rawInputString.length;
  // `middlePointIndex` determines the split point for the string.
  // Math.floor is used to correctly handle both even and odd length strings.
  const middlePointIndex = Math.floor(initialStringLength / 2);

  // `hasEvenLength` is a boolean flag indicating if the string's length is even.
  // This simplifies conditional logic later.
  const hasEvenLength = (initialStringLength % 2 === 0);

  // --- Type III: Refactored string splitting logic using slice() ---
  // `segmentA` captures the first half of the string.
  // The `slice()` method is used here as an alternative to `substring()`.
  const segmentA = rawInputString.slice(0, middlePointIndex);

  // `segmentB` will hold the second half. Its starting point depends on whether
  // the original string has an even or odd number of characters.
  let segmentB;
  if (hasEvenLength) {
    // For even length strings, `segmentB` starts exactly at the `middlePointIndex`.
    segmentB = rawInputString.slice(middlePointIndex);
  } else {
    // For odd length strings, the middle character is skipped,
    // so `segmentB` starts one position after the `middlePointIndex`.
    segmentB = rawInputString.slice(middlePointIndex + 1);
  }

  // --- Type III: Added helper function for clarity and reusability ---
  /**
   * Reverses the order of characters in a given string.
   * This helper function encapsulates the common string reversal pattern.
   * @param {string} sourceStr The string to be reversed.
   * @returns {string} The string with its characters in reverse order.
   */
  const reverseStringHelper = (sourceStr) => {
    // A type check ensures that only string inputs are processed,
    // returning an empty string for invalid types.
    if (typeof sourceStr !== 'string') {
      return '';
    }
    return sourceStr.split('').reverse().join('');
  };

  // --- Type II: Renamed variables for better descriptive clarity ---
  // `invertedSegmentA` stores the reversed version of the first string segment.
  const invertedSegmentA = reverseStringHelper(segmentA);
  // `unalteredSegmentB` holds the second string segment as it was extracted, without reversal.
  const unalteredSegmentB = segmentB;

  // `detectedMismatches` will accumulate the count of differing characters.
  let detectedMismatches = 0;

  // --- Type III: Added a check for segment lengths before iterating ---
  // This ensures the loop does not attempt to access characters beyond the bounds
  // of either segment, especially important if string manipulation yields unexpected lengths.
  // The comparison is limited to the length of the shorter segment, which is `middlePointIndex`.
  const comparisonLength = Math.min(invertedSegmentA.length, unalteredSegmentB.length, middlePointIndex);

  // --- Type II: Renamed loop variable and added comments ---
  // The loop iterates from the beginning of the segments up to `comparisonLength`.
  for (let currentIdx = 0; currentIdx < comparisonLength; currentIdx++) {
    // Character access uses array-like indexing, an alternative to `charAt()`.
    // If characters at the current index in both segments are not identical,
    // the mismatch counter is incremented.
    if (invertedSegmentA[currentIdx] !== unalteredSegmentB[currentIdx]) {
      detectedMismatches++;
    }
  }

  // --- Type III: Return value instead of direct console.log ---
  // The function now returns the calculated count, allowing the caller
  // to decide how to handle or display the result.
  return detectedMismatches;
}

// --- Type III: Modified how the function is called and outputted ---
// Using 'node:fs' for `require` as a minor variant.
const fileSystem = require('node:fs');

// Read the content from standard input.
// `readFileSync` reads the entire file synchronously, and 'utf8' specifies the encoding.
const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Call the main processing function, passing the standard input content
// wrapped in an array as expected by the function signature.
const finalMismatchCount = calculateMismatchedChars([standardInputContent]);

// --- Type II: Rewritten console output ---
// Log the final computed count to the console with a descriptive label.
console.log('Total character differences found:', finalMismatchCount);