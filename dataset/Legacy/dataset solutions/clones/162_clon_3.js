const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const allInputLines = rawInputContent.split('\n');
const lastRelevantLine = allInputLines.slice(-1)[0];

const ALPHABET_RANGE_SIZE = 26;
const ASCII_CODE_FOR_A = 97; // Represents the character 'a'

// Helper function to apply the affine transformation to a single character's ASCII code
const applyAffineTransformation = (charAsciiCode, multiplierFactor, addendFactor) => {
  const transformedAscii = (charAsciiCode * multiplierFactor + addendFactor) % ALPHABET_RANGE_SIZE + ASCII_CODE_FOR_A;
  return String.fromCharCode(transformedAscii);
};

// Main processing logic for a given input line
const processCipherDecryption = (currentInputLine) => {
  // Iterate through all possible multiplier values (t in original)
  for (let currentMultiplier = ALPHABET_RANGE_SIZE; currentMultiplier--;) {
    // Iterate through all possible addend values (s in original)
    for (let currentAddend = ALPHABET_RANGE_SIZE; currentAddend--;) {
      let candidateDecryptedString = currentInputLine.replace(/[\w]/g, (originalCharacter) => {
        return applyAffineTransformation(originalCharacter.charCodeAt(0), currentMultiplier, currentAddend);
      });

      // Check if the decrypted string contains the target phrases "this" or "that"
      if (candidateDecryptedString.match(/th(is|at)/)) {
        console.log(candidateDecryptedString);
      }
    }
  }
};

// Execute the processing for the last line obtained from the input
processCipherDecryption(lastRelevantLine);
