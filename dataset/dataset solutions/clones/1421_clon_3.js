/*
 * This script processes an incoming text stream, typically from standard input.
 * Its primary function is to invert the case of all alphabetic characters within the text.
 * For instance, 'a' becomes 'A', 'B' becomes 'b', while numbers and symbols remain unchanged.
 */
(function(sourceTextContent) {
    // Validate the integrity of the provided input data.
    // Ensure it's a string and not empty, as processing requires textual content.
    if (typeof sourceTextContent !== 'string' || sourceTextContent.length === 0) {
        // Log an error message to the console for user feedback.
        console.error("Input processing aborted: The supplied textual data is either invalid (not a string) or empty.");
        // Terminate execution for this invocation gracefully.
        return;
    }

    // Initialize an array to hold individual characters for transformation.
    // This allows for character-by-character manipulation more easily than direct string operations.
    let characterBreakdown = Array.from(sourceTextContent);

    // Apply the case-swapping transformation to each character.
    // The map function iterates over the character array and generates a new array with modified characters.
    const modifiedCharacterSequence = characterBreakdown.map(singleGlyph => {
        const glyphCodePoint = singleGlyph.charCodeAt(0); // Get the Unicode code point of the character.

        // Define ranges for ASCII lowercase and uppercase letters.
        const isLowerAlpha = (glyphCodePoint >= 0x61 /* 'a' */ && glyphCodePoint <= 0x7A /* 'z' */);
        const isUpperAlpha = (glyphCodePoint >= 0x41 /* 'A' */ && glyphCodePoint <= 0x5A /* 'Z' */);

        // Check if the current character is an alphabetic character.
        if (isLowerAlpha || isUpperAlpha) {
            // If it's an alphabet letter, flip its case using a ternary operator for conciseness.
            return isLowerAlpha ? singleGlyph.toUpperCase() : singleGlyph.toLowerCase();
        } else {
            // Non-alphabetic characters (numbers, symbols, spaces) are returned without modification.
            return singleGlyph;
        }
    });

    // Reconstruct the final string from the array of transformed characters.
    let finalTransformedString = modifiedCharacterSequence.join('');

    // Output the resulting string to standard output (console).
    console.log(finalTransformedString);

// Immediately invoke the function with data read from standard input.
// `require('fs').readFileSync('/dev/stdin', 'utf8')` reads the entire file content as a UTF-8 string.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));