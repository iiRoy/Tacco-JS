var fileSystem = require('fs');
// Obtain the byte count of the standard input stream
var streamSize = fileSystem.fstatSync(process.stdin.fd).size;
// Allocate a memory block to hold the incoming data
var dataBlock = new Buffer(streamSize);
// Read the standard input into the allocated block
var octetsProcessed = fileSystem.readSync(process.stdin.fd, dataBlock, 0, streamSize, 0);
// Convert the buffer content to a hexadecimal string, then split by the hex representation of newline (0a)
var hexLineData = dataBlock.toString('hex', 0, octetsProcessed).split('0a');
// Initiate the primary decryption routine
decodeContent();

function decodeContent() {
  // Define an array of integers that are coprime to 26 (used as 'a' in affine cipher)
  var coprimeSet = new Array(1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25);
  // Store the total number of coprime factors
  var setCardinality = coprimeSet.length;
  // An array to store the ASCII values of the transformed alphabet
  var cipheredLetters = new Array(26);
  // A lookup table to convert encrypted ASCII values back to original ASCII values
  var asciiConverter = new Array(123);

  // Populate the conversion table with an identity mapping initially
  for (var idx = 123; idx--;) {
    asciiConverter[idx] = idx;
  }

NEXT_ENTRY:
  for (var entryCounter = 1, maxLines = hexLineData.length - 1; entryCounter < maxLines; entryCounter++) {
    // Get the current line of hexadecimal input
    var currentLineHex = hexLineData[entryCounter];
    // Split the line into individual hexadecimal word segments based on space (hex '20')
    var hexWords = currentLineHex.split('20');
    // Count the number of segments in the current line
    var wordQty = hexWords.length;

    // Iterate through each potential 'a' value (multiplier) from the coprime set
    for (var alphaIterator = 0; alphaIterator < setCardinality; alphaIterator++) {
      var firstKeyComponent = coprimeSet[alphaIterator];
      // Iterate through each potential 'b' value (shift) from 0 to 25
      for (var secondKeyComponent = 26; secondKeyComponent--;) {
        // Generate the transformed alphabet for the current 'a' and 'b' combination
        for (var charIdx = 26; charIdx--;) {
          cipheredLetters[charIdx] = (charIdx * firstKeyComponent + secondKeyComponent) % 26 + 97;
        }

        // Calculate the hexadecimal representation of "that" after encryption with current keys
        var knownWordA_hex = cipheredLetters[19].toString(16) + cipheredLetters[7].toString(16) + cipheredLetters[0].toString(16) + cipheredLetters[19].toString(16);
        // Calculate the hexadecimal representation of "this" after encryption with current keys
        var knownWordB_hex = cipheredLetters[19].toString(16) + cipheredLetters[7].toString(16) + cipheredLetters[8].toString(16) + cipheredLetters[18].toString(16);

        var matchDetected = false; // Flag to indicate if a known word is found
        // Scan through each hexadecimal word segment in the current line
        for (var segmentIterator = wordQty; segmentIterator--;) {
          var wordFragment = hexWords[segmentIterator];
          // Check if the current segment matches either of the target encrypted phrases
          if (wordFragment == knownWordA_hex || wordFragment == knownWordB_hex) {
            matchDetected = true; // A match was found
            break; // Exit this inner loop, no need to check further segments
          }
        }

        // If a match was detected for this 'a' and 'b' combination
        if (matchDetected) {
          // Reconstruct the reverse mapping for decryption
          for (var charIdx = 26; charIdx--;) {
            var encryptedCharAscii = cipheredLetters[charIdx];
            asciiConverter[encryptedCharAscii] = charIdx + 97; // Map encrypted ASCII back to original ASCII
          }

          var plainText = ""; // String to store the deciphered output
          // Process the hexadecimal input line two characters at a time
          for (var bytePosition = 0; bytePosition < currentLineHex.length; bytePosition += 2) {
            // Convert the hex pair to an integer, then use it as an index in the conversion table
            // Append the resulting character to the plain text
            plainText += String.fromCharCode(asciiConverter[parseInt(currentLineHex[bytePosition] + currentLineHex[bytePosition + 1], 16)]);
          }
          console.log(plainText); // Display the decrypted line
          continue NEXT_ENTRY; // Move on to process the next line of input
        }
      }
    }
  }
}