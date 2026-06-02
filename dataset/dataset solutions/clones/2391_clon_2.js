function processInputData(rawDataLines) {
  // Extract the numeric shift value from the first line of input.
  // The '-0' ensures it's treated as a number.
  var cipherShift = rawDataLines[0] - 0;

  // Take the second line of input, split it into individual characters,
  // and then apply a transformation to each character.
  var encodedCharacters = rawDataLines[1].split("").map(originalChar => {
    // Convert the character to its ASCII code, subtract 65 (for 'A'),
    // add the shift value, apply modulo 26 (for alphabet wrap-around),
    // and then add 65 back to get the new ASCII code for an uppercase letter.
    return String.fromCharCode((originalChar.charCodeAt(0) - 65 + cipherShift) % 26 + 65);
  });

  // Join the transformed characters back into a single string and print it to the console.
  console.log(encodedCharacters.join(""));
}

// Read input from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and split it into an array of lines.
// Then, pass this array to our processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
