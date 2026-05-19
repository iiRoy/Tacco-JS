function processData(rawData) {
  // The incoming raw string is split into an array of parts using space as a delimiter.
  // The original parameter variable is then updated to hold this new array.
  rawData = rawData.split(" ");

  // A validation check is performed on the first two elements of the array.
  // Both elements must be numerical values between 1 and 10, inclusive.
  if (
    (rawData[0] < 1 || rawData[0] > 10) ||
    (rawData[1] < 1 || rawData[1] > 10)
  ) {
    // If either of the conditions for valid input is not met,
    // a specific error code (-1) is printed to the console, and the function exits.
    return console.log(-1);
  }

  // If the input passes validation, the product of the two numerical elements
  // is calculated and then displayed on the console. The function then exits.
  return console.log(rawData[0] * rawData[1]);
}

// This is the entry point for the script's execution.
// It reads the entire content of the standard input stream as a UTF-8 encoded string,
// and then passes this string to the 'processData' function for processing.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
