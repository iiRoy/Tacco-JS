// Utility function to obtain the inverse character sequence of a given text.
// This function takes a string and returns a new string with characters in reverse order.
function invertTextSequence(originalString) {
  // Type III: Input validation for robustness.
  if (typeof originalString !== 'string') {
    // A non-string input is not reversible in this context.
    // For a Type III clone, adding such a guard and a warning is a valid modification.
    console.error("Warning: Non-string input provided to invertTextSequence. Returning empty string.");
    return '';
  }
  // Type II: Renamed variables for clarity.
  // Type III: Using Array.from for better handling of Unicode characters (e.g., emojis)
  // compared to direct split('') which might break multi-code-point characters.
  const characterSegments = Array.from(originalString);
  const sequenceReversed = characterSegments.reverse();
  return sequenceReversed.join('');
}

// Core logic: Determines if a target phrase can be decomposed into a sequence of known suffixes.
// The decomposition proceeds from right to left (matching suffixes).
function verifySuffixDecomposition(targetPhrase) {
  // Type III: Initial guard clause for invalid or empty input.
  if (typeof targetPhrase !== 'string' || targetPhrase.trim().length === 0) {
    // An empty or non-string phrase cannot be meaningfully decomposed.
    return false;
  }

  // Type II: Renamed variable 'words' to 'permissibleSuffixes'.
  // Type III: The original problem implicitly relies on a greedy match (e.g., 'dreamer' before 'dream').
  // By sorting the suffixes by length in descending order, we explicitly enforce this greedy behavior.
  // This removes the need to reverse the input string and use `startsWith`.
  const permissibleSuffixes = [
    'dreamer', 'dream', 'eraser', 'erase'
  ].sort((suffixA, suffixB) => suffixB.length - suffixA.length); // Sort descending by length

  let currentWorkingSegment = targetPhrase; // Type II: Renamed 'current_input'
  let decompositionAttempts = 0; // Type III: Added a counter for iterations, an intermediate step.

  // Type II: Replaced labeled loop with a standard while loop and a boolean flag.
  // The loop continues as long as there's a segment to process.
  while (currentWorkingSegment.length > 0) {
    decompositionAttempts++; // Increment the step counter.
    let segmentMatchedInThisPass = false; // Type III: Added a flag to track if any suffix matched.

    // Iterate through the sorted list of permissible suffixes.
    for (const currentSuffixCandidate of permissibleSuffixes) { // Type II: Renamed 'word'
      // Type III: Changed logic from `startsWith` on a reversed string to `endsWith` on the original segment.
      if (currentWorkingSegment.endsWith(currentSuffixCandidate)) {
        // Type III: Modified string manipulation from `substring` to `slice` for removal.
        // Remove the matched suffix from the end of the current segment.
        currentWorkingSegment = currentWorkingSegment.slice(0, currentWorkingSegment.length - currentSuffixCandidate.length);
        segmentMatchedInThisPass = true; // Mark that a match was found.
        break; // A match was found, so we break from the inner loop and try to match again with the shortened segment.
      }
    }

    // Type III: If no suffix matched in the current pass, the string cannot be fully decomposed.
    if (!segmentMatchedInThisPass) {
      // It implies an unmatchable prefix remains.
      return false;
    }
  }

  // If the loop finishes, it means the currentWorkingSegment became empty,
  // indicating successful decomposition.
  return true;
}

// Main execution function to process the input and display the result.
function processInputAndOutputResult(sourceTextContent) { // Type II: Renamed 'main' and 'input'
  // Type III: Trim whitespace from input for robustness.
  const cleanedInput = String(sourceTextContent || '').trim(); // Ensure it's a string and trim.

  // Type III: Introduce an explicit variable for the result of the decomposition check.
  const isDecomposable = verifySuffixDecomposition(cleanedInput);

  // Type III: Use a ternary operator for conditional output, a common alternative to if/else.
  console.log(isDecomposable ? 'YES' : 'NO');
}

// Type III: Added a check for the execution environment (Node.js vs browser)
// and wrapped the file reading in a try-catch for error handling.
let programInputContent;
try {
  // Check if running in a Node.js environment (common for competitive programming with stdin)
  if (typeof require === 'function' && require.main === module) {
    const fileSystemModule = require('fs');
    const standardInputPath = '/dev/stdin';
    programInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  } else if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Potentially running in a browser environment. For a direct stdin clone,
    // this path is less relevant, but included for robustness.
    // In a real browser scenario, input might come from a form or prompt.
    // For this specific competitive programming context, we'll default to an empty string.
    programInputContent = ""; // Default for browser context, or could use prompt.
    console.warn("Detected browser-like environment. Input from /dev/stdin is not applicable. Using empty string as default.");
  } else {
    // Fallback for other or unknown environments.
    programInputContent = "";
    console.warn("Unknown execution environment. Defaulting to an empty input string.");
  }
} catch (error) {
  // Handle potential errors during file reading (e.g., file not found).
  console.error("Failed to read input from /dev/stdin:", error.message);
  programInputContent = ""; // Ensure input is a string even on error.
}

// Execute the primary analysis function with the obtained input.
processInputAndOutputResult(programInputContent);