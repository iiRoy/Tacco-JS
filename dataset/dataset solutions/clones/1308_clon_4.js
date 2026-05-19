const fileSystem = require('fs');

const inputContentBuffer = fileSystem.readFileSync('/dev/stdin');

const processedByteValues = Array.from(inputContentBuffer).map(octetValue =>
    (octetValue >= 0x41 && octetValue <= 0x5A) // ASCII 'A' (65) through 'Z' (90)
        ? octetValue + 0x20 // Convert to lowercase by adding 32
        : (octetValue >= 0x61 && octetValue <= 0x7A) // ASCII 'a' (97) through 'z' (122)
            ? octetValue - 0x20 // Convert to uppercase by subtracting 32
            : octetValue // Preserve non-alphabetic characters
);

const outputContentBuffer = Buffer.from(processedByteValues);

console.log(outputContentBuffer.toString().trim());
