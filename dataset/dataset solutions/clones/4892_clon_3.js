const computeOptimalStringMergeLength = (rawInputData) => {
  // This function aims to determine a specific combined string length, often related to
  // finding an optimal overlap when merging two strings. It processes raw input
  // consisting of a numeric length and two strings, then applies a unique
  // overlap-finding algorithm.

  // 1. Input Parsing and Initial Variable Setup
  // Split the raw input data into individual lines:
  // The first line contains the numeric length associated with the primary string.
  // The second line contains the primary string itself.
  // The third line contains the secondary string.
  const inputSegments = rawInputData.trim().split('\n');

  // Parse the numeric length for the primary string.
  // Using parseInt with base 10 for robust conversion, avoiding bitwise coercion.
  const primaryStringActualLength = parseInt(inputSegments[0], 10);

  // Assign the extracted strings to more descriptive variable names.
  const primaryStringContent = inputSegments[1];
  const secondaryStringContent = inputSegments[2];

  // Pre-calculate the length of the secondary string for repeated use, improving efficiency.
  const secondaryStringActualLength = secondaryStringContent.length;

  // Initialize the result variable. By default, if no overlap is found,
  // the combined length is considered as the sum of the primary string's length
  // and the primary string's length again, as per the original problem's `N+N` logic.
  let calculatedCompositeLength = primaryStringActualLength + primaryStringActualLength;

  // 2. Core Logic: Iterating to find the first valid overlap
  // The outer loop systematically checks all possible starting positions within the
  // `primaryStringContent` where an overlap with `secondaryStringContent` could begin.
  // `overlapSearchIndex` represents the character offset from the start of `primaryStringContent`.
  // It effectively denotes the length of the non-overlapping prefix of `primaryStringContent`.
  outerOverlapScan: for (let overlapSearchIndex = 0; overlapSearchIndex < primaryStringActualLength; ++overlapSearchIndex) {
    // Flag to track if the current 'overlapSearchIndex' yields a successful overlap.
    let isCurrentOverlapAttemptValid = true;

    // Determine the length of the suffix of `primaryStringContent` that starts at `overlapSearchIndex`.
    // This is the segment of `primaryStringContent` that will be compared against `secondaryStringContent`.
    const currentSuffixLengthInPrimary = primaryStringActualLength - overlapSearchIndex;

    // Optimization/Clarification: If the potential overlapping suffix from `primaryStringContent`
    // is longer than the entire `secondaryStringContent`, then `secondaryStringContent` cannot
    // be a prefix of this suffix. This condition mirrors the implicit behavior of the original
    // character-by-character comparison where accessing `secondaryStringContent[charIndex]`
    // beyond its bounds would result in `undefined`, causing a mismatch.
    if (currentSuffixLengthInPrimary > secondaryStringActualLength) {
      isCurrentOverlapAttemptValid = false; // Mark as invalid
      continue outerOverlapScan;           // Skip to the next 'overlapSearchIndex'
    }

    // The inner loop performs a character-by-character comparison.
    // It iterates through the characters of the current suffix of `primaryStringContent`.
    for (let charComparisonPosition = 0; charComparisonPosition < currentSuffixLengthInPrimary; ++charComparisonPosition) {
      // Compare the character in `primaryStringContent` at the current overlap point
      // with the corresponding character in `secondaryStringContent`'s prefix.
      if (primaryStringContent[overlapSearchIndex + charComparisonPosition] !== secondaryStringContent[charComparisonPosition]) {
        // If any character mismatch is found, the current 'overlapSearchIndex' is not valid.
        isCurrentOverlapAttemptValid = false; // Mark as invalid
        continue outerOverlapScan;           // Immediately move to the next 'overlapSearchIndex'
      }
    }

    // If the inner loop completes without setting `isCurrentOverlapAttemptValid` to `false`,
    // it means a perfect overlap for the current `overlapSearchIndex` was found.
    if (isCurrentOverlapAttemptValid) {
      // Calculate the final length according to the problem's specific formula:
      // `overlapSearchIndex` (non-overlapping prefix of primary) + `primaryStringActualLength` (full primary length).
      calculatedCompositeLength = overlapSearchIndex + primaryStringActualLength;
      // Since the problem asks for the smallest `overlapSearchIndex` (first match), we can return immediately.
      return calculatedCompositeLength;
    }
  }

  // 3. Fallback: No suitable overlap found
  // If the outer loop completes without finding any valid overlap,
  // return the initial default length (primaryStringActualLength + primaryStringActualLength),
  // which signifies no effective overlap between the two strings in the defined manner.
  return calculatedCompositeLength;
};

// Execute the string overlap calculation by reading input from standard input
// and then printing the computed result to the console.
console.log(computeOptimalStringMergeLength(require('fs').readFileSync('/dev/stdin', 'utf8')));