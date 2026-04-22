const fileSystemModule = require("fs"); // Import the Node.js file system module for reading input.

// Define constants to improve readability and maintainability of magic numbers.
const INPUT_SOURCE_PATH = "/dev/stdin"; // Path to the standard input file on Unix-like systems.
const TEXT_ENCODING_STANDARD = "utf8"; // Specifies the character encoding for file operations.
const LINE_BREAK_CHARACTER = '\n'; // Delimiter used to split input content into individual lines.
const ALPHABET_SPAN = 26; // Represents the size of the English alphabet (A-Z or a-z).
const ASCII_BASE_LOWERCASE = 97; // ASCII code for the character 'a', used as a base for character conversions.

// Regular expression to detect specific patterns ("this" or "that") within transformed strings.
const TARGET_TEXT_PATTERN = /th(is|at)/;

/**
 * Transforms a single character using an affine-like cipher algorithm.
 * This function takes any word character's ASCII value, applies a multiplicative
 * and additive shift, and then maps the result back into the lowercase English alphabet range ('a' through 'z').
 *
 * @param {string} singleCharacter The character to be transformed (e.g., 'A', 'b', '3').
 * @param {number} currentMultiplier The multiplicative factor (t in the original code).
 * @param {number} currentOffset The additive offset (s in the original code).
 * @returns {string} The transformed character, always a lowercase English letter.
 */
const applyAffineLikeCharacterTransformation = (singleCharacter, currentMultiplier, currentOffset) => {
    // Retrieve the ASCII (Unicode) value of the input character.
    const characterAsciiValue = singleCharacter.charCodeAt(0);

    // Apply the core transformation logic: (char_code * multiplier + offset) % ALPHABET_SPAN.
    // The result is then shifted to fall within the 'a'-'z' ASCII range.
    const intermediateCalculationResult = characterAsciiValue * currentMultiplier + currentOffset;
    const finalRelativePosition = intermediateCalculationResult % ALPHABET_SPAN;
    const transformedAsciiCode = finalRelativePosition + ASCII_BASE_LOWERCASE;

    // Convert the final ASCII code back into a character.
    return String.fromCharCode(transformedAsciiCode);
};

/**
 * Iterates through all possible affine cipher variations (26*26 combinations)
 * for a given input line and prints any transformed strings that match a predefined pattern.
 * This function encapsulates the main logic of the original script.
 *
 * @param {string} sourceInputLine The line of text to be subjected to various transformations.
 * @param {RegExp} patternMatcher The regular expression used to check transformed strings.
 */
const processLineWithCipherVariations = (sourceInputLine, patternMatcher) => {
    // Loop through all possible multiplicative factors (0 to 25).
    // The original code iterates downwards (t=26; t--;), which is functionally equivalent.
    for (let multiplierValue = 0; multiplierValue < ALPHABET_SPAN; multiplierValue++) {
        // Nested loop for all possible additive offsets (0 to 25).
        // The original code iterates downwards (s=26; s--;), which is functionally equivalent.
        for (let offsetValue = 0; offsetValue < ALPHABET_SPAN; offsetValue++) {

            // Apply the transformation to the entire input line.
            // The `replace` method with `[\w]` (word characters) and global flag (`g`)
            // ensures each word character in the line is processed by our transformation function.
            const currentlyTransformedString = sourceInputLine.replace(/[\w]/g, (originalChar) => {
                // Delegate the actual character-level transformation to our helper function.
                return applyAffineLikeCharacterTransformation(originalChar, multiplierValue, offsetValue);
            });

            // Check if the resulting transformed string contains the target pattern.
            const doesMatchPattern = patternMatcher.test(currentlyTransformedString);

            // If the pattern is found, output the transformed string to the console.
            // The original code used a ternary operator with ':0' for no-op, here an 'if' statement is clearer.
            if (doesMatchPattern) {
                console.log(currentlyTransformedString);
            }
        }
    }
};

// Main execution block of the script.
// A try-catch block is added for robust error handling, a Type III enhancement.
try {
    // Step 1: Read all content from the specified input file.
    const fileContentBuffer = fileSystemModule.readFileSync(INPUT_SOURCE_PATH, TEXT_ENCODING_STANDARD);

    // Step 2: Split the entire content into an array of individual lines.
    const allTextLines = fileContentBuffer.split(LINE_BREAK_CHARACTER);

    // Step 3: The original script specifically processes only the *last* line of input.
    // `slice(-1)` returns a new array containing just the last element.
    const finalInputLineArray = allTextLines.slice(-1);

    // Type III Guard Clause: Ensure there's actually a line to process after slicing.
    if (finalInputLineArray.length > 0) {
        // Step 4: Iterate over the (typically single) last line obtained.
        // `forEach` is used here, as the original `map` was primarily for side-effects (logging)
        // and not for creating a new array of results.
        finalInputLineArray.forEach((singleLineEntry) => {
            // Type III Addition: Trim leading/trailing whitespace from the line for cleaner processing.
            const cleanedInputLine = singleLineEntry.trim();

            // Type III Guard Clause: Only proceed if the cleaned line is not empty.
            if (cleanedInputLine.length > 0) {
                // Step 5: Call the core processing function for the cleaned input line.
                processLineWithCipherVariations(cleanedInputLine, TARGET_TEXT_PATTERN);
            }
        });
    } else {
        // Type III Addition: Provide a warning if no lines were found to process.
        console.warn("Warning: No valid input lines were found in the provided stream to process.");
    }

} catch (processingError) {
    // Type III Error Handling: Log any exceptions that occur during file reading or processing.
    console.error("An unexpected error occurred during script execution:", processingError.message);
    // Optionally, exit the process with an error code.
    // process.exit(1);
}