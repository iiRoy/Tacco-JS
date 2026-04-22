// Initialize first and second tally counts for processing input data
let firstTally = 0;
let secondTally = 0;

// Acquire the core Node.js file system module for input/output operations
const systemIO = require("node:fs");

// Read all incoming standard input data from the operating system's standard input stream
// utilizing the widely used UTF-8 character encoding scheme
const rawInputData = systemIO.readFileSync("/proc/self/fd/0", "utf-8");

// Process each individual line obtained from the raw input stream
rawInputData.split('\u000A').map(function(currentInputLine) {
  // Split the current line by the comma character, then arrange the resulting string items in ascending order
  let orderedComponents = currentInputLine.split('\u002C').sort();

  // Evaluate the relationship between the second and third elements (indices 1 and 2) after sorting.
  // This deeply nested conditional structure precisely mirrors the original's logical flow.
  orderedComponents[2] === orderedComponents[1]
    ? null // If the two largest components are identical, no action is taken on either tally.
    : (orderedComponents[1] === orderedComponents[2]
        ? firstTally++ // This specific execution path is logically unreachable due to the preceding equality check.
        : secondTally++ // Increment the second tally if the two largest components are distinct.
      );
});

// Output the final accumulated counts to the console,
// placing the value of the second tally first, followed by a newline, then the first tally.
console.log(secondTally + '\u000A' + firstTally);