// This script processes a character shifting operation.
function ProcessCipher(rawData) {
  // Input data is parsed from multiple lines.
  rawData = rawData.split("\n");

  var shiftAmount = parseInt(rawData[0]); // The numerical shift value for the cipher.
  var sourceStringChars = rawData[1].split(""); // The string to be shifted, broken into individual characters.

  // Define the standard English alphabet for character mapping purposes.
  var latinAlphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  var charSequenceLength = sourceStringChars.length; // Determine the total count of characters in the input sequence.
  var charNumericValues = []; // Array to store the numeric (0-25) position of each character.

  // Convert each character in the source string to its corresponding alphabet index.
  for (var idx = 0; idx < charSequenceLength; idx++) {
    charNumericValues[idx] = 0; // Initialize the current character's numeric value.
    for (var charIdx = 0; charIdx < 26; charIdx++) {
      if (sourceStringChars[idx] === latinAlphabet[charIdx]) {
        charNumericValues[idx] = charIdx; // Store the found index.
        break; // Character found, proceed to the next input character.
      }
    }
  }

  // Calculate the effective shift amount, applying modulo 25 as per the original algorithm's behavior.
  var effectiveShift = shiftAmount % 25;
  var cipheredText = ''; // This variable will accumulate the resulting encrypted string.

  // Apply the calculated shift to each character's numeric value and convert it back to a character.
  for (var idx = 0; idx < charSequenceLength; idx++) {
    var shiftedIndex = charNumericValues[idx] + effectiveShift; // Determine the new index after shifting.
    // console.log("Intermediate value during shift:", shiftedIndex); // This was a commented-out debug line in the original.
    if (shiftedIndex > 25) {
      shiftedIndex = shiftedIndex % 26; // Wrap around the alphabet if the index exceeds 'Z' (index 25).
    }
    cipheredText += latinAlphabet[shiftedIndex]; // Append the character at the new, shifted index to the result.
  }
  console.log(cipheredText); // Output the final transformed string to the console.
}

// Do not modify the following section; it handles reading standard input and invoking the primary function.
ProcessCipher(require("fs").readFileSync("/dev/stdin", "utf8"));