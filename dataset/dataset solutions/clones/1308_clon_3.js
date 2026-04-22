const fileSystemManager = require('fs');

let processedInputDataBuffer;

try {
    // Attempt to read the entire content from standard input into a buffer.
    // This handles binary data effectively.
    processedInputDataBuffer = fileSystemManager.readFileSync('/dev/stdin');
} catch (inputReadError) {
    // If there's an issue reading the input, log the error and terminate.
    console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
    process.exit(1);
}

// Define the ASCII numerical values for the boundaries of uppercase and lowercase English alphabets.
const asciiCodeForCapitalA = 65; // Represents 'A'
const asciiCodeForCapitalZ = 90; // Represents 'Z'
const asciiCodeForSmallA = 97;  // Represents 'a'
const asciiCodeForSmallZ = 122; // Represents 'z'

// Calculate the fixed offset between the ASCII values of corresponding uppercase and lowercase letters.
// This value is typically 32 (e.g., 'a' (97) - 'A' (65) = 32).
const characterCaseDifference = asciiCodeForSmallA - asciiCodeForCapitalA;

// Before processing, check if the input buffer is empty.
// If it is, there's nothing to process, so output an empty line and exit.
if (processedInputDataBuffer.length === 0) {
    console.log("");
    process.exit(0);
}

// Iterate through each byte in the acquired buffer to perform case transformations.
// The loop variable 'currentBytePosition' tracks the index of the byte being examined.
for (let currentBytePosition = 0; currentBytePosition < processedInputDataBuffer.length; ++currentBytePosition) {
    // Read the unsigned 8-bit integer (byte) at the current position.
    let currentCharacterByteValue = processedInputDataBuffer.readUInt8(currentBytePosition);
    // Initialize a variable to hold the potentially transformed byte value.
    // By default, it's the same as the original.
    let modifiedCharacterByteValue = currentCharacterByteValue;

    // First, check if the current byte represents an uppercase letter (A-Z).
    if (currentCharacterByteValue >= asciiCodeForCapitalA && currentCharacterByteValue <= asciiCodeForCapitalZ) {
        // If it's an uppercase letter, convert it to its lowercase equivalent
        // by adding the pre-calculated case difference.
        modifiedCharacterByteValue = currentCharacterByteValue + characterCaseDifference;
    }
    // Next, check if the current byte represents a lowercase letter (a-z).
    else if (currentCharacterByteValue >= asciiCodeForSmallA && currentCharacterByteValue <= asciiCodeForSmallZ) {
        // If it's a lowercase letter, convert it to its uppercase equivalent
        // by subtracting the pre-calculated case difference.
        modifiedCharacterByteValue = currentCharacterByteValue - characterCaseDifference;
    }
    // Characters that are not within the A-Z or a-z ranges are left unchanged.
    // The original `else ; // void` type statements are implicitly handled here,
    // as `modifiedCharacterByteValue` retains its original value if no conditions are met.

    // If the character's byte value was modified, write the new value back to the buffer
    // at the same position. This performs an in-place modification.
    if (modifiedCharacterByteValue !== currentCharacterByteValue) {
        processedInputDataBuffer.writeUInt8(modifiedCharacterByteValue, currentBytePosition);
    }
}

// Convert the modified buffer content into a string, assuming UTF-8 encoding.
const completeOutputString = processedInputDataBuffer.toString('utf8');

// Remove any leading or trailing whitespace (like newlines) from the resulting string.
const finalTrimmedOutput = completeOutputString.trim();

// Display the final processed and trimmed string to standard output.
console.log(finalTrimmedOutput);