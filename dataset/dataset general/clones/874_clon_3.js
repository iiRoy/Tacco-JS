const verificationEngine = require('assert'); // Utility module for performing runtime assertions.
const characterEncodingModule = require('../index'); // The primary library for character encoding and decoding operations.

// --- Section 1: Demonstrating direct string encoding, decoding, and verification ---

// Define an initial string containing various accented characters in UTF-8.
const originalTextFragment = 'É isso ai. Testando acentuação: áéíóú...';
const desiredTargetEncoding = 'ISO-8859-1//TRANSLIT'; // Target encoding with transliteration rule.

// Step 1: Encode the original text into a byte sequence.
let encodedDataBuffer;
try {
    encodedDataBuffer = characterEncodingModule.encode(originalTextFragment, desiredTargetEncoding);
    // Add a quick check for the encoding result.
    if (!encodedDataBuffer || encodedDataBuffer.length === 0) {
        console.warn('Warning: The encoding process yielded an empty byte buffer.');
    }
} catch (encodingError) {
    console.error(`Critical encoding failure: ${encodingError.message}`);
    process.exit(1); // Terminate if encoding fails unexpectedly.
}

// Step 2: Decode the resulting byte sequence back into a string using the same encoding.
const rehydratedTextFragment = characterEncodingModule.decode(encodedDataBuffer, 'ISO-8859-1');

// Step 3: Verify that the decoded string matches the original input.
verificationEngine.strictEqual(originalTextFragment, rehydratedTextFragment, 'Error: The round-trip conversion did not preserve the original text content.');
console.log(`[Test Case 1] Original Text: "${originalTextFragment}" | Decoded Text: "${rehydratedTextFragment}"`);
console.log('--- Direct Encoding/Decoding Verification PASSED ---');


// --- Section 2: Illustrating streaming conversion with event-driven processing ---

// Create a streaming converter instance to transform LATIN1 byte streams into UTF-8 strings.
const streamingProcessor = characterEncodingModule.createStream('UTF-8', 'LATIN1');
let accumulatedStreamOutput = ''; // A variable to collect all data chunks from the stream.

// Register an event listener for each data chunk received from the stream.
streamingProcessor.on('data', (dataChunk) => {
    const currentProcessedString = dataChunk.toString('utf8'); // Convert the buffer chunk to a UTF-8 string.
    accumulatedStreamOutput += currentProcessedString; // Append to the total collected output.
    // console.log(`[Stream Log] Received and processed chunk: "${currentProcessedString}"`); // Uncomment for detailed chunk logging.
});

// Register an event listener for when the stream has finished processing all input.
streamingProcessor.on('end', () => {
    // Perform final validation only if there's actual output.
    if (accumulatedStreamOutput.length > 0) {
        verificationEngine.equal(accumulatedStreamOutput, originalTextFragment, 'Assertion Failed: Streamed output does not exactly match the initial source text.');
        console.log(`[Test Case 2] Final Stream Output: "${accumulatedStreamOutput}"`);
        console.log('--- Streaming Conversion Verification PASSED ---');
    } else {
        console.error('Error: Streaming process completed, but no data was accumulated.');
        verificationEngine.fail('Streaming output was unexpectedly empty upon completion.');
    }
});

// Register an event listener for any errors encountered during the stream operation.
streamingProcessor.on('error', (streamErr) => {
    console.error(`An unhandled error occurred during streaming conversion: ${streamErr.message}`);
    // Optionally, implement more robust error handling or re-throw.
    process.exitCode = 1; // Indicate an error occurred.
});

// Write the previously encoded buffer into the stream in several non-uniform chunks.
// This simulates a real-world scenario where data arrives in variable-sized packets.
if (encodedDataBuffer && encodedDataBuffer.length > 0) {
    const totalBufferSize = encodedDataBuffer.length;
    // Define an array of byte lengths for each chunk to be written.
    const variableChunkDistribution = [1, 7, 8, 8, 4, 4, totalBufferSize - 32];
    let currentBufferOffset = 0;

    for (let i = 0; i < variableChunkDistribution.length; i++) {
        const bytesInCurrentChunk = variableChunkDistribution[i];
        if (currentBufferOffset < totalBufferSize) {
            const endSlicePoint = Math.min(currentBufferOffset + bytesInCurrentChunk, totalBufferSize);
            const dataToStream = encodedDataBuffer.slice(currentBufferOffset, endSlicePoint);
            if (dataToStream.length > 0) {
                streamingProcessor.write(dataToStream);
            }
            currentBufferOffset = endSlicePoint;
        } else {
            break; // All data has been written.
        }
    }
} else {
    console.error('Cannot initiate streaming: The initial encodedDataBuffer is either null, undefined, or empty.');
}

// Signal to the stream that all input data has been provided.
streamingProcessor.end();


// --- Section 3: Direct conversion from UTF-8 to ASCII with transliteration ---

// A new string to demonstrate ASCII transliteration.
const sourceStringForAscii = 'aéióuçÁEÍOÚC';
// Perform the conversion from UTF-8 to ASCII, transliterating non-ASCII characters.
const convertedAsciiBuffer = characterEncodingModule.convert(sourceStringForAscii, 'ASCII//TRANSLIT', 'UTF-8');

// Display both the original string and its ASCII transliterated form.
console.log(`\n[Test Case 3] Input: "${sourceStringForAscii}" => ASCII Transliterated: "${convertedAsciiBuffer.toString('ascii')}"`);
if (convertedAsciiBuffer.toString('ascii').includes('?')) {
    console.warn('Note: Some non-ASCII characters might have been replaced by "?" during transliteration.');
}


// --- Section 4: Advanced conversion using a dedicated converter object (UTF-8 to UTF-16LE) ---

// Instantiate a specific converter for the UTF-8 to UTF-16LE character set pair.
const dedicatedConverterInstance = characterEncodingModule.create('utf16le', 'utf8');

// Create a buffer from the source string, explicitly specifying UTF-8 encoding.
// Using Buffer.from() for modern Node.js compatibility.
const inputSourceBuffer = Buffer.from(sourceStringForAscii, 'utf8');

// Execute the conversion using the dedicated converter.
const utf16LEOutputBuffer = dedicatedConverterInstance.convert(inputSourceBuffer);

// Log the resulting UTF-16LE buffer and its byte length.
console.log(`\n[Test Case 4] Converted to UTF-16LE buffer (byte length: ${utf16LEOutputBuffer.length}):`);
console.log(utf16LEOutputBuffer);
// UTF-16LE characters are typically 2 bytes, so buffer length should be even.
if (utf16LEOutputBuffer.length % 2 !== 0) {
    console.warn('Warning: The resulting UTF-16LE buffer has an odd byte length, which is unusual for UTF-16 encodings.');
}
console.log('--- All character encoding scenarios have been executed ---');