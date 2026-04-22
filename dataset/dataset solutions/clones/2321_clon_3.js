// This module handles the processing of structured text input to interleave characters.
function processDataStream(rawInputText) {
    // Break down the entire input text into individual lines for easier access.
    // We expect at least two lines: one for the character count, one for the words.
    const inputLines = rawInputText.split("\n");

    // Defensive check: Ensure we have enough lines to process.
    if (inputLines.length < 2) {
        console.error("Input error: Insufficient lines provided. Expected at least two lines for processing.");
        return; // Exit if input is malformed or incomplete
    }

    // The first line contains the numerical limit for interleaving.
    // Parse it as an integer, explicitly using base 10 to prevent unintended octal interpretation.
    const maxInterleaveLengthStr = inputLines[0];
    const interleaveLimit = parseInt(maxInterleaveLengthStr, 10);

    // Validate the parsed numerical limit. It must be a non-negative integer.
    if (isNaN(interleaveLimit) || interleaveLimit < 0) {
        console.error(`Input error: Invalid numerical limit '${maxInterleaveLengthStr}'. Must be a non-negative integer.`);
        return; // Exit if the limit is invalid
    }

    // The second line contains the words to be interleaved, typically separated by spaces.
    const wordsLine = inputLines[1];
    const componentWords = wordsLine.split(" ");

    // Defensive check: Ensure we have at least two distinct word components to interleave.
    if (componentWords.length < 2) {
        console.error("Input error: Expected at least two words separated by spaces for interleaving.");
        return; // Exit if words are missing
    }

    // Extract the two primary words that will be used for character interleaving.
    const sourceWordOne = componentWords[0];
    const sourceWordTwo = componentWords[1];

    // Initialize an array to buffer characters. This approach is generally more efficient
    // for numerous concatenations within a loop compared to repeated string additions.
    const interleavedCharacterBuffer = [];

    // Iterate up to the specified interleave limit, taking one character from each word in turn.
    // The String.prototype.charAt(index) method gracefully returns an empty string ('')
    // if the provided index is out of bounds, which aligns with the original code's implicit behavior
    // of appending nothing if a word runs short.
    for (let currentPosition = 0; currentPosition < interleaveLimit; currentPosition++) {
        const charFromWordOne = sourceWordOne.charAt(currentPosition);
        const charFromWordTwo = sourceWordTwo.charAt(currentPosition);

        // Add both extracted characters (or empty strings if out of bounds) to the buffer.
        interleavedCharacterBuffer.push(charFromWordOne);
        interleavedCharacterBuffer.push(charFromWordTwo);
    }

    // Finally, join all buffered characters to form the complete interleaved string.
    const finalInterleavedString = interleavedCharacterBuffer.join('');

    // Output the computed result to the standard console.
    console.log(finalInterleavedString);
}

// This section is standard boilerplate for competitive programming environments in Node.js.
// It reads the entire standard input as a UTF-8 string and passes it to the main processing function.
// As per the instructions, this line should remain functionally equivalent to its original form.
processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));