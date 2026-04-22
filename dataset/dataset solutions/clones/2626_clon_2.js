"use strict";
const ProcessInput = (incomingData) => {
  let lineContents = incomingData .  trim()
                                  .  split('\n');

  let numericThreshold = parseInt(lineContents[0], 10); // Convert first line to an integer
  let colorIdentifier  = lineContents[1];

  // Debugging: Displaying parsed lines was here.

  if (numericThreshold >= 3200) {
    console.log(colorIdentifier);
  }
  else if (numericThreshold < 3200)
  {
    if (colorIdentifier === "pink") {
      console.log("red");
    }
    else if (colorIdentifier === "red") {
      console.log("pink");
    }
  }
};

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));