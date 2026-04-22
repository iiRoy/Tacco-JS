// This script is designed to process two lines of text input from standard input
// and then determine the count of matching characters within their initial prefix.

// A buffer to store all lines received from the input stream.
const receivedInputSegments = [];

// Explicitly define the standard input and output streams.
const standardInputSource = process.stdin;
const standardOutputDestination = process.stdout;

// Configure the input stream to correctly interpret multi-byte characters.
standardInputSource.setEncoding('utf8');

// Initialize a line-by-line input processing interface.
// This utility helps in handling streams where data arrives in chunks.
let inputLineProcessor = require('readline').createInterface({
    input: standardInputSource,
    output: standardOutputDestination // Output stream is not actively used for prompts in this case.
});

// Register an event listener for each time a complete line of input is received.
inputLineProcessor.on('line', (currentInputLine) => {
    // Add the newly received line to our internal buffer.
    receivedInputSegments.push(currentInputLine);
});

// Register an event listener for when the input stream signals its end (e.g., EOF).
inputLineProcessor.on('close', () => {
    // The target number of characters to compare from the beginning of each string.
    const desiredComparisonPrefixLength = 3;

    // --- Pre-computation and Validation Phase ---

    // Ensure that at least two lines of input were provided for the comparison.
    if (receivedInputSegments.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two distinct lines.");
        // Terminate the process with an error code.
        process.exit(1);
    }

    // Extract the first and second lines from the buffered input.
    // These are the primary textual sequences for our operation.
    const primaryTextualSequence = receivedInputSegments[0];
    const secondaryTextualSequence = receivedInputSegments[1];

    // Validate that the extracted inputs are indeed strings before proceeding.
    if (typeof primaryTextualSequence !== 'string' || typeof secondaryTextualSequence !== 'string') {
        console.error("Error: Input lines are not valid string types for character comparison.");
        process.exit(1);
    }

    // --- Core Logic: Character Matching Function ---

    /**
     * Counts the number of identical characters at corresponding positions within the prefixes of two strings.
     * @param {string} textA - The first string for comparison.
     * @param {string} textB - The second string for comparison.
     * @param {number} comparisonLimit - The maximum number of characters to compare from the start of each string.
     * @returns {number} The total count of matching characters.
     */
    const calculatePrefixCharacterMatches = (textA, textB, comparisonLimit) => {
        let currentMatchTally = 0;
        // Determine the actual number of characters to compare,
        // respecting the shortest string's length and the specified limit.
        const effectiveIterationCeiling = Math.min(comparisonLimit, textA.length, textB.length);

        // Iterate through the characters up to the calculated ceiling.
        for (let charIndex = 0; charIndex < effectiveIterationCeiling; ++charIndex) {
            // Compare characters at the current index.
            // Using charAt() is a robust way to access characters in JavaScript strings.
            if (textA.charAt(charIndex) === textB.charAt(charIndex)) {
                currentMatchTally++; // Increment the counter if characters are identical.
            }
        }
        return currentMatchTally;
    };

    // --- Execution and Output Phase ---

    // Perform the character comparison using our dedicated helper function.
    const finalCharacterMatchResult = calculatePrefixCharacterMatches(
        primaryTextualSequence,
        secondaryTextualSequence,
        desiredComparisonPrefixLength
    );

    // Display the final count of matching characters to standard output.
    console.log(finalCharacterMatchResult);
});