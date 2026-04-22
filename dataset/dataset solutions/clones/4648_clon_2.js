// This module defines a function for processing textual input by interleaving characters.
function ProcessInputData(rawDataString) {
  // Break down the received string into individual lines, using the newline character as a delimiter.
  const lineCollection = rawDataString.split("\n");

  // Secure the first line of text for primary processing.
  const firstContentLine = lineCollection[0];

  // Secure the second line of text for secondary processing.
  const secondContentLine = lineCollection[1];

  // Begin a counting loop that covers the combined character count of both content lines.
  for (let currentPosition = 0; currentPosition < firstContentLine.length + secondContentLine.length; currentPosition++) {
    // Determine if the current position index is an even number.
    if (currentPosition % 2 === 0) {
      // For even positions, output a character from the first content line.
      // The character's specific index is half of the current position.
      console.log(firstContentLine[currentPosition / 2]);
    } else {
      // For odd positions, output a character from the second content line.
      // The character's specific index is also half of the current position.
      console.log(secondContentLine[currentPosition / 2]);
    }
  }
} // Concludes the ProcessInputData routine.

// Initiate the data processing by reading the entire content from the standard input stream.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));