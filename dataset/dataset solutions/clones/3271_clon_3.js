"use strict";

// This module processes input data to determine if a specific target word
// can be formed by deleting a single contiguous segment from the primary input string.

/**
 * Main entry point for processing the input.
 * Determines if the primary string, after removing a single contiguous substring,
 * results in the target word 'keyence'.
 * @param {string} sourceDataContent - The raw input data, expected to contain the primary string on the first line.
 */
function processInputData(sourceDataContent) {
  const TARGET_WORD_IDENTIFIER = 'keyence'; // The specific sequence we are looking for.
  let processingSuccessful = false; // Flag to indicate if the target word was formed.

  // Extract the primary string from the first line of the input.
  const lineArray = sourceDataContent.split('\n');
  const primaryText = lineArray[0];

  const primaryTextLength = primaryText.length;
  const targetWordLength = TARGET_WORD_IDENTIFIER.length;

  // Early exit condition: If the primary string is shorter than the target word,
  // it's impossible to form the target word by removal.
  if (primaryTextLength < targetWordLength) {
    console.log('NO');
    return;
  }

  // Iterate through all possible starting points for the prefix part.
  // 'prefixBoundary' indicates the index *after* the prefix.
  // It can range from 0 (empty prefix) to primaryTextLength (full string as prefix,
  // leaving empty suffix if suffixBoundary is also primaryTextLength)
  for (let prefixBoundary = 0; prefixBoundary <= primaryTextLength; prefixBoundary++) {

    // Iterate through all possible starting points for the suffix part.
    // 'suffixBoundary' indicates the index *before* the suffix.
    // It must be greater than or equal to 'prefixBoundary' as the removed segment
    // cannot start before it ends.
    for (let suffixBoundary = prefixBoundary; suffixBoundary <= primaryTextLength; suffixBoundary++) {

      // Construct the candidate string by taking a prefix and a suffix.
      // The segment from 'prefixBoundary' to 'suffixBoundary' (exclusive of suffixBoundary)
      // is conceptually the part that is being removed.
      const prefixPart = primaryText.substring(0, prefixBoundary);
      const suffixPart = primaryText.substring(suffixBoundary);

      const constructedCandidate = prefixPart + suffixPart;

      // Check if the combined string matches our target.
      if (constructedCandidate === TARGET_WORD_IDENTIFIER) {
        processingSuccessful = true;
        // Optimization: Once found, no need to check further.
        break;
      }
    }
    // If a match was found in the inner loop, break out of the outer loop too.
    if (processingSuccessful) {
      break;
    }
  }

  // Output the final determination based on the flag.
  if (processingSuccessful) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

// Invoke the main processing function with data from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * The original code contained an unused helper function `splitNum`.
 * This function has been removed as it was not essential to the core logic
 * and aligns with Type III modification guidelines (deleting non-essential parts).
 */