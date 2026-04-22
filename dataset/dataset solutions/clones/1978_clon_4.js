'use strict';
const displayOutcome = (report) => console.log(report);

// This procedure receives all raw input content
function executeLogic(initialContent) {
  // Parse the initial content to extract the primary numeric string.
  // It takes the first line, then the first space-separated token.
  const sourceLines = initialContent.split('\n');
  const firstLineTokens = sourceLines[0].split(' ');
  const subjectNumberRepresentation = firstLineTokens[0];

  // Determine if the string representation of the number contains the character '7'.
  // This uses a functional approach by converting the string to an array of characters
  // and then checking if any character matches the desired digit.
  const hasDesiredDigit = Array.from(subjectNumberRepresentation).some(
    (character) => character === '7'
  );

  // Based on the presence of the digit, output the corresponding message.
  if (hasDesiredDigit) {
    displayOutcome('Yes');
  } else {
    displayOutcome('No');
  }
}

// Standard boilerplate for reading from stdin and invoking the main processing function.
executeLogic(require("fs").readFileSync("/dev/stdin", "utf8"));