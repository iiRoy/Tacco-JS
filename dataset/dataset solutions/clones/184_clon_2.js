let totalProductSum = 0; // Accumulates the sum of products, corresponds to 't'
let elementSum = 0;      // Accumulates the sum of specific elements, corresponds to 's'

// Obtain the file system module to read input.
const fileSystemModule = require("fs");

// Read the entire content from standard input as a UTF-8 string.
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Split the input string into an array of substrings.
// Delimiters are any whitespace character or a comma.
// This preserves empty strings resulting from consecutive delimiters, matching original behavior.
const numericStrings = rawInputContent.split(/\s|,/); // Corresponds to 'i'

// Determine the index of the last element in the array.
// This value is also used in the final calculation.
const lastElementIndex = numericStrings.length - 1; // Corresponds to 'a'

// Initialize a loop counter with the last element's index.
// The loop continues as long as 'currentLoopIndex' is truthy (non-zero) *before* its post-decrement in the condition.
// The original loop structure is `for (a=j=i.length-1; j--;)`.
// This means 'j' is decremented in the condition, and then again inside the loop body.
for (let currentLoopIndex = lastElementIndex; currentLoopIndex > 0; ) {
  // The first decrement of the index happens here, mimicking the `j--` in the original `for` condition.
  currentLoopIndex--;

  // Get the numeric value of the element at the current 'currentLoopIndex'.
  // The index is then decremented a second time, mimicking `+i[j--]`.
  const currentNumericValue = Number(numericStrings[currentLoopIndex--]); // Corresponds to 'b'

  // Add the obtained numeric value to the 'elementSum'.
  elementSum += currentNumericValue;

  // Multiply 'currentNumericValue' by the element at the *new* 'currentLoopIndex'
  // (which is now two positions to the left of its value at the start of this iteration).
  // Add this product to 'totalProductSum'.
  totalProductSum += currentNumericValue * Number(numericStrings[currentLoopIndex]);
}

// Output the calculated 'totalProductSum', followed by a newline character.
// Then, output 'elementSum' divided by twice 'lastElementIndex', rounded to the nearest integer.
// `Math.floor(x + 0.5)` is a standard way to round to the nearest integer for non-negative x,
// equivalent to `~~(x + 0.5)` used in the original for this context.
console.log(
  totalProductSum +
    "\n" +
    Math.floor(elementSum / (lastElementIndex * 2) + 0.5)
);
