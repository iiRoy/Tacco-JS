function ProcessInput(dataPayload) {
  // Convert the first input element to a string, representing our main text source.
  const sourceText = dataPayload[0].toString();

  // Parse the second input element as an integer, which will be our target index.
  const targetIndex = parseInt(dataPayload[1]);

  // Determine the total character count of the source text.
  const textLength = sourceText.length;

  // Validate the length of the source text. If it's outside the allowed range, terminate.
  if (textLength < 1 || 5000 < textLength) {
    process.exit();
  }

  // Validate the target index. If it's outside the allowed range, terminate.
  if (targetIndex < 1 || 5 < targetIndex) {
    process.exit();
  }

  // Initialize an array to store unique substrings found.
  let uniqueSubstrings = [];

  // Declare a variable to hold the current substring being examined.
  let currentSegment = '';

  // Outer loop: iterates through all possible starting positions for substrings.
  for (let startIdx = 0; startIdx <= textLength; startIdx++) {
    // Inner loop: iterates through all possible ending positions for substrings,
    // starting from the current outer loop's start position.
    for (let endIdx = startIdx; endIdx <= textLength; endIdx++) {
      // Extract the substring from the source text using the current start and end indices.
      currentSegment = sourceText.substring(startIdx, endIdx);

      // Check if the current segment meets the criteria:
      // 1. It's not already present in our list of unique substrings.
      // 2. It does not contain a newline character.
      // 3. It is not an empty string.
      if (!uniqueSubstrings.includes(currentSegment) && !currentSegment.includes('\n') && currentSegment !== '') {
        // If all conditions are met, add the substring to our collection.
        uniqueSubstrings.push(sourceText.substring(startIdx, endIdx));
      }
    }
  }

  // Sort the collected unique substrings alphabetically.
  uniqueSubstrings.sort();

  // Output the substring at the (targetIndex - 1) position (due to 0-based indexing).
  console.log(uniqueSubstrings[targetIndex - 1]);
}

// Read input from standard input, decode it as UTF-8, and pass it to our processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
