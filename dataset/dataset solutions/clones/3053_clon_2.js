function ProcessInput(rawData) {
  // Convert the raw input string into an array of characters for easier manipulation.
  let charArray = rawData.split('');

  // Initialize a counter to keep track of the number of detected modifications.
  let modificationTally = 0;

  // A boolean flag to indicate if the current sequence of characters is undergoing a change.
  let isChangingSequence = false;

  // Iterate through the character array, starting from the second element,
  // to compare each character with its preceding one.
  for (let idx = 1; idx < charArray.length; idx++) {
    // Check if the current character is identical to the previous one
    // AND if we are not currently within a changing sequence.
    if (charArray[idx] === charArray[idx - 1] && !isChangingSequence) {
      // If both conditions are met, it signifies the start of a new changing sequence.
      isChangingSequence = true;
      modificationTally++; // Increment the tally as a modification is initiated.
    }
    // Otherwise, check if the current character is different from the previous one
    // AND if we are currently within a changing sequence.
    else if (charArray[idx] !== charArray[idx - 1] && isChangingSequence) {
      // If these conditions hold, it means the existing changing sequence continues.
      modificationTally++; // Increment the tally for the ongoing modification.
    }
    // In all other scenarios (e.g., characters are different and not in a changing sequence,
    // or characters are the same and already in a changing sequence).
    else {
      // Reset the flag, as the changing sequence has either ended or was not active.
      isChangingSequence = false;
    }
  }

  // Output the final calculated number of modifications to the standard console.
  console.log(modificationTally);
}

// Read the entire content from standard input as a UTF-8 string
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
