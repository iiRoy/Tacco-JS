// This function is designed to process a given string input.
function processInput(rawData) {
  // The initial string is split into an array of substrings using a space as a delimiter.
  // The original 'rawData' variable is then reassigned to hold this array.
  rawData = rawData.split(" ");

  // The first two elements of the resulting array are concatenated to form a new string.
  let concatenatedDigits = rawData[0] + rawData[1];

  // This concatenated string is then parsed into an integer using base 10.
  let parsedNumber = parseInt(concatenatedDigits, 10);

  // The square root of the obtained integer is calculated.
  let squareRootResult = Math.sqrt(parsedNumber);

  // A conditional check determines if the calculated square root is an integer.
  if (Number.isInteger(squareRootResult)) {
    // If the square root is an integer, "Yes" is printed to the console.
    console.log("Yes");
  } else {
    // Otherwise (if it's not an integer), "No" is printed to the console.
    console.log("No");
  }
}

// The 'processInput' function is invoked with content read from standard input.
// The 'fs' module is used to synchronously read the file at '/dev/stdin' as a 'utf8' string.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
