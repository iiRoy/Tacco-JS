const determineValidWordChain = (candidateWords) => {
  // This helper function constructs the longest possible Shiritori word chain
  // from a provided list of words. The rules are:
  // 1. Each subsequent word must begin with the last letter of the preceding word.
  // 2. An empty string or non-string input breaks the chain.
  // 3. The comparison is case-insensitive for the linking letters.

  // Initialize an array to store the successfully chained words.
  const formedChain = [];

  // --- Type III: Added initial input validation ---
  // Ensure the input is actually an array before proceeding.
  // If not, log a warning and return an empty chain.
  if (!Array.isArray(candidateWords)) {
    console.error("Input must be an array of strings to form a word chain.");
    return formedChain;
  }

  // --- Type III: Enhanced early exit condition ---
  // If the input array is empty, there's no starting word, so return an empty chain.
  // Also, validate the first word: it must be a non-empty string after trimming.
  if (candidateWords.length === 0 || typeof candidateWords[0] !== 'string' || candidateWords[0].trim().length === 0) {
    return formedChain;
  }

  // --- Type III: Process the first word defensively ---
  // The initial word is always considered valid if it passed the early checks.
  // Trim any leading/trailing whitespace.
  const firstValidSegment = candidateWords[0].trim();
  formedChain.push(firstValidSegment);

  // Iterate through the rest of the candidate words, starting from the second one.
  // The loop continues as long as a valid link is found.
  for (let currentPosition = 1; currentPosition < candidateWords.length; currentPosition++) {
    // --- Type III: Retrieve the last successfully added word from the chain ---
    // This ensures we always compare against the *last confirmed valid* word.
    const precedingSegment = formedChain[formedChain.length - 1];

    // Get the current word candidate from the input sequence.
    const prospectiveSegment = candidateWords[currentPosition];

    // --- Type III: Added robust type checking for current segment ---
    // If the current element is not a string, it's an invalid link, so the chain breaks.
    if (typeof prospectiveSegment !== 'string') {
      console.warn(`Chain interrupted: Non-string element encountered at index ${currentPosition}.`);
      break;
    }

    // --- Type III: Clean and validate the current segment ---
    // Trim whitespace and check if it becomes an empty string.
    const cleanedProspective = prospectiveSegment.trim();
    if (cleanedProspective.length === 0) {
      break; // An empty string breaks the chain.
    }

    // Extract the relevant characters for comparison.
    // --- Type III: Using bracket notation and `toLowerCase()` for flexibility ---
    const lastCharOfPrevious = precedingSegment[precedingSegment.length - 1];
    const firstCharOfCurrent = cleanedProspective[0];

    // Perform the Shiritori rule check:
    // 1. Ensure both characters actually exist (guard against extremely short words).
    // 2. Compare them in a case-insensitive manner.
    if (lastCharOfPrevious && firstCharOfCurrent &&
        lastCharOfPrevious.toLowerCase() === firstCharOfCurrent.toLowerCase()) {
      formedChain.push(cleanedProspective); // Add the word if it forms a valid link.
    } else {
      break; // If the rule is violated, the chain cannot continue.
    }
  }

  // Return the completed (or partially completed) valid word chain.
  return formedChain;
};