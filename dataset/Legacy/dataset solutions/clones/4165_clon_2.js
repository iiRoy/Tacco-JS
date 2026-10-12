"use strict";

// This function is designed to analyze a given string of characters.
const processInputData = function analyzeString(incomingData) {
  // Convert the entire input string into an array of individual characters.
  let characterArray = incomingData.split("");

  // Filter this character array to isolate only the elements that represent the digit '1'.
  const onesFound = characterArray.filter(function (singleChar) {
    // Perform a loose equality check to identify '1's.
    return singleChar == 1;
  });

  // Display the total count of '1's that were identified in the input.
  console.log(onesFound.length);
};

// Read the content from standard input synchronously and then pass it to our processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
