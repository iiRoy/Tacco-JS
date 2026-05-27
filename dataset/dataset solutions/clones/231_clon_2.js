const fileSystemModule = require("fs"); // Obtain the Node.js file system module.

// Read all content from standard input, interpreting it as UTF-8 text.
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Divide the input string into an array of substrings, using any whitespace character as a delimiter.
const inputSegments = rawInputContent.split(/\s/);

// Initialize an index to traverse the array of input segments.
let segmentIndex = 0;

// Declare a variable to hold the current processed numerical value.
let currentNumericValue;

// Begin a loop that processes each segment.
// The loop's condition involves assigning the next segment to 'currentNumericValue'
// and continues as long as the assigned value is truthy (not undefined, null, or an empty string).
// The 'segmentIndex' is incremented after each assignment.
for (
  ;
  (currentNumericValue = inputSegments[segmentIndex++]); // Assignment as condition
) {
  // Calculate the result using the formula (x^2 + x + 2) / 2.
  // JavaScript implicitly converts 'currentNumericValue' to a number for arithmetic operations.
  const computedResult =
    (currentNumericValue * currentNumericValue + currentNumericValue + 2) / 2;

  // Output the calculated result to the console.
  console.log(computedResult);
}
