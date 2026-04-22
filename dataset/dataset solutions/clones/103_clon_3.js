const fileSystem = require('fs'); // Renamed 'fs' import
const INPUT_SOURCE_PATH = '/dev/stdin'; // Defined input path as a constant
const LINE_BREAK_CHAR = '\n'; // Constant for newline character
const VALUE_SEPARATOR = ' '; // Constant for number separator
const SEQUENCE_LENGTH = 4; // Constant for the expected length of number sequences

/**
 * Parses a string line containing space-separated numbers into an array of integers.
 * Includes basic validation to ensure all parsed values are valid numbers.
 * @param {string} rawLine The input string line to parse.
 * @returns {number[]} An array of parsed integers.
 * @throws {Error} If any part of the line cannot be converted to a valid integer.
 */
const parseNumericSequence = (rawLine) => {
    // Ensure the input is a string and trim whitespace
    const cleanedLine = String(rawLine || '').trim();
    if (!cleanedLine) {
        // Return an empty array or throw an error for empty lines, depending on desired behavior
        return [];
    }

    // Split the line by the defined separator and attempt to convert each part to an integer
    const sequence = cleanedLine.split(VALUE_SEPARATOR).map(segment => parseInt(segment, 10));

    // Validate that all elements in the sequence are indeed numbers and match the expected length
    if (sequence.some(isNaN) || sequence.length !== SEQUENCE_LENGTH) {
        throw new Error(`Invalid numeric sequence detected: '${rawLine}'. Expected ${SEQUENCE_LENGTH} integers.`);
    }

    return sequence;
};

// Main execution block to process input data
try {
    // Read the entire content of the input file
    const rawContentBuffer = fileSystem.readFileSync(INPUT_SOURCE_PATH, 'utf8');

    // Trim leading/trailing whitespace from the entire content and split into individual lines
    const contentLines = rawContentBuffer.trim().split(LINE_BREAK_CHAR);

    // If there's no content after trimming and splitting, exit gracefully
    if (contentLines.length === 0 || (contentLines.length === 1 && contentLines[0] === '')) {
        console.error("No valid input lines found. Exiting.");
        process.exit(0);
    }

    // Input validation: Ensure we have an even number of lines for pairs
    if (contentLines.length % 2 !== 0) {
        console.warn("Warning: Input file contains an odd number of lines. The last line will be ignored.");
        // Optionally, throw an error or handle differently
    }

    // Iterate through the lines, processing them in pairs (a 'secret' and a 'guess')
    // The loop increments by 2 for each iteration to handle pairs of lines
    for (let currentBlockIndex = 0; currentBlockIndex < contentLines.length - 1; currentBlockIndex += 2) {
        const secretLine = contentLines[currentBlockIndex];
        const guessLine = contentLines[currentBlockIndex + 1];

        let secretCodePattern;
        let playerGuessPattern;

        try {
            // Parse the two lines of the current block into numeric sequences
            secretCodePattern = parseNumericSequence(secretLine);
            playerGuessPattern = parseNumericSequence(guessLine);
        } catch (parseError) {
            console.error(`Error processing block starting at line ${currentBlockIndex + 1}: ${parseError.message}. Skipping this block.`);
            continue; // Skip to the next pair of lines
        }

        let exactMatches = 0; // Counter for numbers that are correct in value and position (bulls)
        let partialMatches = 0; // Counter for numbers that are correct in value but wrong in position (cows)

        // Temporary arrays to hold digits that were not exact matches, for calculating partial matches
        const remainingSecretDigits = [];
        const remainingGuessDigits = [];

        // First pass: Determine exact matches (bulls)
        // Iterate through each position in the sequences
        for (let digitPosition = 0; digitPosition < SEQUENCE_LENGTH; digitPosition++) {
            // Check if the digits at the current position are identical
            if (secretCodePattern[digitPosition] === playerGuessPattern[digitPosition]) {
                exactMatches++; // Increment exact match count
            } else {
                // If not an exact match, add the digits to respective "remaining" lists
                remainingSecretDigits.push(secretCodePattern[digitPosition]);
                remainingGuessDigits.push(playerGuessPattern[digitPosition]);
            }
        }

        // Second pass: Determine partial matches (cows) from the remaining digits
        // Create a frequency map for the remaining digits in the secret pattern
        const secretDigitFrequencies = new Map();
        for (const digit of remainingSecretDigits) {
            secretDigitFrequencies.set(digit, (secretDigitFrequencies.get(digit) || 0) + 1);
        }

        // Iterate through the remaining digits in the player's guess
        for (const guessedDigit of remainingGuessDigits) {
            // If the guessed digit exists in the secret (and its count is > 0), it's a partial match
            if (secretDigitFrequencies.has(guessedDigit) && secretDigitFrequencies.get(guessedDigit) > 0) {
                partialMatches++; // Increment partial match count
                // Decrement the count in the frequency map to avoid double-counting
                secretDigitFrequencies.set(guessedDigit, secretDigitFrequencies.get(guessedDigit) - 1);
            }
        }

        // Output the calculated exact and partial matches for the current pair
        console.log(`Comparison Result: ${exactMatches} ${partialMatches}`);
    }

} catch (errorReadingFile) {
    // Catch and report any errors that occur during file reading
    console.error(`Failed to read input from '${INPUT_SOURCE_PATH}': ${errorReadingFile.message}`);
    process.exit(1); // Exit with an error code
}