const fileSystemModule = require('fs');

// Attempt to read standard input content synchronously.
// This block handles the initial data acquisition, including basic validation.
try {
    const standardInputFileDescriptor = process.stdin.fd;
    const fileStatistics = fileSystemModule.fstatSync(standardInputFileDescriptor);
    const totalInputSize = fileStatistics.size;

    // If no input data is available, terminate the process.
    if (totalInputSize === 0) {
        // console.error("No data received from standard input. Exiting.");
        process.exit(1);
    }

    // Allocate a buffer to hold the incoming data and read it.
    const inputDataBuffer = Buffer.alloc(totalInputSize);
    const bytesActuallyRead = fileSystemModule.readSync(standardInputFileDescriptor, inputDataBuffer, 0, totalInputSize, 0);

    // Convert the buffer content to a UTF-8 string and split it into individual lines.
    const receivedTextLines = inputDataBuffer.toString('utf8', 0, bytesActuallyRead).split('\n');

    // Proceed to the core logic for processing the decipherment tasks.
    executeCipherDecipherment(receivedTextLines);

} catch (inputReadError) {
    // Log and exit if any error occurs during the input reading phase.
    // console.error("An error occurred while reading standard input:", inputReadError.message);
    process.exit(1);
}

/**
 * Orchestrates the decryption process for a collection of encoded messages.
 * This function employs a brute-force strategy across possible affine cipher keys
 * (multiplier 'a' and shift 'b') to identify the correct decryption,
 * based on the presence of specific plaintext keyword patterns ("that", "this").
 *
 * @param {string[]} encodedContentArray - An array of strings where the first element
 *                                         specifies the total count of messages to process,
 *                                         and subsequent elements are the actual encoded messages.
 */
function executeCipherDecipherment(encodedContentArray) {
    // These are the 'a' values (multipliers) for the affine cipher that are coprime with 26.
    // They are essential for ensuring a unique inverse exists in modular arithmetic.
    const validAffineMultipliers = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

    // Perform initial validation on the input array structure.
    if (!Array.isArray(encodedContentArray) || encodedContentArray.length === 0) {
        // console.error("The provided input array is empty or not in a valid format.");
        return;
    }

    // Parse the first line to determine the expected number of messages to process.
    const totalMessagesToProcess = parseInt(encodedContentArray[0], 10);
    if (isNaN(totalMessagesToProcess) || totalMessagesToProcess < 0) {
        // console.error("The first line of input does not contain a valid positive number of messages.");
        return;
    }

    // This labeled loop allows for breaking out of all nested loops once a message is successfully decrypted.
    MESSAGE_PROCESSING_ITERATION:
    for (let currentMessageIndex = 1; currentMessageIndex <= totalMessagesToProcess; currentMessageIndex++) {
        const currentEncodedMessage = encodedContentArray[currentMessageIndex];

        // Skip any messages that are undefined, not strings, or consist only of whitespace.
        if (typeof currentEncodedMessage !== 'string' || currentEncodedMessage.trim().length === 0) {
            // console.warn(`Skipping invalid or empty message entry at index ${currentMessageIndex}.`);
            continue MESSAGE_PROCESSING_ITERATION;
        }

        // Iterate through each possible 'alpha' (multiplicative key) value.
        for (const currentAlphaMultiplier of validAffineMultipliers) {
            // Iterate through each possible 'beta' (additive shift key) value, from 0 to 25.
            for (let currentBetaShift = 0; currentBetaShift < 26; currentBetaShift++) {

                // Prepare mapping arrays for both encryption and decryption for the current key pair.
                const forwardCipherMap = new Array(26); // Maps original 0-25 index to encrypted ASCII code.
                const reverseDecipherMap = new Map();   // Maps encrypted ASCII code to original 0-25 index.

                // Populate the cipher and decipher maps based on the current alpha and beta values.
                for (let originalAlphabetIndex = 0; originalAlphabetIndex < 26; originalAlphabetIndex++) {
                    // Apply the affine cipher formula: E(x) = (ax + b) mod 26
                    const encryptedValue = (originalAlphabetIndex * currentAlphaMultiplier + currentBetaShift) % 26;
                    const encryptedAsciiCode = encryptedValue + 97; // Convert 0-25 to 'a'-'z' ASCII.

                    forwardCipherMap[originalAlphabetIndex] = encryptedAsciiCode;
                    reverseDecipherMap.set(encryptedAsciiCode, originalAlphabetIndex);
                }

                // Helper function to generate an encrypted two-character sequence based on character indices.
                const getCipheredCharacterPair = (firstChar0_25Index, secondChar0_25Index) =>
                    String.fromCharCode(forwardCipherMap[firstChar0_25Index], forwardCipherMap[secondChar0_25Index]);

                // Generate the encrypted forms of the target keywords "th", "at", "is".
                const cipheredKeywordTH = getCipheredCharacterPair(19, 7); // 't' (19), 'h' (7)
                const cipheredKeywordAT = getCipheredCharacterPair(0, 19); // 'a' (0), 't' (19)
                const cipheredKeywordIS = getCipheredCharacterPair(8, 18); // 'i' (8), 's' (18)

                // Construct a regular expression to search for "th(at|is)" in its encrypted form.
                const decryptionPattern = new RegExp(`${cipheredKeywordTH}(${cipheredKeywordAT}|${cipheredKeywordIS})`);

                // If the current encoded message contains the expected pattern, we've found the correct keys.
                if (decryptionPattern.test(currentEncodedMessage)) {
                    // Perform the full decryption using the identified keys.
                    const finalDecryptedMessage = currentEncodedMessage.replace(/[a-z]/g, (encryptedChar) => {
                        const charAsciiValue = encryptedChar.charCodeAt(0);
                        const originalAlphabetIndex = reverseDecipherMap.get(charAsciiValue);

                        // If for any reason a character isn't found in the map (shouldn't happen for [a-z]),
                        // return it unchanged. Otherwise, convert back to original character.
                        if (originalAlphabetIndex === undefined) {
                            return encryptedChar;
                        }
                        return String.fromCharCode(originalAlphabetIndex + 97);
                    });

                    // Output the successfully decrypted message to standard output.
                    console.log(finalDecryptedMessage);

                    // Move to the next encoded message, as this one has been resolved.
                    continue MESSAGE_PROCESSING_ITERATION;
                }
            }
        }
    }
}