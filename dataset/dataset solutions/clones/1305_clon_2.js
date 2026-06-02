var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var processedString = ''; // Initialize an empty string to store the modified characters

// Iterate through each character of the input data
for (var idx = 0; idx < rawData.length; idx++) {
  // Check if the current character is an uppercase letter (ASCII 65-90)
  if (rawData.charCodeAt(idx) >= 65 && rawData.charCodeAt(idx) <= 90) {
    // If it's an uppercase letter, convert it to lowercase and append to the result
    processedString = processedString + rawData.charAt(idx).toLowerCase();
  } else {
    // Otherwise (if it's lowercase, a number, symbol, etc.), convert it to uppercase
    // and append to the result
    processedString = processedString + rawData.charAt(idx).toUpperCase();
  }
}

// Print the final processed string, removing any leading/trailing whitespace
console.log(processedString.trim());
