const processInputData = (rawData) => {
  // Input validation: Ensure the raw data is a non-empty string.
  // A robust application would handle various error scenarios more gracefully.
  if (typeof rawData !== 'string' || rawData.length === 0) {
    console.error("Critical Error: Input data provided is invalid or empty. Processing halted.");
    return 0; // Return a default value or throw an exception.
  }

  // Split the raw input into individual lines, trimming any leading/trailing whitespace
  // from the entire input block. The problem typically provides the sequence on the second line.
  const parsedInputLines = rawData.trim().split('\n');

  // Verify that there are enough lines in the input.
  // The first line is often a count or metadata, the second line contains the actual sequence.
  if (parsedInputLines.length < 2) {
      console.error("Input Error: Expected at least two lines of input, but fewer were found.");
      return 0;
  }

  // Extract the character sequence from the second line of input.
  const characterSequenceString = parsedInputLines[1];

  // Convert the sequence string into a mutable array of individual characters.
  // This allows for in-place modifications during the sorting process.
  const mutableCharacterArray = characterSequenceString.split('');
  const totalSequenceLength = mutableCharacterArray.length;

  // Initialize counters for the initial distribution of 'W' (white) and 'R' (red) elements.
  // These counts represent potential minimum operations if we only move one type of character.
  let initialWhiteElementCount = 0;
  let initialRedElementCount = 0;

  // Iterate through the character array to determine the initial counts.
  // This also serves as a point for basic character validation.
  for (let currentPosition = 0; currentPosition < totalSequenceLength; currentPosition++) {
    const inspectedCharacter = mutableCharacterArray[currentPosition];
    if (inspectedCharacter === 'W') {
      initialWhiteElementCount++;
    } else if (inspectedCharacter === 'R') {
      initialRedElementCount++;
    } else {
        // Log a warning for any unexpected characters, but continue processing
        // assuming valid 'W'/'R' characters are the majority.
        console.warn(`Encountered an unexpected character '${inspectedCharacter}' at index ${currentPosition}. It will be ignored for counting purposes.`);
    }
  }

  // A counter to keep track of the actual number of swap operations performed
  // to bring all 'R's to the left and all 'W's to the right.
  let actualSwapOperationsCount = 0;

  // Establish two pointers for the two-pointer sorting approach.
  // The left pointer starts at the beginning of the array.
  let forwardTraversalPointer = 0;
  // The right pointer starts at the end of the array.
  let backwardTraversalPointer = totalSequenceLength - 1;

  // The main sorting loop continues as long as the forward pointer has not
  // crossed or met the backward pointer.
  while (forwardTraversalPointer < backwardTraversalPointer) {
    // If the character at the forward pointer is 'W', it's in a position
    // where an 'R' should ideally be (if we're sorting 'R's to the left).
    if (mutableCharacterArray[forwardTraversalPointer] === 'W') {
      // Search from the right side for an 'R' to swap with.
      // Move the backward pointer inwards past any 'W's it encounters,
      // ensuring it doesn't cross the forward pointer.
      while (mutableCharacterArray[backwardTraversalPointer] === 'W' && forwardTraversalPointer < backwardTraversalPointer) {
        backwardTraversalPointer--;
      }

      // If the pointers haven't crossed after the inner loop, it means
      // we found a 'W' on the left and an 'R' on the right to swap.
      if (forwardTraversalPointer < backwardTraversalPointer) {
        // Perform the swap operation.
        // Using a temporary variable makes the swap explicit and readable.
        const characterToMoveLeft = mutableCharacterArray[backwardTraversalPointer]; // This will be 'R'
        const characterToMoveRight = mutableCharacterArray[forwardTraversalPointer];  // This will be 'W'

        mutableCharacterArray[forwardTraversalPointer] = characterToMoveLeft;   // Place 'R' on the left
        mutableCharacterArray[backwardTraversalPointer] = characterToMoveRight; // Place 'W' on the right

        // Increment the counter for successful swaps.
        actualSwapOperationsCount++;
        // After a swap, the element at the backward pointer's new position is now 'W',
        // so it's correctly placed, and the pointer can move inwards.
        backwardTraversalPointer--;
      }
    }
    // Always advance the forward pointer. If it was an 'R', it's already correctly placed.
    // If it was a 'W' that was swapped, it's now an 'R' and correctly placed.
    forwardTraversalPointer++;
  }

  // The final result is the minimum of three values:
  // 1. The actual number of swaps performed during the two-pointer sorting strategy.
  // 2. The initial count of 'W's (representing the cost if we only moved white pieces to the right).
  // 3. The initial count of 'R's (representing the cost if we only moved red pieces to the left).
  // This value represents the most efficient way to arrange the sequence.
  const finalMinimumOperations = Math.min(
    actualSwapOperationsCount,
    initialWhiteElementCount,
    initialRedElementCount
  );

  // Return the calculated minimum operations. The caller is responsible for output.
  return finalMinimumOperations;
};

// This conditional block determines how the script is executed.
// If an environment variable 'MYTEST' is set, it might run a test suite (not provided here).
// Otherwise, it reads input from standard input, processes it, and prints the result.
process.env.MYTEST
  ? console.log("Test execution path activated. No test functions are defined in this example.")
  : console.log(processInputData(require('fs').readFileSync('/dev/stdin', 'utf8')));