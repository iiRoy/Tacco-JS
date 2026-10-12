(function (rawData) {
  // This self-executing function processes input data.
  // It reads lines, converts them to numbers, and calculates the sum of their digits.

  // Split the entire input string into an array of individual lines.
  var linesOfText = rawData.split('\n');

  // Iterate over each line obtained from the input.
  for (var idx = 0; idx < linesOfText.length; idx++) {
    // Convert the current line (which is a string) into a numerical value.
    var currentNum = Number(linesOfText[idx]);

    // If the converted number is zero, terminate the processing.
    if (currentNum === 0) {
      return; // Exit the anonymous function.
    }

    // Calculate the sum of the digits for the current number.
    // 1. Convert the number back to a string.
    // 2. Split the string into an array of individual character digits.
    // 3. Map each character digit back to its numerical representation.
    // 4. Use reduce to sum all the numerical digits.
    console.log(
      String(currentNum)
        .split('')
        .map(Number)
        .reduce(function (accumulator, currentDigit) {
          return accumulator + currentDigit; // Add the current digit to the running total.
        })
    );
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input as a UTF-8 string.
