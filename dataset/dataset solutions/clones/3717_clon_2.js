"use strict";

/*
 * This function processes the provided string data.
 * It iterates through each character and performs an arithmetic operation
 * based on whether the character is a plus or minus sign.
 */
function ProcessInput(rawData) {
  // Initialize a counter for the final tally.
  let finalCount = 0;

  // Split the input string into individual characters and iterate over them.
  rawData.split("").forEach(charElement => {
    // If the current character is a plus sign, increment the counter.
    if (charElement === "+") {
      finalCount++;
    }
    // If the current character is a minus sign, decrement the counter.
    if (charElement === "-") {
      finalCount--;
    }
  });

  // Output the computed final count to the console.
  console.log(finalCount);
}

// The following line handles standard input/output and should not be modified.
// It reads the entire content from /dev/stdin and passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
