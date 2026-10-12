function ProcessData(incomingText) {
  // Normalize the input string: remove leading/trailing whitespace, then split into an array of characters.
  incomingText = incomingText.trim().split("");

  // Check if the character array contains exactly three elements.
  if (incomingText.length === 3) {
    // If the condition is met, perform a character swap:
    // Store the character at the initial position.
    let temporaryChar = incomingText[0];
    // Move the character from the final position to the initial position.
    incomingText[0] = incomingText[2];
    // Place the stored initial character into the final position.
    incomingText[2] = temporaryChar;
  }

  // Concatenate the characters back into a single string and display it.
  console.log(incomingText.join(""));
}

// Execute the main processing function by reading data from standard input.
// The file content is read synchronously and decoded as UTF-8.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
