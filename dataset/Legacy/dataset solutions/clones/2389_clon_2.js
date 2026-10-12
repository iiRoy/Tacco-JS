process.stdin.resume();
process.stdin.setEncoding('utf8');

// This array will hold all lines read from standard input.
var inputDataRows = [];

// Initialize a readline interface to process input line by line.
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout // Output stream is required but not directly used for this problem's output.
});

// Attach an event listener for each line received from the input stream.
inputProcessor.on('line', (currentLineText) => {
  inputDataRows.push(currentLineText); // Store the current line in our array.
});

// Attach an event listener for when the input stream is closed.
inputProcessor.on('close', () => {
  // The first line of input contains the numeric shift value for the cipher.
  var shiftAmount = parseInt(inputDataRows[0]);

  // The second line of input is the string that needs to be encoded.
  var characterSequence = inputDataRows[1];
  // Convert the input string into an array of individual characters for easier processing.
  characterSequence = characterSequence.split('');

  // Define the standard uppercase English alphabet as a reference.
  var referenceAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Initialize an empty string to accumulate the characters of the encoded message.
  var encodedOutput = '';

  // Iterate through each character of the input sequence.
  for (var charIndex = 0; charIndex < characterSequence.length; charIndex++) {
    // Find the position (index) of the current character within our reference alphabet.
    var originalIndex = referenceAlphabet.indexOf(characterSequence[charIndex]);

    var shiftedIndex = 0; // This variable will hold the new index after applying the shift.

    // Apply the Caesar cipher logic:
    // If the shifted index goes beyond the end of the alphabet (index 25 for 'Z'),
    // wrap it around to the beginning by subtracting 26 (the alphabet length).
    if (originalIndex + shiftAmount > 25) {
      shiftedIndex = originalIndex + shiftAmount - 26;
    } else {
      // Otherwise, simply add the shift amount to get the new index.
      shiftedIndex = originalIndex + shiftAmount;
    }

    // Append the character from the reference alphabet at the calculated shifted index
    // to our accumulating encoded output string.
    encodedOutput += referenceAlphabet[shiftedIndex];
  }

  // Finally, print the complete encoded string to the console.
  console.log(encodedOutput);
});
