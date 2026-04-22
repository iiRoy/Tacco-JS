process.stdin.resume();
process.stdin.setEncoding('utf8');

// Set up an event listener to handle incoming data chunks
process.stdin.on('data', receiveInput);

/**
 * Handles incoming data chunks from standard input.
 * Splits the chunk into individual lines and processes each.
 * @param {string} inputChunk - The raw data chunk received.
 */
function receiveInput(inputChunk) {
    inputChunk
        .split('\n') // Divide the input into separate lines
        .forEach(processLine); // Apply the transformation to each line
}

/**
 * Applies a Caesar cipher shift to a text segment and checks for keywords.
 * Recursively calls itself to iterate through all possible 26 shifts.
 * @param {string} textSegment - The line of text to be processed.
 * @param {number} [shiftCount=0] - The current shift amount for the cipher.
 */
function processLine(textSegment, shiftCount) {
    // Ensure shiftCount is a number, defaulting to 0 if not provided or invalid.
    shiftCount = Number(shiftCount) | 0;

    // Apply a cyclic shift to all lowercase English letters in the segment.
    let transformedText = String(textSegment).replace(/[a-z]/g, function (charToShift) {
        const baseAscii = 0x61; // ASCII value for 'a'
        const currentAscii = charToShift.charCodeAt(0);
        // Calculate new character code: (current - base + 1) % 26 + base
        const newAscii = baseAscii + (currentAscii - baseAscii + 1) % 26;
        return String.fromCharCode(newAscii);
    });

    // Check if the transformed text contains any of the target keywords.
    const keywordPattern = /the|this|that/;
    if (keywordPattern.test(transformedText)) {
        // If a keyword is found, output the transformed text to standard output.
        process.stdout.write(transformedText + '\n');
    }

    // Recursively call the function for the next shift, up to 26 times.
    if (shiftCount < 25) { // Loop 26 times (0 to 25)
        processLine(transformedText, ++shiftCount);
    }
}