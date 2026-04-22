// Helper utility function to retrieve a character from a string at a given position.
// It safely handles out-of-bounds indices by returning an empty string,
// which mimics the behavior of String.prototype.slice(negative_index, positive_index)
// when the start index is negative.
function getCharacterOrEmpty(sourceStringValue, charIndexPosition) {
  // Check if the requested index is within the valid bounds of the string.
  if (charIndexPosition < 0 || charIndexPosition >= sourceStringValue.length) {
    return ""; // Return an empty string if the index is invalid.
  }
  // Otherwise, return the character at the specified position.
  return sourceStringValue[charIndexPosition];
}

/**
 * Processes a given input string to identify and count specific segments based on
 * a right-to-left traversal and a set of predefined comparison rules.
 * The logic involves building a stack of segments and performing a final adjustment.
 *
 * @param {string} sourceTextContent - The string content to be analyzed.
 */
function ProcessInputStringSegments(sourceTextContent) {
  // Defensive programming: Validate the input type to ensure it's a string.
  if (typeof sourceTextContent !== 'string') {
    console.error("Error: The provided input must be a string for processing.");
    return; // Exit the function if the input type is incorrect.
  }

  // Normalize the input by trimming any leading or trailing whitespace characters.
  const cleanedSourceString = sourceTextContent.trim();
  const currentStringLength = cleanedSourceString.length;

  // Handle edge cases for empty or very short input strings early.
  if (currentStringLength === 0) {
    console.log("0"); // An empty string yields zero segments.
    return;
  }

  // Initialize a stack-like array to store the identified segments during traversal.
  // This structure accumulates segments in a last-in, first-out manner.
  const segmentAccumulationStack = [];

  // Begin the primary processing loop, traversing the string from its end to its beginning.
  // 'currentTraversalIndex' acts as the pointer for the character being examined.
  for (let currentTraversalIndex = currentStringLength - 1; currentTraversalIndex >= 0; currentTraversalIndex--) {
    // Extract the character at the current position for evaluation.
    const characterCurrentlyUnderInspection = cleanedSourceString[currentTraversalIndex];

    // Determine if the segment stack is empty before making comparisons.
    const hasNoSegmentsYet = (segmentAccumulationStack.length === 0);

    if (hasNoSegmentsYet) {
      // If the stack is empty, the current character forms the first segment.
      segmentAccumulationStack.push(characterCurrentlyUnderInspection);
    } else {
      // If segments already exist, retrieve the most recently added segment for comparison.
      const lastSegmentOnTop = segmentAccumulationStack[segmentAccumulationStack.length - 1];

      // Compare the character under inspection with the last segment added to the stack.
      // This comparison is crucial for applying the merging rule.
      if (lastSegmentOnTop === characterCurrentlyUnderInspection) {
        // If they match, a special merging operation occurs:
        // Concatenate the character immediately preceding the current one (if it exists)
        // with the character currently under inspection.
        const precedingCharacter = getCharacterOrEmpty(cleanedSourceString, currentTraversalIndex - 1);
        segmentAccumulationStack.push(precedingCharacter + characterCurrentlyUnderInspection);

        // Important: Decrement the traversal index an additional time.
        // This effectively 'skips' the character that was just incorporated into a merged segment
        // and ensures the loop continues from the correct next position.
        currentTraversalIndex--;
      } else {
        // If no match, the current character is added as a new, distinct segment.
        segmentAccumulationStack.push(characterCurrentlyUnderInspection);
      }
    }
  }

  // After the traversal, the initial count of segments is simply the size of the stack.
  let finalCalculatedSegmentCount = segmentAccumulationStack.length;

  // Apply a final, specific adjustment rule based on the very beginning of the input string.
  // This check modifies the segment count if the first two characters are identical.

  const initialCharacter = getCharacterOrEmpty(cleanedSourceString, 0);
  const subsequentCharacter = getCharacterOrEmpty(cleanedSourceString, 1);

  // The condition ensures both characters exist and are identical before decrementing.
  if (initialCharacter !== "" && subsequentCharacter !== "" && initialCharacter === subsequentCharacter) {
    // Decrement the total segment count as per the rule.
    finalCalculatedSegmentCount--;
  }

  // Output the final computed segment count to the console.
  // Explicitly convert the numerical count to a string for consistent output.
  console.log(String(finalCalculatedSegmentCount));
}

// --- Standard Input Handling Section ---

// Define the standard path for reading input, typically '/dev/stdin' in competitive programming environments.
const standardInputSourcePath = "/dev/stdin";
let receivedRawInput = ""; // Variable to hold the content read from the input source.

try {
  // Attempt to read the entire file synchronously from the specified path.
  // 'utf8' encoding is crucial for correct character interpretation.
  const fileSystemModule = require("fs");
  receivedRawInput = fileSystemModule.readFileSync(standardInputSourcePath, "utf8");
} catch (fileReadError) {
  // If an error occurs during file reading (e.g., file not found, permission issues),
  // log the error message for debugging purposes.
  console.error(`An error occurred while attempting to read input from '${standardInputSourcePath}': ${fileReadError.message}`);
  // In case of an input read failure, provide an empty string as fallback.
  // This allows the main processing function to handle an empty input gracefully.
  receivedRawInput = "";
}

// Invoke the main string processing function with the content obtained from standard input.
ProcessInputStringSegments(receivedRawInput);