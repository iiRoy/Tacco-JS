var fileSystem = require('fs');

// Determine the size of the standard input stream
var dataSize = fileSystem.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data
var dataBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
var readBytes = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

// Convert the buffer content to a string, then split by newline
var sourceLines = dataBuffer.toString('utf8', 0, readBytes).split('\n');

// Execute the primary processing function
processInput();

function processInput() {
  // Array of integers coprime to 26 (used as multipliers in affine cipher)
  var coprimeFactors = new Int8Array([1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]);

  // Iterate through each input line, starting from the second line (index 1)
  MAIN_LOOP: for (var lineIndex = 1, totalLines = +sourceLines[0]; lineIndex <= totalLines; lineIndex++) {
    var currentLine = sourceLines[lineIndex];

    // Iterate through each coprime factor
    for (var factorIndex = 0, numFactors = coprimeFactors.length; factorIndex < numFactors; factorIndex++) {
      var multiplierA = coprimeFactors[factorIndex];

      // Iterate through possible offset values (0 to 25)
      for (var offsetB = 26; offsetB--;) {
        // Create a mapping for the affine cipher
        var charMap = new Int8Array(26);
        for (var charVal = 26; charVal--;) {
          charMap[charVal] = (charVal * multiplierA + offsetB) % 26 + 97;
        }

        // Generate specific two-character sequences based on the current cipher map
        var patternPartOne = String.fromCharCode(charMap[19], charMap[7]); // 'th' equivalent
        var patternPartTwo = String.fromCharCode(charMap[0], charMap[19]); // 'at' equivalent
        var patternPartThree = String.fromCharCode(charMap[8], charMap[18]); // 'is' equivalent

        // Check if the current line contains the pattern "th(at|is)" using the generated characters
        if (new RegExp(patternPartOne + "(" + patternPartTwo + "|" + patternPartThree + ")").test(currentLine)) {
          // If found, decrypt the line and print it
          console.log(currentLine.replace(/[a-z]/g, function (charToReplace) {
            for (var mapIndex = 26, charAscii = charToReplace.charCodeAt(0); mapIndex--;) {
              if (charAscii == charMap[mapIndex]) {
                return String.fromCharCode(mapIndex + 97);
              }
            }
          }));
          // Move to the next input line
          continue MAIN_LOOP;
        }
      }
    }
  }
}
