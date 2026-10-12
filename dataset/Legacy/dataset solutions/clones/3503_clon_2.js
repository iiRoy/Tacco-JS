var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from the standard input stream.

// Split the entire input string into an array of individual characters.
var charArray = rawData.split('');

// Iterate through each character in the array and apply a transformation rule.
var transformedDigits = charArray.map((digitChar) => {
  // Convert the character to a number for comparison.
  if (Number(digitChar) === 1) {
    // If the numeric value is 1, substitute it with 9.
    return 9;
  } else {
    // For any other numeric value, substitute it with 1.
    return 1;
  }
});

// Join the transformed numeric values back into a single string,
// then convert that string to a number, and finally print it to the console.
console.log(Number(transformedDigits.join('')));
