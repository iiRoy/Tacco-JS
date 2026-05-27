let dataStack = []; // Initialize an array to function as a stack for processing input.

// Read the entire content from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and then split it into an array of lines.
require("fs").readFileSync("/dev/stdin", "utf8")
  .trim()
  .split('\n')
  .map(function(currentLine) {
    // For each line obtained from the input:
    // Attempt to convert the line to a number using the unary plus operator.
    // If the result is a truthy value (i.e., a non-zero number),
    // push the original line onto our data stack.
    // Otherwise (if the conversion results in 0, NaN, or an empty string, which are falsy),
    // pop the last element from the data stack and print it to the console.
    ( +currentLine )
      ? dataStack.push(currentLine)
      : console.log(dataStack.pop());
  });
