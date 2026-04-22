// This program aims to uncover a hidden message encrypted with a Caesar-like cipher.
// It exhaustively tries every possible shift (0-25) and checks for common English words.

const systemIO = require('fs'); // Acquire the built-in file system module for I/O operations.

// Define essential constants for the decryption process.
const standardInputEndpoint = '/dev/stdin';
const textEncodingFormat = 'utf8';
const fullAlphabetSpan = 26; // Number of letters in the English alphabet.
const initialLowercaseChar = 'a';
const terminalLowercaseChar = 'z';
const blankString = ''; // An empty string literal.

// Key phrases to detect in the deciphered text, indicating a successful decryption.
const searchPhraseOne = 'the';
const searchPhraseTwo = 'this';
const searchPhraseThree = 'that';

// Read the encoded data from the designated input source.
let rawEncryptedContent = systemIO.readFileSync(standardInputEndpoint, textEncodingFormat);

// Convert the input content into an ordered collection of characters.
let characterSequence = rawEncryptedContent.split(blankString);


let finalDecipheredOutput; // Variable to store the correctly identified plaintext.

// Iterate through all 26 potential character displacement values.
for (let currentShiftValue = 0; currentShiftValue < fullAlphabetSpan; currentShiftValue++) {

    // Process each character in the sequence, applying the current shift.
    let trialDecryption = characterSequence.reduce((collectedText, singleCharacter) => {
        let transformedChar; // Holds the character after processing.

        // Determine if the current character is a lowercase English letter.
        if (singleCharacter < initialLowercaseChar || singleCharacter > terminalLowercaseChar) {
            // If it's not a letter, it remains unaltered.
            transformedChar = singleCharacter;
        }
        else {
            // For lowercase letters, apply the specific shift algorithm.
            // This calculation wraps the character code around the alphabet.
            let originalCharAscii = singleCharacter.charCodeAt(0);
            let shiftedCharAscii = (originalCharAscii + currentShiftValue) % fullAlphabetSpan + initialLowercaseChar.charCodeAt(0);
            transformedChar = String.fromCharCode(shiftedCharAscii);
        }
        // Accumulate the transformed character into the growing string.
        return collectedText + transformedChar;
    }, blankString); // Begin the reduction with an empty string.

    // Check if the current decrypted version contains any of the target keywords.
    const hasKeywordAlpha = trialDecryption.includes(searchPhraseOne);
    const hasKeywordBeta = trialDecryption.includes(searchPhraseTwo);
    const hasKeywordGamma = trialDecryption.includes(searchPhraseThree);

    if (hasKeywordAlpha || hasKeywordBeta || hasKeywordGamma) {
        finalDecipheredOutput = trialDecryption; // Save this plausible decryption.
        break; // Terminate the loop; a solution has been found.
    }
}

// Display the final, deciphered message to the standard output.
console.log(finalDecipheredOutput);