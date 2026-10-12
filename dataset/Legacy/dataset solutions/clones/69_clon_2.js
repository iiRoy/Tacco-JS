var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input data from standard input stream
var charArray = rawData.split(''); // Convert the input string into an array of individual characters

var finalOutput; // Declare a variable to store the resulting deciphered string
// Loop through all 26 possible Caesar cipher shift values (0 to 25)
for (var shiftValue = 0; shiftValue < 26; shiftValue++) {
    // Process the character array by applying a shift to each character
    var processedString = charArray.reduce(function(accumulator, currentChar) {
        var transformedChar; // Temporary variable for the character after transformation

        // Check if the current character is outside the lowercase English alphabet range
        if (currentChar < 'a' || currentChar > 'z') {
            transformedChar = currentChar; // If not a letter, keep it unchanged
        }
        else {
            // Apply a specific character transformation based on the shift value
            // This formula is derived directly from the original code's logic
            transformedChar = String.fromCharCode((currentChar.charCodeAt(0) + shiftValue) % 26 + 'a'.charCodeAt(0));
        }
        return accumulator + transformedChar; // Append the transformed character to the accumulating string
    }, ''); // Start with an empty string for the accumulation

    // Check if the processed string contains any of the target keywords
    if (processedString.indexOf('the') >= 0 || processedString.indexOf('this') >= 0 || processedString.indexOf('that') >= 0) {
        finalOutput = processedString; // If a keyword is found, store this string as the result
        break; // Exit the loop as the correct deciphered string has been identified
    }
}
console.log(finalOutput); // Print the final deciphered string to the console
