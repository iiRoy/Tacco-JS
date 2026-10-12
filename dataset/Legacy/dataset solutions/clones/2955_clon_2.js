"use strict";

// This function processes a given input string to determine date format ambiguity.
function ProcessInput(dataString) {
  // Extract the first two characters and convert them to an integer.
  const initialValue = parseInt(dataString.slice(0, 2));
  // Extract the remaining characters (from index 2 onwards) and convert them to an integer.
  const subsequentValue = parseInt(dataString.slice(2));

  // Check if the first extracted value represents a valid month (1-12).
  const isInitialMonth = 0 < initialValue && initialValue < 13;
  // Check if the second extracted value represents a valid month (1-12).
  const isSubsequentMonth = 0 < subsequentValue && subsequentValue < 13;

  // Evaluate the possible date formats based on month validity.
  if (isInitialMonth && isSubsequentMonth) {
    // If both parts can be months, the format is ambiguous.
    console.log('AMBIGUOUS');
    return; // Exit the function after printing.
  } else if (isInitialMonth) {
    // If only the first part is a month, it's MMYY format.
    console.log('MMYY');
    return; // Exit the function.
  } else if (isSubsequentMonth) {
    // If only the second part is a month, it's YYMM format.
    console.log('YYMM');
    return; // Exit the function.
  }

  // If neither part can be interpreted as a valid month, the format is not applicable.
  console.log('NA');
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
