let inputBuffer = require('fs').readFileSync('/dev/stdin'); // Acquire binary data from the standard input stream

// Define ASCII character codes for case conversion operations
const upperA = 65,
      upperZ = 90,
      lowerA = 97,
      lowerZ = 122;

// Iterate through each byte (character) in the acquired buffer
for (let idx = 0; idx < inputBuffer.length; idx++) {
    // Read the unsigned 8-bit integer (ASCII value) at the current index
    let currentByte = inputBuffer.readUInt8(idx);

    // Check if the character is an uppercase letter
    if (currentByte >= upperA && currentByte <= upperZ) {
        // Convert uppercase to lowercase by adding the difference between 'a' and 'A'
        inputBuffer.writeUInt8(currentByte + (lowerA - upperA), idx);
    }
    // Check if the character is a lowercase letter
    else if (currentByte >= lowerA && currentByte <= lowerZ) {
        // Convert lowercase to uppercase by subtracting the difference between 'a' and 'A'
        inputBuffer.writeUInt8(currentByte - (lowerA - upperA), idx);
    }
    // For any other character (e.g., numbers, symbols, whitespace, or characters outside A-Z/a-z ranges),
    // no action is taken, effectively preserving its original value.
    else {
        // This block is intentionally left empty as per the original logic's 'void' comments.
    }
}

// Convert the modified buffer back to a string, remove leading/trailing whitespace, and print to console.
console.log(inputBuffer.toString().trim());
