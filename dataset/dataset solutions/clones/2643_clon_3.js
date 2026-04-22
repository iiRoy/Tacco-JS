// This module handles input data acquisition and orchestrates the core pattern-finding algorithm.
const InputProcessor = (rawInputData) => {
  // Input validation: Ensure the provided data is a string.
  if (typeof rawInputData !== 'string') {
    console.error("Processing Error: Input data must be a string. Received type:", typeof rawInputData);
    return; // Exit if input is invalid.
  }

  // Step 1: Process the raw input.
  // Split the input by newline characters and filter out any empty lines that might result from extra newlines or trimming.
  const processedLines = rawInputData.split("\n").filter(lineContent => lineContent.trim() !== "");

  // Further validation: Ensure there are enough lines to extract both the base string and the pattern.
  const MIN_REQUIRED_LINES = 2;
  if (processedLines.length < MIN_REQUIRED_LINES) {
    console.error(`Processing Error: Insufficient input lines. Expected at least ${MIN_REQUIRED_LINES}, but got ${processedLines.length}.`);
    return;
  }

  // Extract the primary string and the target pattern from the processed lines.
  // Trim any leading/trailing whitespace from these essential components.
  const primaryString = processedLines[0].trim();
  const targetPattern = processedLines[1].trim();

  // Define a recursive utility function responsible for finding the target pattern's
  // 1-indexed starting position within the primary string, allowing for dynamic extensions
  // of the search space by repeatedly appending the primary string.
  //
  // Parameters:
  //   currentPatternCharIndex: The zero-based index of the character within 'targetPattern'
  //                            that we are currently attempting to locate.
  //   currentSearchSpace:      The string segment in which we are currently searching for
  //                            'targetPattern[currentPatternCharIndex]'. This buffer can grow.
  //   extensionAttemptsForChar: A counter indicating how many times 'currentSearchSpace' has
  //                             been extended (by appending 'primaryString') specifically for
  //                             the purpose of finding the *current* 'currentPatternCharIndex'.
  //                             This prevents infinite loops; typically, only one extension is allowed per character.
  //   cumulativePositionOffset: The 1-indexed total character count from the beginning of the
  //                             *original* 'primaryString' to the start of the currently matched
  //                             portion of the 'targetPattern'. This accumulates as matches are found.
  //
  // Returns: The final 1-indexed cumulative position if the entire 'targetPattern' is found,
  //          otherwise returns -1 to indicate failure.
  const locateMatchRecursive = (currentPatternCharIndex, currentSearchSpace, extensionAttemptsForChar, cumulativePositionOffset) => {
    // Robustness check: If the pattern index goes out of expected bounds, something is wrong.
    if (currentPatternCharIndex < 0 || currentPatternCharIndex > targetPattern.length) {
      console.warn("Algorithm Warning: Recursive call received an out-of-bounds pattern index. Returning -1.");
      return -1;
    }

    // Base Case 1: All characters of the target pattern have been successfully matched.
    // The mission is accomplished; return the accumulated offset.
    if (currentPatternCharIndex === targetPattern.length) {
      return cumulativePositionOffset;
    }

    // Identify the specific character from the target pattern we need to find in this step.
    const charToFind = targetPattern[currentPatternCharIndex];

    // Attempt to locate the first occurrence of 'charToFind' within the 'currentSearchSpace'.
    const relativeIndexInSearchSpace = currentSearchSpace.indexOf(charToFind);

    // Conditional branching based on whether the character was found.
    if (relativeIndexInSearchSpace !== -1) {
      // Scenario A: The character was found!
      // We've made progress. Update the search state for the next recursive call.
      
      // The new search space starts from where the current character was found.
      const remainingSearchSegment = currentSearchSpace.substring(relativeIndexInSearchSpace);
      // Update the cumulative offset by adding the relative index of the found character.
      const nextCumulativeOffset = cumulativePositionOffset + relativeIndexInSearchSpace;
      
      // Recurse for the next character in the pattern.
      // Reset 'extensionAttemptsForChar' to 0 because we've successfully matched a char
      // and are moving to a new character in the pattern, for which no extensions have been made yet.
      return locateMatchRecursive(
        currentPatternCharIndex + 1, // Move to the next character in the target pattern.
        remainingSearchSegment,      // Search within the remainder of the current buffer.
        0,                           // Reset extension attempts for the next pattern character.
        nextCumulativeOffset         // Pass the updated cumulative offset.
      );
    } else {
      // Scenario B: The character was NOT found in the 'currentSearchSpace'.
      // We need to decide if we can expand the search space or if we should fail.

      // Check if we are allowed to extend the search buffer for this specific character attempt.
      const MAX_EXTENSIONS_PER_CHAR = 1; // Limit to one extension per character to prevent infinite growth.
      if (extensionAttemptsForChar < MAX_EXTENSIONS_PER_CHAR) {
        // We are allowed to extend: Append the 'primaryString' to 'currentSearchSpace'.
        const expandedSearchSpace = currentSearchSpace + primaryString;
        
        // Recurse again for the *same* pattern character, but with the expanded search space.
        // Increment 'extensionAttemptsForChar' to mark that we've now made one extension for this char.
        return locateMatchRecursive(
          currentPatternCharIndex,    // Still looking for the same character.
          expandedSearchSpace,        // Search in the newly expanded buffer.
          extensionAttemptsForChar + 1, // Mark that an extension attempt has been used.
          cumulativePositionOffset    // Offset does not change until a character is actually matched.
        );
      } else {
        // We have already made the maximum allowed extension attempts for this character
        // and still couldn't find it. This implies the pattern cannot be matched.
        return -1; // Indicate failure.
      }
    }
  };

  // Step 2: Initiate the pattern search process.
  // The search begins with the first character of the target pattern (index 0).
  // The initial search buffer is the 'primaryString'.
  // No extension attempts have been made yet for the starting character (0).
  // The 'cumulativePositionOffset' starts at 1, aligning with a 1-indexed output requirement.
  const finalMatchResult = locateMatchRecursive(0, primaryString, 0, 1);

  // Step 3: Output the result to the console.
  if (finalMatchResult !== -1) {
    console.log(`Success: Target pattern '${targetPattern}' found at 1-indexed position: ${finalMatchResult}.`);
  } else {
    console.log(`Failure: Target pattern '${targetPattern}' could not be located in '${primaryString}' (even with allowed extensions). Result code: ${finalMatchResult}.`);
  }
};

// --- Execution Environment Integration ---
// This block handles reading input from the standard input stream,
// which is common in competitive programming or command-line utilities.

// Acquire the necessary Node.js built-in module for file system operations.
const fileSystemModule = require("fs");
// Define the standard input path for Unix-like systems.
const standardInputPath = "/dev/stdin";
// Specify the character encoding for reading the file content.
const encodingFormat = "utf8";

try {
  // Read the entire content of the standard input stream synchronously.
  const inputContentFromFile = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
  // Pass the obtained content to our main processing function.
  InputProcessor(inputContentFromFile);
} catch (readError) {
  // Handle any errors that occur during the file reading process.
  console.error(`Execution Error: Failed to read input from '${standardInputPath}'. Details: ${readError.message}`);
}