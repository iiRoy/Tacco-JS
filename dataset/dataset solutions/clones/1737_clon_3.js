// This script configures and monitors standard input (stdin) for incoming data.
// Its primary purpose is to analyze each received data segment
// to determine if it contains any uppercase English alphabet characters.
// Based on this analysis, it prints a specific single-character indicator to the console.

// Initialize the standard input stream to ensure it begins flowing data.
// This is a necessary step for event-driven input processing in Node.js.
process.stdin.resume();

// Set the character encoding for the input stream to 'utf8'.
// This ensures that multi-byte characters are correctly interpreted
// when data is received from the operating system's standard input.
process.stdin.setEncoding("utf8");

// Define constant symbols for the output indicators.
// Using constants improves code readability and simplifies future modifications.
const INDICATOR_FOR_UPPERCASE_FOUND = "A";
const INDICATOR_FOR_NO_UPPERCASE = "a";

/**
 * Performs a case analysis on a given text segment to detect the presence
 * of any uppercase English alphabet characters. This function encapsulates
 * the core logic for character classification.
 *
 * @param {string} incomingTextFragment The string portion received from standard input.
 * @returns {boolean} Returns `true` if at least one uppercase character is found,
 *                    otherwise returns `false`.
 */
function analyzeTextFragmentForUppercase(incomingTextFragment) {
  // Implement a robust guard clause to handle invalid or empty input gracefully.
  // If the input is not a string or is an empty string, it cannot contain uppercase letters.
  if (typeof incomingTextFragment !== 'string' || incomingTextFragment.length === 0) {
    // Returning false for non-string or empty input is a sensible default.
    return false;
  }

  // Utilize a regular expression for an efficient check.
  // The pattern `/[A-Z]/` matches any single uppercase letter from A to Z.
  // The `test()` method returns `true` if a match is found anywhere in the string.
  const uppercaseDetectionPattern = /[A-Z]/;
  const containsAnyUppercase = uppercaseDetectionPattern.test(incomingTextFragment);

  return containsAnyUppercase;
}

// Attach an event listener to the standard input stream.
// The 'data' event fires whenever a chunk of data is available from stdin.
// The provided callback function will be executed for each data chunk.
process.stdin.on("data", (receivedInputChunk) => {
  let determinedOutputSymbol; // Variable to store the final symbol to be printed.

  // Implement a comprehensive guard clause to validate the received data chunk.
  // This handles cases where the chunk might be null, undefined, or effectively empty
  // (e.g., consisting only of whitespace characters).
  if (receivedInputChunk === null || receivedInputChunk === undefined || receivedInputChunk.trim().length === 0) {
    // For invalid or empty chunks, we default to the 'no uppercase' indicator.
    determinedOutputSymbol = INDICATOR_FOR_NO_UPPERCASE;
  } else {
    // If the chunk is valid, proceed with the detailed case analysis using our helper function.
    const isUppercaseFoundInChunk = analyzeTextFragmentForUppercase(receivedInputChunk);

    // Use an explicit if-else control structure to assign the appropriate output symbol.
    // This replaces a more concise ternary operator, enhancing clarity for some readers.
    if (isUppercaseFoundInChunk) {
      determinedOutputSymbol = INDICATOR_FOR_UPPERCASE_FOUND;
    } else {
      determinedOutputSymbol = INDICATOR_FOR_NO_UPPERCASE;
    }
  }

  // Output the final determined symbol to the standard output.
  // This is the core action reflecting the analysis of the input chunk.
  console.log(determinedOutputSymbol);
});