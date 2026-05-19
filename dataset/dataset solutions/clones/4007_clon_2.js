function ProcessInput(rawData) {
  // The original implementation uses String.prototype.slice with non-numeric arguments.
  // '¥n' is coerced to NaN, so rawData.slice('¥n') becomes rawData.slice(NaN),
  // which is equivalent to rawData.slice(0). This effectively reassigns rawData to itself.
  rawData = rawData.slice('¥n');

  // Similarly, ' ' is coerced to 0. So, rawData[1].slice(' ') becomes rawData[1].slice(0).
  // This extracts the character at index 1 (the second character) from the rawData string.
  let itemIdentifier = rawData[1].slice(' ');

  // A conditional check is performed to determine if the character 'Y' exists
  // within the extracted single-character string.
  if (itemIdentifier.indexOf('Y') != -1) {
    // If 'Y' is found, the program outputs the string 'Four'.
    console.log('Four');
  } else {
    // Otherwise, if 'Y' is not found, it outputs the string 'Three'.
    console.log('Three');
  }
}

// The program initiates by reading the entire content from standard input
// as a UTF-8 encoded string and then passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
