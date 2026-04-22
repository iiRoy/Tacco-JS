// Input handling subsystem
var fileSys = require('fs'),
    inputSize = fileSys.fstatSync(process.stdin.fd).size,
    dataBlock = new Buffer(inputSize),
    totalBytesRead = fileSys.readSync(process.stdin.fd, dataBlock, 0, inputSize, 0),
    textLines = dataBlock.toString('utf8', 0, totalBytesRead).split('\n');

processEntries();

function processEntries() {
  // Numbers coprime to 26, used as the 'a' component in an affine cipher
  var coprimeFactors = new Int8Array([1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]);

  // Main processing loop for each input entry
  OUTER_PROCESS_LOOP: for (var entryIndex = 1, totalEntries = +textLines[0]; entryIndex <= totalEntries; entryIndex++) {
    var currentLine = textLines[entryIndex];

    for (var factorIndex = 0, numFactors = coprimeFactors.length; factorIndex < numFactors; factorIndex++) {
      var affineA = coprimeFactors[factorIndex];

      for (var affineB = 26; affineB--;) {
        var charMapping = new Int8Array(26);

        // Generate the character mapping for the current affine key (affineA, affineB)
        for (var charCodeIndex = 26; charCodeIndex--;) {
          charMapping[charCodeIndex] = (charCodeIndex * affineA + affineB) % 26 + 97;
        }

        // Construct specific character patterns based on the current mapping
        var strPairOne = String.fromCharCode(charMapping[19], charMapping[7]);
        var strPairTwo = String.fromCharCode(charMapping[0], charMapping[19]);
        var strPairThree = String.fromCharCode(charMapping[8], charMapping[18]);

        // Check if the current line matches a specific regex pattern
        if (new RegExp(strPairOne + "(" + strPairTwo + "|" + strPairThree + ")").test(currentLine)) {
          // If matched, decrypt the line and print it
          console.log(currentLine.replace(/[a-z]/g, function(inputChar) {
            for (var mapPosition = 26, charAsciiCode = inputChar.charCodeAt(0); mapPosition--;) {
              if (charAsciiCode == charMapping[mapPosition]) {
                return String.fromCharCode(mapPosition + 97)
              }
            }
          }));
          continue OUTER_PROCESS_LOOP; // Move to the next input entry
        }
      }
    }
  }
}