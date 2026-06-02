function ProcessInput(rawData) {
  // This variable will store the integer limit from the first line of input.
  var limitVal = parseInt(rawData.split('\n')[0].trim());

  // This variable will hold the string content from the second line of input.
  var textString = rawData.split('\n')[1].trim();

  // Check if the length of the extracted string is less than or equal to the limit.
  if (textString.length <= limitVal) {
    // If it is, print the entire string to the console.
    console.log(textString);
  } else {
    // Otherwise, truncate the string to the specified limit and append an ellipsis.
    console.log(textString.substring(0, limitVal) + '...');
  }
}

// Read the entire content from standard input as a UTF-8 string
// and then pass it to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
