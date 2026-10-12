'use strict'; // Enable strict mode for cleaner code execution

function processInput(dataString) { // This function processes the provided input string
  let resultString = ''; // Initialize an empty string to accumulate the transformed characters

  // Convert the input string into an array of individual characters for easier iteration
  dataString = dataString.split('');

  // Iterate over each character in the character array using a for...in loop
  for (let idx in dataString) {
    // Check the value of the current character
    // If the character is '1', append '9' to the result string
    // Otherwise (if it's not '1'), append '1' to the result string
    resultString += (dataString[idx] === '1') ? '9' : '1';
  }

  // Print the final transformed string to the console
  console.log(resultString);
}

// Read the entire content from standard input synchronously, assuming UTF-8 encoding,
// and then pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
