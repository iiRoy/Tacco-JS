// This script processes input from stdin to decode messages based on a T9-like keypad mapping.

process.stdin.resume(); // Ensures the standard input stream remains active.
process.stdin.setEncoding("utf8"); // Configures the character encoding for incoming data.

process.stdin.on("data", function (inputBuffer) {
  // Callback function executed when data is received from the standard input.
  var linesOfInput = inputBuffer.trim().split("\n"); // Cleans the raw input and splits it into an array of lines.

  var numCases = linesOfInput.shift(); // The first line contains the total number of test cases.

  // Defines the character mappings for a T9-style keypad.
  // The array index corresponds to the digit pressed.
  var keypadMappings = [
    "",          // Digit 0 (unused for character mapping)
    ".,!? ",     // Digit 1
    "abc",       // Digit 2
    "def",       // Digit 3
    "ghi",       // Digit 4
    "jkl",       // Digit 5
    "mno",       // Digit 6
    "pqrs",      // Digit 7
    "tuv",       // Digit 8
    "wxyz"       // Digit 9
  ];

  // Transforms each string mapping into an array of individual characters.
  keypadMappings = keypadMappings.map(function (mappingString) {
    return mappingString.split("");
  });

  // Iterates through each of the specified test cases.
  for (var caseIndex = 0; caseIndex < numCases; caseIndex++) {
    // Parses the current test case's digit sequence into an array of numbers.
    var currentCaseDigits = linesOfInput[caseIndex].split("").map(Number);

    var decodedMessage = '';    // Accumulates the characters to form the final message.
    var currentCharacter = '';  // Stores the character being formed by consecutive key presses.
    var pressCount = 0;         // Tracks the number of consecutive presses for the current key.

    // Processes each digit in the current sequence.
    currentCaseDigits.forEach(function (digitValue) {
      if (digitValue > 0) {
        // If the digit is non-zero, it's a character key press.
        // Determines the character based on the digit and the current press count (modulo the key's character length).
        currentCharacter = keypadMappings[digitValue][pressCount % keypadMappings[digitValue].length];
        pressCount++; // Increments the press counter for the current key.
      } else {
        // If the digit is zero, it signifies the completion of a character.
        decodedMessage += currentCharacter; // Appends the formed character to the message.
        currentCharacter = '';              // Resets the temporary character storage.
        pressCount = 0;                     // Resets the press counter.
      }
    });

    // Prints the fully decoded message for the current test case to the console.
    console.log(decodedMessage);
  }
});
