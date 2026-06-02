function processInputData(incomingText) {
  // The raw input string is first divided into an array of individual lines.
  incomingText = incomingText.split("\n");

  // We extract the initial line from the array and remove any leading or trailing whitespace.
  const firstLineContent = incomingText[0].trim();

  // A specific character is extracted from the processed line.
  // This character is the first letter of the second word found in the initial line.
  // The final output string is then constructed by concatenating 'A', this extracted character, and 'C'.
  console.log('A' + firstLineContent.split(" ")[1][0] + 'C');
}

// This section is responsible for reading data from standard input and initiating the processing.
// It should not be altered to maintain the program's intended execution flow.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
