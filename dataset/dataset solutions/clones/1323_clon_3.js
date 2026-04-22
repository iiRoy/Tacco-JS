'use strict';
// This self-executing module is designed to process text from standard input
// to count occurrences of a specific word.
(function() {

  /**
   * Safely reads the entire content of a file as a UTF-8 string.
   * Includes basic error handling for file operations.
   * @param {string} sourcePath - The path to the file to read.
   * @returns {string} The content of the file, or an empty string if an error occurs.
   */
  const retrieveInputContent = (sourcePath) => {
    try {
      const fileSystem = require('fs'); // Dynamically load fs module
      return fileSystem.readFileSync(sourcePath, 'utf8');
    } catch (ioError) {
      // Log the error and return an empty string to prevent further processing issues.
      console.error('Failed to read input stream:', ioError.message);
      return '';
    }
  };

  // Acquire the raw text data from standard input.
  const fullRawInput = retrieveInputContent('/dev/stdin');

  // --- Input Validation and Pre-processing ---

  // If no content was read or the content is not a string,
  // there's nothing to process, so output 0 and exit.
  if (!fullRawInput || typeof fullRawInput !== 'string') {
    console.log(0);
    return;
  }

  /**
   * Parses the raw input string into distinct line segments,
   * separating the search term from the main text body.
   * @param {string} rawText - The complete raw text input.
   * @returns {string[]} An array of strings, where the first element is the search term line,
   *                     and subsequent elements are lines of the text body.
   */
  const processTextIntoSegments = (rawText) => {
    // Split the input at the 'END_OF_TEXT' marker. We only care about the part before it.
    const [primarySection] = rawText.split('END_OF_TEXT');

    // Ensure we have a valid section to work with.
    if (!primarySection) {
      return [];
    }

    // Trim leading/trailing whitespace from the primary section and then split it into individual lines.
    return primarySection.trim().split('\n');
  };

  /**
   * Counts the total occurrences of a specified word within a collection of text lines.
   * The count is case-insensitive, and words are delimited by spaces after newlines are removed.
   * @param {string[]} inputLineSegments - An array where the first element is the target word
   *                                       and the rest are lines of the text body.
   * @returns {number} The total count of the target word occurrences.
   */
  const tallyWordOccurrences = (inputLineSegments) => {
    // If there are no segments (e.g., empty input), or only a target word without body text.
    if (!Array.isArray(inputLineSegments) || inputLineSegments.length < 1) {
      return 0;
    }

    // Use array destructuring to clearly separate the search term from the body lines.
    const [designatedSearchTermRaw, ...bodyContentLines] = inputLineSegments;

    // If the designated search term itself is empty or undefined, nothing can be counted.
    if (!designatedSearchTermRaw) {
      return 0;
    }
    // Normalize the search term to lowercase once for efficient case-insensitive comparisons.
    const normalizedSearchTerm = designatedSearchTermRaw.toLowerCase();

    // Concatenate all lines of the text body into a single string.
    // Crucially, this uses an empty string separator to mimic the original's `join('')`,
    // which effectively removes newlines before word splitting.
    const mergedBodyText = bodyContentLines.join('');

    // Split the merged text by spaces to get an array of candidate words.
    // This will include empty strings if there are multiple spaces or leading/trailing spaces.
    const potentialWords = mergedBodyText.split(' ');

    let detectedCount = 0; // Initialize a counter for the matching words.

    // Iterate through each potential word in the body.
    for (const currentCandidate of potentialWords) {
      // Check if the current candidate word is not empty and matches the normalized search term
      // (after converting the candidate to lowercase for case-insensitivity).
      if (currentCandidate && currentCandidate.toLowerCase() === normalizedSearchTerm) {
        detectedCount++;
      }
    }
    return detectedCount; // Return the final count.
  };

  // --- Main Execution Flow ---

  // 1. Process the raw input into structured line segments.
  const preparedSegments = processTextIntoSegments(fullRawInput);

  // 2. Calculate the word occurrences based on the prepared segments.
  const finalWordCount = tallyWordOccurrences(preparedSegments);

  // 3. Output the computed count to the console.
  console.log(finalWordCount);

})(); // End of the self-executing function.