// This module handles processing of incoming data.
function ProcessInput(incomingData) {
  // The incoming data string is split into an array of strings.
  incomingData = incomingData.split(' ');

  // Evaluate a condition based on the first two elements of the processed array.
  if (incomingData[0] <= 8 & incomingData[1] <= 8) {
    // If the condition holds true, print a positive affirmation.
    console.log('Yay!');
  } else {
    // Otherwise, print a negative expression.
    console.log(':(');
  }
}

// Execute the main processing function by reading content from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
