// This program processes an initial string to determine an outcome.
// It assumes the input string is provided through some mechanism,
// here represented by a predefined string variable.
// In a live environment, this might come from user input or a file.
let initialData = "abacaba"; // Sample input sequence for demonstration.

// Convert the input string into a mutable array of individual characters.
// This allows for efficient in-place modifications, similar to a StringBuffer.
let charCollection = initialData.split('');

// A boolean indicator representing the current state or 'turn' in a two-player game scenario.
// 'true' might signify player two's advantage, 'false' for player one.
let currentStatus = true;

// Commence the primary operational loop, which continues as long as modifications occur.
while (true) {
  // Ascertain the present number of elements within the character collection.
  let sequenceSize = charCollection.length;

  // A local flag to track if any alteration was made during this iteration of the inner loop.
  let modificationPerformed = false;

  // Traverse through the collection, excluding the very first and very last elements.
  for (let elementPosition = 1; elementPosition < sequenceSize - 1; elementPosition++) {
    // Evaluate if the character immediately preceding the current position
    // is not identical to the character immediately succeeding it.
    if (charCollection[elementPosition - 1] !== charCollection[elementPosition + 1]) {
      // If the condition holds, remove the character at the current position.
      charCollection.splice(elementPosition, 1);

      // Invert the state indicator, effectively switching the 'turn' or 'advantage'.
      currentStatus = !currentStatus;

      // Mark that a change has indeed taken place.
      modificationPerformed = true;

      // Terminate this inner traversal loop, as only one character is removed per outer cycle.
      break;
    }
  }

  // If no alterations were detected within the entire inner traversal,
  // it implies no further valid moves can be made, so exit the main loop.
  if (!modificationPerformed) {
    break;
  }
}

// Upon conclusion of the processing, output the final result based on the state indicator.
if (currentStatus) {
  // If the final state is 'true', declare the 'Second' entity as the victor.
  console.log("Second");
} else {
  // Otherwise, if the final state is 'false', declare the 'First' entity as the victor.
  console.log("First");
}