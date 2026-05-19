function processInput() {
  // Define character code constants for 'a', 't', and 'z'
  var charA = 97, // ASCII value for 'a'
      charT = 116, // ASCII value for 't'
      charZ = 122; // ASCII value for 'z'

  /**
   * Shifts a character by a given amount.
   * Handles spaces and periods by returning them unchanged.
   * Performs a wrap-around shift for lowercase letters.
   * @param {string} inputChar The character to shift.
   * @param {number} shiftAmount The amount to shift the character by.
   * @returns {string} The shifted character.
   */
  function shiftChar(inputChar, shiftAmount) {
    if (inputChar === ' ' || inputChar === '.') {
      return inputChar; // Preserve whitespace and punctuation
    }
    let charCode = inputChar.charCodeAt(0);
    charCode -= shiftAmount; // Apply the shift
    // Handle wrap-around for characters that go below 'a'
    return String.fromCharCode(charCode > charZ ? charA + charCode - charZ : charCode);
  }

  /**
   * Determines the shift amount based on a reference character.
   * This function calculates the difference from 't' and handles negative results by wrapping around.
   * @param {string} referenceChar The character used to determine the shift.
   * @returns {number} The calculated shift amount.
   */
  function determineShift(referenceChar) {
    let charCode = referenceChar.charCodeAt(0) - charT;
    // If the difference is negative, wrap it around from 'z'
    return charCode < 0 ? (charZ - charT) + -charCode : charCode;
  }

  // Iterate over each line of the raw input data
  rawData.forEach(function(currentLine) {
    let calculatedShift; // Variable to store the determined shift for the current line
    let lineSegments; // Array to hold words/segments from the line

    // Skip empty lines after trimming
    if (currentLine.trim() === "") {
      return;
    }

    // Split the line into segments using space or period as delimiters
    lineSegments = currentLine.split(/[ \.]/g);

    // Loop through each segment to find the correct shift amount
    for (let segmentIndex = 0; segmentIndex < lineSegments.length; segmentIndex++) {
      // Calculate a potential shift based on the current segment
      calculatedShift = determineShift(lineSegments[segmentIndex]);

      // Decrypt the current segment using the potential shift and check if it matches target words
      if (lineSegments[segmentIndex].split('').map(function(charToProcess) {
        return shiftChar(charToProcess, calculatedShift);
      }).join('') in {
        'the': 0,
        'this': 0,
        'that': 0
      }) {
        // If a match is found, the correct shift is determined, so break the loop
        break;
      }
    }

    // Apply the determined shift to the entire line and print the result
    console.log(currentLine.split('').map(function(charToProcess) {
      return shiftChar(charToProcess, calculatedShift);
    }).join(''));
  });
}

// Global variable to accumulate incoming data
var rawData = "";

// Set up standard input processing
process.stdin.resume(); // Keep the process alive
process.stdin.setEncoding("utf8"); // Expect UTF-8 encoded input

// Event listener for incoming data chunks
process.stdin.on("data", function(chunk) {
  rawData += chunk; // Append each chunk to the rawData string
});

// Event listener for the end of input stream
process.stdin.on("end", function() {
  rawData = rawData.split("\n"); // Split the accumulated data into an array of lines
  processInput(); // Call the main processing function
});
