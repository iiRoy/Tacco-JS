function ProcessInput(inputString) {
  // Convert the provided input string into a numerical value.
  // This value determines the total number of iterations for sequence generation.
  var iterationCount = +inputString;

  // Initialize an array to store the sequence elements as they are generated.
  var resultCollection = [];
  // Initialize the primary digit, starting from 1.
  var currentDigit = 1;
  // Initialize an empty string that will accumulate '9's as a suffix.
  var suffixString = "";

  // Iterate a specified number of times, generating one sequence element per loop.
  for (var loopIndex = 0; loopIndex < iterationCount; loopIndex++) {
    // Concatenate the current digit (implicitly converted to string) with the suffix string.
    // Store this combined string in the results array at the current index.
    resultCollection[loopIndex] = currentDigit + suffixString;

    // Check if the current digit has reached its maximum value of 9.
    if (currentDigit === 9) {
      // If the digit is 9, reset it back to 1.
      currentDigit = 1;
      // Append a '9' to the suffix string, indicating a carry-over.
      suffixString += "9";
    } else {
      // If the digit is not 9, simply increment it for the next iteration.
      currentDigit++;
    }
  }

  // Output all generated sequence elements, with each element on a new line.
  console.log(resultCollection.join("\n"));
}

// Read the entire content from standard input, assuming UTF-8 encoding.
// Then, pass this content as a string to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
