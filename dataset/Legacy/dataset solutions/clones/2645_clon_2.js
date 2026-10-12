// This function processes a given string to calculate a specific count.
function ProcessInput(sourceString) {
  // Initialize a counter variable.
  var resultCount = 0;
  // Declare an array to act as a character stack.
  var charStack = [];
  // Reassign the counter with the length of the input string.
  resultCount = sourceString.length;
  // A temporary string variable, currently unused.
  var tempBuffer = "";

  // Iterate through the input string from right to left.
  for (var idx = sourceString.length - 1; idx >= 0; idx--) {
    // Extract the current character.
    var currentChar = sourceString.slice(idx, idx + 1);

    // Check if the character stack is empty.
    if (charStack.length === 0) {
      // If empty, push the current character onto the stack.
      charStack.push(currentChar);
      // Move to the next iteration.
      continue;
    } else {
      // If not empty, get the last character pushed onto the stack.
      var lastStackedChar = charStack[charStack.length - 1];

      // Compare the last stacked character with the current character.
      if (lastStackedChar === currentChar) {
        // If they are identical, push a combined string of the previous character and current character.
        // This effectively consumes two characters from the input string in one step.
        charStack.push(sourceString.slice(idx - 1, idx) + currentChar);
        // Decrement the loop index to account for the extra character consumed.
        idx--;
      } else {
        // If they are different, just push the current character onto the stack.
        charStack.push(currentChar);
      }
    }
  }

  // Update the result count with the final size of the character stack.
  resultCount = charStack.length;

  // Extract the first character of the original input string.
  var initialChar = sourceString.slice(0, 1);
  // Extract the second character of the original input string.
  var nextChar = sourceString.slice(1, 2);

  // Perform a final check: if the first two characters are the same.
  if (initialChar === nextChar) {
    // If they are, decrement the result count.
    resultCount--;
  }

  // Output the final result count as a string to the console.
  console.log(resultCount.toString());
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
