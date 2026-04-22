// A dedicated module for processing character sequences to achieve a specific ordering.
// This utility aims to count the minimum number of full passes over a sequence
// required to sort all 'B' characters before 'W' characters by adjacent swaps.

const processInputString = (rawData) => {
  // Input validation: Ensure the provided data is a non-empty string.
  // An early exit is performed if the input is deemed invalid or absent.
  if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
    console.error("Error: Input string is either empty, not a string, or contains only whitespace.");
    return; // Terminate execution gracefully for erroneous input.
  }

  // Convert the cleaned input string into a mutable array of individual characters.
  // The Array.from method provides a clear way to create a new array instance.
  const characterSequence = Array.from(rawData.trim());

  // A local helper function to encapsulate the logic for a single potential swap.
  // It checks conditions for a swap and performs it if applicable.
  const executeConditionalSwap = (targetArray, currentPosition) => {
    // First, verify that we are not at the very last element, as a swap requires a next element.
    const isWithinValidBounds = currentPosition < targetArray.length - 1;
    // Then, check if the current character is 'B' and the subsequent one is 'W'.
    if (isWithinValidBounds && targetArray[currentPosition] === "B" && targetArray[currentPosition + 1] === "W") {
      // Perform the actual swap using a temporary variable for clarity.
      let temporaryHolder = targetArray[currentPosition];
      targetArray[currentPosition] = targetArray[currentPosition + 1];
      targetArray[currentPosition + 1] = temporaryHolder;
      return true; // Signal that a swap operation was successfully performed.
    }
    return false; // Indicate that no swap happened in this instance.
  };

  // This variable will accumulate the total count of passes where at least one swap occurred.
  let totalPassesWithSwaps = 0;
  // A boolean flag to track if any swap has taken place within a given full iteration.
  let didAnySwapHappenDuringIteration;

  // The main processing loop. It continues to iterate over the character sequence
  // as long as at least one swap was performed during the previous complete pass.
  do {
    didAnySwapHappenDuringIteration = false; // Reset the flag for the new iteration.
    // Cache the array length for performance within the loop, avoiding repeated property access.
    const currentSequenceLength = characterSequence.length;

    // Iterate through the sequence, checking each adjacent pair for a potential swap.
    // The loop runs up to the second-to-last element to always have a 'next' element.
    for (let currentIdx = 0; currentIdx < currentSequenceLength - 1; currentIdx++) {
      // Invoke the helper function to attempt a swap at the current index.
      if (executeConditionalSwap(characterSequence, currentIdx)) {
        didAnySwapHappenDuringIteration = true; // Mark that a swap indeed occurred.
      }
    }
    // If any swap occurred during this full pass, increment the global counter.
    if (didAnySwapHappenDuringIteration) {
        totalPassesWithSwaps++;
    }
  } while (didAnySwapHappenDuringIteration); // Continue the loop if any swap happened.

  // A simple utility function to output the final calculated result.
  const printFinalResult = (finalCount) => {
    console.log(finalCount);
  };

  // Display the total number of passes that involved at least one swap.
  printFinalResult(totalPassesWithSwaps);
};

// Entry point for script execution.
// This section is responsible for reading input from the standard input stream
// and initiating the core processing logic.
const fileSystemModuleReference = require("fs"); // Reference the Node.js file system module.
const standardInputPath = "/dev/stdin"; // Define the standard input file path.

// Read the entire content of the standard input file as a UTF-8 string.
const fileInputContent = fileSystemModuleReference.readFileSync(standardInputPath, "utf8");

// Invoke the main processing function with the obtained file content.
processInputString(fileInputContent);