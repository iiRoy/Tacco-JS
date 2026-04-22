// This module provides a robust mechanism to determine the minimum number of character operations
// required to construct a 'target' string by repeatedly appending a 'source' string.
// It effectively models the problem of finding the shortest sequence of 'source' string segments
// (full or partial) that can form the 'target'. If the 'target' cannot be formed, an impossibility
// indicator is returned.

/**
 * Parses raw input data, expecting two lines separated by a newline character.
 * The first line is treated as the source string, and the second as the target string.
 *
 * @param {string} rawData - The raw string input, typically from a file or standard input.
 * @returns {{sourceString: string, targetString: string}} An object containing the parsed strings.
 * @throws {Error} If the input format is invalid or strings cannot be extracted.
 */
const extractInputStrings = (rawData) => {
  // Defensive programming: check for null, undefined, or empty input.
  if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
    // For this specific problem context (reading from /dev/stdin),
    // an empty or invalid rawData might indicate an issue with the input stream itself.
    // We'll throw an error to signal a critical input problem.
    throw new Error("Invalid or empty input data provided to the string extractor.");
  }

  // Normalize whitespace and split the input into individual lines.
  const processedLines = rawData.trim().split('\n');

  // Ensure we have exactly two lines as expected for source and target.
  if (processedLines.length < 2) {
    throw new Error("Input data must contain at least two lines for source and target strings.");
  }

  // Destructure the array to get the source and target strings.
  // Further trimming each line ensures no leading/trailing whitespace impacts the strings themselves.
  const primarySourceString = processedLines[0].trim();
  const desiredTargetString = processedLines[1].trim();

  // Return the extracted string components.
  return { sourceString: primarySourceString, targetString: desiredTargetString };
};

// Main execution function wrapped in an Immediately Invoked Function Expression (IIFE)
// to encapsulate scope and pass the input reading mechanism.
((inputProvider) => {
  let resultOutput = '-1'; // Default to impossibility, will be updated if a solution is found.

  try {
    // Read the raw content from the specified input source.
    const rawContentBuffer = inputProvider();

    // Parse the raw content to get our source and target strings.
    const { sourceString: sBase, targetString: tGoal } = extractInputStrings(rawContentBuffer);

    // --- Initial Validation and Edge Cases ---
    // If the target string is empty, no operations are needed.
    if (tGoal.length === 0) {
      resultOutput = '0';
      console.log(resultOutput);
      return; // Exit early.
    }

    // If the source string is empty but the target is not, it's impossible to form the target.
    if (sBase.length === 0 && tGoal.length > 0) {
      console.log(resultOutput); // Output the default impossibility.
      return; // Exit early.
    }

    // --- Core Algorithm Variables ---
    const sLength = sBase.length; // Length of the source string.
    const tLength = tGoal.length; // Length of the target string.

    // 'currentSourceMatchIndex': Keeps track of the last successfully matched character's
    // index within the current 'sBase' segment being scanned.
    // Initialized to -1 to signify starting a new 'sBase' cycle or no match yet.
    let currentSourceMatchIndex = -1;

    // 'completedSourceRotations': Counts how many full 'sBase' strings have been consumed
    // to build the 'tGoal'. Each time we wrap around 'sBase', this counter increments.
    let completedSourceRotations = 0;

    // 'targetCharacterIterator': This index moves through the 'tGoal' string,
    // pointing to the character we are currently trying to match.
    let targetCharacterIterator = 0;

    // --- Main Loop: Iterate through each character of the target string ---
    // We continue as long as there are characters left in 'tGoal' to match.
    while (targetCharacterIterator < tLength) {
      let characterFoundInCurrentSegment = false; // Flag to indicate if tGoal[targetCharacterIterator] was found.

      // 'searchStartIndex': Where to begin looking in 'sBase' for the current target character.
      // If 'currentSourceMatchIndex' is -1, it means we're starting a fresh scan of 'sBase' (from index 0).
      // Otherwise, we continue from the character immediately after the last successful match.
      let searchStartIndex = currentSourceMatchIndex + 1;

      // 'sourceSegmentScanner': This internal iterator scans 'sBase' for the current target character.
      let sourceSegmentScanner = searchStartIndex;

      // --- Inner Loop: Search for the target character in the current source segment ---
      // This loop continues as long as we haven't reached the end of 'sBase'
      // and we haven't yet found the character we're looking for.
      while (sourceSegmentScanner < sLength && !characterFoundInCurrentSegment) {
        // Check if the character in 'sBase' matches the current character in 'tGoal'.
        if (sBase[sourceSegmentScanner] === tGoal[targetCharacterIterator]) {
          currentSourceMatchIndex = sourceSegmentScanner; // Update the position of the last match.
          characterFoundInCurrentSegment = true;        // Mark that the character was found.
        }
        sourceSegmentScanner++; // Move to the next character in 'sBase'.
      }

      // --- Decision Point after scanning a segment of 'sBase' ---
      if (characterFoundInCurrentSegment) {
        // If the current target character was found in 'sBase', we move on to the next target character.
        targetCharacterIterator++;
      } else {
        // If the current target character was NOT found in the current segment of 'sBase':

        // Critical check: If 'currentSourceMatchIndex' is still -1, it means that for the
        // character 'tGoal[targetCharacterIterator]', we scanned 'sBase' from the very beginning
        // (because currentSourceMatchIndex was -1 before this search) and *still* couldn't find it.
        // This indicates that 'tGoal' contains a character that is not present in 'sBase' at all,
        // making the construction impossible.
        if (currentSourceMatchIndex === -1) {
          console.log(resultOutput); // Output the impossibility indicator.
          return;                    // Terminate execution, as no solution exists.
        }

        // If 'currentSourceMatchIndex' was NOT -1, it means we had previously matched some characters
        // from 'tGoal' within 'sBase', but for the current 'tGoal[targetCharacterIterator]', we
        // couldn't find it in the *remaining* part of 'sBase' (from 'currentSourceMatchIndex + 1' to 'sLength - 1').
        // This signifies that we need to start a new full cycle of 'sBase' to find this character.
        completedSourceRotations++;     // Increment the count of full 'sBase' strings consumed.
        currentSourceMatchIndex = -1;   // Reset the match index to -1 to begin scanning 'sBase' from its start for the *same* target character.
        // Note: targetCharacterIterator is NOT incremented here; we need to re-attempt matching
        // the *same* target character from the beginning of the new 'sBase' cycle.
      }
    }

    // --- Final Calculation ---
    // If the loop completes, it means all characters of 'tGoal' have been successfully matched.
    // The total effective length is calculated as:
    // (Number of full 'sBase' rotations * Length of 'sBase')
    // + (Index of the last matched character in the final 'sBase' segment + 1, to convert 0-based index to length).
    const totalEffectiveLength = (completedSourceRotations * sLength) + (currentSourceMatchIndex + 1);

    // Convert the numerical result to a string as per common problem output formats.
    resultOutput = String(totalEffectiveLength);

  } catch (errorDetails) {
    // Catch any errors during input processing or algorithm execution.
    // Log the error for debugging purposes and ensure the impossibility result is output.
    console.error("An error occurred during processing:", errorDetails.message);
    // If an error occurs, we default to the impossibility result.
  } finally {
    // Ensure that a result is always logged to standard output.
    console.log(resultOutput);
  }

})(
  // This function is passed as 'inputProvider' to the IIFE.
  // It's responsible for reading the input from the specified system path.
  // In a typical competitive programming environment, '/dev/stdin' is the standard input.
  () => require('fs').readFileSync('/dev/stdin', 'utf8')
);