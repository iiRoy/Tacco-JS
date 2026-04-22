// Function to determine and apply character case inversion
const applyCaseInversion = (inputCharacter) => {
    // Obtain the Unicode code point of the character
    const unicodeValue = inputCharacter.charCodeAt(0);

    // Define ASCII ranges for letters
    const lowerCaseStartCode = 97; // 'a'
    const lowerCaseEndCode = 122;  // 'z'
    const upperCaseStartCode = 65; // 'A'
    const upperCaseEndCode = 90;   // 'Z'

    // Check if the character is a lowercase letter
    if (unicodeValue >= lowerCaseStartCode && unicodeValue <= lowerCaseEndCode) {
        // Convert to uppercase: 'a' (97) -> 'A' (65), difference is 32
        return String.fromCharCode(unicodeValue - 32);
    }
    // Check if the character is an uppercase letter
    else if (unicodeValue >= upperCaseStartCode && unicodeValue <= upperCaseEndCode) {
        // Convert to lowercase: 'A' (65) -> 'a' (97), difference is 32
        return String.fromCharCode(unicodeValue + 32);
    }
    // If it's not an ASCII letter, return the character as is
    else {
        return inputCharacter;
    }
};

// Establish an event listener for incoming data on the standard input stream
process.stdin.on("data", (dataBufferFromStream) => {
    try {
        // Validate that the received data is indeed a Buffer object
        if (!Buffer.isBuffer(dataBufferFromStream)) {
            // Log an error if the input type is unexpected
            console.error("Input processing error: Data received is not a valid buffer.");
            // Halt further processing for this erroneous chunk
            return;
        }

        // Convert the raw buffer data into a human-readable string using UTF-8 encoding
        // This handles various international characters correctly.
        const fullStringContent = dataBufferFromStream.toString('utf8');

        // Introduce an early exit condition if the string is empty after conversion
        // This prevents unnecessary processing of empty data chunks.
        if (fullStringContent.length === 0) {
            return;
        }

        // Break down the entire string into an array of individual characters
        const characterSequence = fullStringContent.split('');

        // Iterate over each character and apply the case inversion logic
        // The 'map' method creates a new array with the transformed characters.
        const invertedCaseCharacters = characterSequence.map(applyCaseInversion);

        // Concatenate the array of transformed characters back into a single string
        const finalProcessedText = invertedCaseCharacters.join('');

        // Output the resulting string to the standard output
        console.log(finalProcessedText);

    } catch (operationException) {
        // Catch any exceptions that occur during the data processing pipeline
        // Log the error message to the standard error stream
        console.error(`Runtime exception during input transformation: ${operationException.message}`);
        // Optionally, one might decide to exit the process or perform other error recovery actions here.
    }
});

// The original code included a call to .resume() on process.stdin.
// For a Type III clone, we can strategically remove or modify components.
// In many modern Node.js applications, especially when an event listener for 'data' is set,
// stdin automatically enters "flowing mode," making an explicit .resume() call redundant.
// Therefore, it has been omitted here as a deletion of a non-essential fragment.