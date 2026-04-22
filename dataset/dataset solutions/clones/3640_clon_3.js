function validateInputSequence(inputSequence) {
    // This function evaluates an input string against a set of specific structural and character rules.
    // It's designed to mimic a simplified compiler or linter check for a custom language syntax.

    // Helper function to signal an invalid input and terminate processing.
    const signalInvalidSequence = () => {
        console.log('WA');
    };

    // Helper function to signal a valid input.
    const signalValidSequence = () => {
        console.log('AC');
    };

    // Helper to determine if a character is a lowercase ASCII letter.
    const isCharLower = (charVal) => {
        // Using character codes for a robust check, avoiding regex for this specific part.
        const code = charVal.charCodeAt(0);
        return code >= 97 && code <= 122; // ASCII 'a' through 'z'
    };

    // Rule 1: Basic length check. The minimum valid structure is "A_C_".
    // This implies at least 4 characters.
    // If inputSequence.length < 4, the structure cannot be met.
    if (inputSequence.length < 4) {
        signalInvalidSequence();
        return; // Early exit for short inputs
    }

    // Rule 2: The very first character of the input string must be 'A'.
    if (inputSequence[0] !== 'A') {
        signalInvalidSequence();
        return;
    }

    // Rule 3: Analyze the central part of the string for the 'C' character.
    // The 'C' character must appear exactly once within the string,
    // specifically not at the beginning (index 0) or the end (last index),
    // and not at the second position (index 1).
    // We define a precise search range for 'C' within the string.
    const centralSegmentStartIdx = 2; // 'C' cannot be inputSequence[0] or inputSequence[1]
    const centralSegmentEndIdx = inputSequence.length - 2; // 'C' cannot be the last character

    // If the defined central segment is logically invalid (e.g., "A_"),
    // there's no possible location for 'C' according to the rules.
    if (centralSegmentEndIdx < centralSegmentStartIdx) {
        signalInvalidSequence();
        return;
    }

    let countOfC = 0;
    let indexC_Absolute = -1; // Stores the absolute index of 'C' in the original string

    // Iterate through the designated central segment to find and count 'C's.
    for (let currentIdx = centralSegmentStartIdx; currentIdx <= centralSegmentEndIdx; currentIdx++) {
        if (inputSequence[currentIdx] === 'C') {
            countOfC++;
            indexC_Absolute = currentIdx; // Store the first (and ideally only) C's index
        }
    }

    // If 'C' is not found exactly once within the specified bounds, the input is invalid.
    if (countOfC !== 1) {
        signalInvalidSequence();
        return;
    }

    // Rule 4: Construct a new sequence by removing 'A' (first char) and 'C'.
    // All remaining characters in this constructed sequence must be lowercase English letters.
    // We'll build this sequence character by character into an array.
    let charCollector = [];
    let isValidLowercaseSequence = true; // Flag to track lowercase validity during construction

    // Add the second character of the original input. This MUST be lowercase.
    const secondChar = inputSequence[1];
    if (!isCharLower(secondChar)) {
        isValidLowercaseSequence = false;
    }
    charCollector.push(secondChar);

    // Add characters that appear before 'C' in the central segment.
    // These are from index 2 up to (but not including) the 'C's position.
    for (let i = centralSegmentStartIdx; i < indexC_Absolute; i++) {
        const char = inputSequence[i];
        if (!isCharLower(char)) {
            isValidLowercaseSequence = false;
            // No need to break here, we can continue collecting characters
            // but the flag will ensure final failure.
        }
        charCollector.push(char);
    }

    // Add characters that appear after 'C' in the central segment.
    // These are from (after 'C's position) up to (but not including) the last character.
    for (let i = indexC_Absolute + 1; i <= centralSegmentEndIdx; i++) {
        const char = inputSequence[i];
        if (!isCharLower(char)) {
            isValidLowercaseSequence = false;
        }
        charCollector.push(char);
    }

    // Add the very last character of the original input. This MUST be lowercase.
    const lastChar = inputSequence[inputSequence.length - 1];
    if (!isCharLower(lastChar)) {
        isValidLowercaseSequence = false;
    }
    charCollector.push(lastChar);

    // After constructing the sequence and checking all characters,
    // if any character was found not to be a lowercase letter, then the sequence is invalid.
    if (!isValidLowercaseSequence) {
        signalInvalidSequence();
        return;
    }

    // If all checks passed successfully, the input sequence is deemed valid.
    signalValidSequence();
}

// Entry point for execution in a typical competitive programming environment.
// Reads the entire input from standard input and processes it.
// It's crucial to trim any trailing newline or whitespace characters from the input.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
// Pass the cleaned input string to the validation function for processing.
validateInputSequence(rawInputData.trim());