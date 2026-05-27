function processInput(inputData) {
  // Retrieve the numeric character limit from the first line of input.
  const charLimit = +inputData[0];
  // Obtain the source text string from the second line of input.
  const originalText = inputData[1];

  // Determine the resulting string based on the specified character limit.
  // If the original text's length exceeds the limit, truncate it and append an ellipsis.
  // Otherwise, the full original text is used.
  let finalOutput = charLimit < originalText.length
    ? originalText.slice(0, charLimit) + '...' // Truncate and add '...'
    : originalText; // Use the complete string

  // Print the computed final string to the standard output.
  console.log(finalOutput);
}

// Initiate the main processing flow.
// This involves reading data from standard input, decoding it as UTF-8,
// removing any leading or trailing whitespace, and then splitting it into an array of lines.
processInput(
  require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n")
);


// This is a helper function designed to split a given string by spaces
// and then convert each resulting substring into a numerical value.
// Note: This particular function is defined but not invoked within the primary execution path of this script.
function divideAndConvert(textSegment) {
  return textSegment.split(' ').map(Number);
}
