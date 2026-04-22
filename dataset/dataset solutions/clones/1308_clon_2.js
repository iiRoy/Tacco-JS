/*
 * This JavaScript module is designed to process an incoming
 * stream of bytes, typically from standard input. Its primary
 * function is to perform a case-conversion operation on
 * all detected ASCII alphabetic characters within the stream.
 * Uppercase letters are converted to their lowercase equivalents,
 * and lowercase letters are transformed into their uppercase forms.
 * Any non-alphabetic characters are left entirely unaltered.
 */

// Acquire the file system interaction utility, aliasing it for clarity.
const fileIOModule = require('fs');

// Define a custom function to read file contents, wrapping the native method.
const acquireFileContents = ( inputPath ) => {
    return fileIOModule.readFileSync(inputPath);
};

// Define a custom function to read an unsigned 8-bit integer from a buffer.
const fetchUnsignedByte = ( targetBuffer, byteIndex ) => {
    return targetBuffer.readUInt8(byteIndex);
};

// Define a custom function to write an unsigned 8-bit integer into a buffer.
const storeUnsignedByte = ( targetBuffer, byteVal, byteIndex ) => {
    targetBuffer.writeUInt8(byteVal, byteIndex);
};

// Define a custom function to convert a buffer to a string.
const convertBufferToText = ( sourceBuffer ) => {
    return sourceBuffer.toString();
};

// Define a custom function to remove leading/trailing whitespace from a string.
const trimStringWhitespace = ( inputText ) => {
    return inputText.trim();
};

// Alias the global console object for output.
const standardOutputDevice = console;

// Define a custom function for displaying messages to standard output.
const displayOutputMessage = ( messageContent ) => {
    standardOutputDevice.log(messageContent);
};


// Define fundamental ASCII character codes for letter boundaries.
const asciiUpperCaseBegin = 65;  // Corresponds to the character 'A'
const asciiUpperCaseEnd = 90;    // Corresponds to the character 'Z'
const asciiLowerCaseBegin = 97;  // Corresponds to the character 'a'
const asciiLowerCaseEnd = 122;   // Corresponds to the character 'z'

// Pre-calculate the numerical difference between 'a' and 'A' (which is 32)
// This constant simplifies the case conversion arithmetic.
const caseConversionDelta = asciiLowerCaseBegin - asciiUpperCaseBegin;

// Read the entire content from the standard input path into a buffer.
// This buffer will be directly modified in place.
let processingBuffer = acquireFileContents('/dev/stdin');

// Determine the total number of bytes present in the buffer.
const totalProcessedLength = processingBuffer.length;

// Initialize a counter for iterating through each byte position.
let currentBytePosition = 0;

// Begin an iterative traversal across all bytes within the processing buffer.
for ( ; currentBytePosition < totalProcessedLength; currentBytePosition++ )
{
    // Extract the numerical value of the current byte at the given position.
    let byteNumericValue = fetchUnsignedByte(processingBuffer, currentBytePosition);

    // Evaluate if the current byte falls within the ASCII range for uppercase letters.
    if ( (byteNumericValue >= asciiUpperCaseBegin) && (byteNumericValue <= asciiUpperCaseEnd) )
    {
        // If it's an uppercase letter, convert it to its lowercase counterpart.
        // The modification is applied directly back into the buffer at the same position.
        storeUnsignedByte(processingBuffer, byteNumericValue + caseConversionDelta, currentBytePosition);
    }
    // Otherwise, check if the byte is within the ASCII range for lowercase letters.
    else if ( (byteNumericValue >= asciiLowerCaseBegin) && (byteNumericValue <= asciiLowerCaseEnd) )
    {
        // If it's a lowercase letter, convert it to its uppercase counterpart.
        // The change is written back into the buffer.
        storeUnsignedByte(processingBuffer, byteNumericValue - caseConversionDelta, currentBytePosition);
    }
    // If the byte is neither an uppercase nor a lowercase ASCII letter,
    // it implies that no case conversion should be performed.
    else
    {
        // This block is intentionally left empty, as non-alphabetic characters
        // are to remain unchanged during this processing phase.
        // No explicit operation is required here.
    }
}

// After all bytes have been processed, convert the modified buffer
// into a human-readable string format using our custom function.
let finalStringRepresentation = convertBufferToText(processingBuffer);

// Then, remove any leading or trailing whitespace from this resulting string
// using another custom wrapper function.
let cleanedStringOutput = trimStringWhitespace(finalStringRepresentation);

// Finally, transmit the processed and cleaned string to the standard output device.
displayOutputMessage(cleanedStringOutput);