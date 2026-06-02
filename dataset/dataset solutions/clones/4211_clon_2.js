function ProcessInput(inputString) {
  // Remove leading and trailing whitespace from the provided string.
  let trimmedInput = inputString.trim();

  // Define the regular expression to check for the specific pattern.
  // This pattern matches "AKIHABARA" where each 'A' can optionally be present.
  const validationPattern = /^(A|)KIH(A|)B(A|)R(A|)$/;

  // Test the trimmed input against the pattern and print "YES" or "NO" accordingly.
  console.log(validationPattern.test(trimmedInput) ? "YES" : "NO");
}

// Read the entire content from standard input, assuming UTF-8 encoding.
const fileData = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the primary processing function with the data obtained from standard input.
ProcessInput(fileData);
