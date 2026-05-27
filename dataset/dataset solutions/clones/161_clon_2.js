var fileSystemModule = require('fs');
var dataLength = fileSystemModule.fstatSync(process.stdin.fd).size;
var inputBuffer = new Buffer(dataLength);
var readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);
var hexInputLines = inputBuffer.toString('hex', 0, readBytesCount).split('0a');

processCipher();
 
function processCipher() {
  // Array of numbers coprime to 26, representing possible 'a' values in an affine cipher.
  var coprimeFactors = new Int8Array([1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]);
  var factorCount = coprimeFactors.length;

  // An array to hold the current mapping of 0-25 to their decrypted ASCII values.
  var decodedAlphabet = new Int8Array(26);

  // A lookup table to convert encrypted ASCII values back to their original ASCII values.
  // Initialized as an identity map.
  var decryptionMap = new Int8Array(123);
  for (var initializer = 123; initializer--;) {
    decryptionMap[initializer] = initializer;
  }

  // Iterate through each line of hexadecimal input, skipping the first and last which are often empty.
  MAIN_LOOP: for (var lineIndex = 1, totalLines = hexInputLines.length - 1; lineIndex < totalLines; lineIndex++) {
    var currentHexLine = hexInputLines[lineIndex];
    var hexWords = currentHexLine.split('20'); // Split the line into words based on hex '20' (space).
    var wordCount = hexWords.length;
  
    // Try each possible 'alpha' (multiplicative key) from the coprimeFactors array.
    for (var factorIndex = 0; factorIndex < factorCount; factorIndex++) {
      var currentAlpha = coprimeFactors[factorIndex];

      // Try each possible 'beta' (additive key) from 25 down to 0.
      for (var currentBeta = 26; currentBeta--;) {
        // Generate the current decryption alphabet for the given alpha and beta.
        for (var charConverter = 26; charConverter--;) {
          // Affine cipher formula: (x * alpha + beta) % 26 + 97 (ASCII for 'a').
          decodedAlphabet[charConverter] = (charConverter * currentAlpha + currentBeta) % 26 + 97;
        }

        // Calculate the hexadecimal representations of "that" and "this"
        // using the currently generated decoded alphabet.
        // 't' (19), 'h' (7), 'a' (0), 's' (18), 'i' (8)
        var thatHex = decodedAlphabet[19].toString(16) + decodedAlphabet[7].toString(16) + decodedAlphabet[0].toString(16) + decodedAlphabet[19].toString(16);
        var thisHex = decodedAlphabet[19].toString(16) + decodedAlphabet[7].toString(16) + decodedAlphabet[8].toString(16) + decodedAlphabet[18].toString(16);

        var wordFound = false;
        // Check if either "that" or "this" (in their hex forms) exists in the current line.
        for (var wordIndex = wordCount; wordIndex--;) {
          var currentHexWord = hexWords[wordIndex];
          if (currentHexWord === thatHex || currentHexWord === thisHex) {
            wordFound = true; // A known word was found, indicating a likely correct key pair.
            break;
          }
        }
        
        // If a known word was found, this alpha/beta pair is likely correct for this line.
        if (wordFound) {
          // Populate the decryption map based on the current decoded alphabet.
          // The key is the encrypted ASCII, the value is the decrypted ASCII.
          for (var charConverter = 26; charConverter--;) {
            var originalAscii = decodedAlphabet[charConverter];
            decryptionMap[originalAscii] = charConverter + 97; // Map the decrypted char's ASCII to its original 'a'-'z' ASCII.
          }
          
          var decryptedMessage = "";
          // Iterate through the current hex input line, taking two characters at a time
          // to form a hex byte, convert it, and decrypt.
          for (var charHexIndex = 0; charHexIndex < currentHexLine.length; charHexIndex += 2) {
            var hexPair = currentHexLine[charHexIndex] + currentHexLine[charHexIndex + 1];
            var asciiCode = parseInt(hexPair, 16); // Convert hex byte to integer ASCII code.
            decryptedMessage += String.fromCharCode(decryptionMap[asciiCode]); // Append the decrypted character.
          }
          console.log(decryptedMessage); // Output the fully decrypted message for the line.
          continue MAIN_LOOP; // Move to the next input line, as this one is successfully decrypted.
        }
      }
    }
  }
}
