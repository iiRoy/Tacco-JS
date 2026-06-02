"use strict";

// This script processes some input data.
const processInputData = (rawInputContent) => {
  // Trim whitespace and split the input by newlines.
  rawInputContent = rawInputContent.trim().split("\n");

  // Get the first line and split it into an array of characters.
  const firstLineChars = rawInputContent[0].split("");

  // Check if the first four characters form "YAKI".
  if (firstLineChars.slice(0, 4).join("") === "YAKI") {
    // If they do, print "Yes".
    console.log("Yes");
  } else {
    // Otherwise, print "No".
    console.log("No");
  }
};

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
