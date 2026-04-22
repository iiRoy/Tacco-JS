"use strict";

// This program processes a specific input format to produce a single character output.
// It acts as the primary entry point for execution.
const processInputData = (incomingText) => {

  // The first line of the input string is parsed to extract two key components.
  const firstLineContent = incomingText.split("\n")[0];

  // The first component is expected to be the first space-separated token.
  const firstComponent = firstLineContent.split(" ")[0];

  // The second component is the second space-separated token on the same line.
  const secondComponent = firstLineContent.split(" ")[1];

  // A conditional check is performed based on the value of the first component.
  if (firstComponent === "D") {
    // If the first component is 'D', then a further check on the second component determines the output.
    console.log(
      secondComponent === "H" ? "D" : "H"
    );
  }
  else {
    // Otherwise, if the first component is not 'D', the second component is output directly.
    console.log(secondComponent);
  }
};

// The execution begins by reading the entire content of standard input.
// The read data is then passed to the main processing function.
processInputData(
  require('fs')
    .readFileSync(
      '/dev/stdin', // Specifies the standard input file path.
      'utf8'        // Ensures the input is read as UTF-8 encoded text.
    )
);