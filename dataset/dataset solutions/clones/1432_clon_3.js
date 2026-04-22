function analyzeInputData(textBlocks) {
  // Check for empty or invalid input array before proceeding with analysis.
  if (!Array.isArray(textBlocks) || textBlocks.length === 0) {
    console.error("Input data is not an array or is empty; no analysis can be performed.");
    return 0; // Return zero matches for invalid input.
  }

  // The first element of the input array is designated as the primary search term.
  // It's trimmed to ensure no leading/trailing whitespace affects the comparison.
  const primaryCriterion = String(textBlocks[0] || '').trim();

  // If the search term itself is empty after trimming, warn the user and exit early.
  if (primaryCriterion.length === 0) {
    console.warn("The specified search criterion is empty. No occurrences will be detected.");
    return 0;
  }

  let totalOccurrences = 0; // Initialize a counter for found matches.

  // Define an internal utility function to process a single line into individual word tokens.
  const breakLineIntoTokens = (lineContent) => {
    // Guard against non-string or effectively empty line content.
    if (typeof lineContent !== 'string' || lineContent.trim().length === 0) {
      return []; // Return an empty array if the line is not valid for tokenization.
    }
    // Use a regular expression to extract sequences of word characters.
    // This is more robust than simple split for varying whitespace.
    return lineContent.match(/\b\w+\b/g) || [];
  };

  // Iterate over the input text segments, starting from the second segment (index 1),
  // as the first segment was used for the search criterion.
  for (let segmentIndex = 1; segmentIndex < textBlocks.length; ++segmentIndex) {
    const currentTextSegment = textBlocks[segmentIndex]; // Store current line in a temporary variable.
    const wordTokens = breakLineIntoTokens(currentTextSegment); // Tokenize the current segment.

    // Iterate through each token extracted from the current text segment.
    for (const currentToken of wordTokens) {
      // Compare the trimmed token with the primary search criterion.
      // Trimming here ensures that tokens like "word " don't fail to match "word".
      if (currentToken.trim() === primaryCriterion) {
        totalOccurrences++; // Increment the counter if a match is found.
      }
    }
  }

  // Log a more descriptive output message to the console.
  console.log(`Analysis complete: The phrase "${primaryCriterion}" appeared ${totalOccurrences} times.`);
  return totalOccurrences; // Return the final count.
}

// Array to accumulate incoming data buffers from standard input.
const receivedInputBuffers = [];

// Set up an event listener for 'data' events on standard input.
// Each time data is received, convert it to a string and store it.
process.stdin.on('data', (dataChunk) => {
  receivedInputBuffers.push(dataChunk.toString());
});

// Set up an event listener for the 'end' event on standard input.
// This signifies that all input has been received.
process.stdin.on('end', () => {
  // Join all received data chunks into a single string.
  // Then, split the combined string by newline characters to get individual lines.
  // The .filter(Boolean) step removes any empty strings that might result from
  // consecutive newlines or a trailing newline.
  const processedInputLines = receivedInputBuffers.join('').split('\n').filter(Boolean);

  // Invoke the primary analysis function with the prepared lines.
  // The return value (total count) is captured, though the function itself also logs.
  const finalResultCount = analyzeInputData(processedInputLines);
  // Optionally, further actions could be taken with finalResultCount here.
});