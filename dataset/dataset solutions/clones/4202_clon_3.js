const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin"; // Standard input stream path for Unix-like systems

/**
 * Acquires the raw input string from the standard input.
 * @returns {string} The trimmed content read from stdin.
 */
const acquireSourceInput = () => {
    return fileSystemModule.readFileSync(standardInputPath, "utf8").trim();
};

/**
 * Emits the final result message to the standard output.
 * @param {string} outputMessage - The message to display.
 */
const emitOutput = (outputMessage) => {
    console.log(outputMessage);
};

// The 'myerr' function from the original code was not utilized in the main logic,
// so it has been removed to simplify the codebase as a Type III change.

/**
 * Converts a given string into an array of its individual characters.
 * This function replaces the specific use-case (case 6) of the original 'myconv'.
 * @param {string} sourceString - The string to convert.
 * @returns {string[]} An array of characters.
 */
const convertToCharacterArray = (sourceString) => {
    // Adding a basic type and length check for robustness, though not strictly required by problem constraints.
    if (typeof sourceString !== 'string' || sourceString.length === 0) {
        return []; // Return an empty array for invalid input.
    }
    return sourceString.split("");
};

// Defines the set of key characters that must be present and in a specific order.
const REQUIRED_KEY_CHARS = ["K", "I", "H", "B", "R"];

/**
 * Locates the first occurrence index of each required key character within a character sequence.
 * @param {string[]} sequenceChars - The array of characters to search within.
 * @returns {Object.<string, number>} An object mapping each key character to its index, or -1 if not found.
 */
const locateKeyCharacterPositions = (sequenceChars) => {
    const positions = {};
    for (const char of REQUIRED_KEY_CHARS) {
        positions[char] = sequenceChars.indexOf(char);
    }
    return positions;
};

/**
 * Performs a series of structural and positional validations on the input character sequence.
 * This function encapsulates all the conditional checks from the original 'Main' function.
 * @param {string[]} inputCharacterArray - The array of characters to validate.
 * @returns {boolean} True if all validations pass, false otherwise.
 */
const validateSequenceStructure = (inputCharacterArray) => {
    const charPositions = locateKeyCharacterPositions(inputCharacterArray);
    // Using object destructuring for cleaner access to character indices.
    const { K, I, H, B, R } = charPositions;

    // Validation 1: Ensure all mandatory characters are present.
    // This loop replaces multiple individual `list["X"] == -1` checks.
    for (const char of REQUIRED_KEY_CHARS) {
        if (charPositions[char] === -1) {
            return false; // Missing a required character.
        }
    }

    // Validation 2: Verify the correct sequential order of the key characters.
    // Conditions are combined for conciseness.
    if (!(K < I && I < H && H < B && B < R)) {
        return false; // Incorrect character order detected.
    }

    // Validation 3: Check the overall length of the input sequence.
    const MAX_SEQUENCE_LENGTH = 9; // Defined as a constant for clarity.
    if (inputCharacterArray.length > MAX_SEQUENCE_LENGTH) {
        return false; // Sequence exceeds maximum allowed length.
    }

    // Validation 4: Confirm 'K' and 'I' are directly adjacent.
    if (I - K !== 1) { // Rewritten from 'K != I-1' for improved readability.
        return false; // 'K' and 'I' are not adjacent.
    }

    // Validation 5 & 6: Inspect the gap between 'H' and 'B'.
    const hbGapSize = B - H;
    if (hbGapSize > 2) {
        return false; // Gap between 'H' and 'B' is too wide.
    }
    if (hbGapSize === 2) {
        // Corrected index to check the character *between* H and B.
        const characterInHBGAP = inputCharacterArray[H + 1];
        if (characterInHBGAP !== "A") {
            return false; // The character in the H-B gap is not 'A'.
        }
    }

    // Validation 7 & 8: Inspect the gap between 'B' and 'R'.
    const brGapSize = R - B;
    if (brGapSize > 2) {
        return false; // Gap between 'B' and 'R' is too wide.
    }
    if (brGapSize === 2) {
        // Corrected index to check the character *between* B and R.
        const characterInBRGAP = inputCharacterArray[B + 1];
        if (characterInBRGAP !== "A") {
            return false; // The character in the B-R gap is not 'A'.
        }
    }

    // Validation 9: Count leading 'A's.
    let currentLeadingAcount = 0;
    // Using findIndex for a more declarative approach to locate the first non-'A' character.
    const firstNonACharacterIndex = inputCharacterArray.findIndex(char => char !== "A");

    if (firstNonACharacterIndex === -1) {
        // If all characters are 'A', then all are leading 'A's.
        currentLeadingAcount = inputCharacterArray.length;
    } else {
        currentLeadingAcount = firstNonACharacterIndex;
    }

    if (currentLeadingAcount > 1) {
        return false; // More than one leading 'A' found.
    }

    // Validation 10: Count trailing 'A's.
    let currentTrailingAcount = 0;
    let lastNonACharacterIndex = -1;
    // Iterating backwards to find the last non-'A' character.
    for (let currentIdx = inputCharacterArray.length - 1; currentIdx >= 0; currentIdx--) {
        if (inputCharacterArray[currentIdx] !== "A") {
            lastNonACharacterIndex = currentIdx;
            break;
        }
    }

    if (lastNonACharacterIndex === -1) {
        // If all characters are 'A', then all are trailing 'A's.
        currentTrailingAcount = inputCharacterArray.length;
    } else {
        currentTrailingAcount = inputCharacterArray.length - 1 - lastNonACharacterIndex;
    }

    if (currentTrailingAcount > 1) {
        return false; // More than one trailing 'A' found.
    }

    return true; // All validation checks passed successfully.
};

/**
 * The main entry point for processing the input sequence.
 * This function orchestrates the input acquisition, transformation, and validation.
 * @param {string} rawInputString - The raw string obtained from the input source.
 */
const processSequenceValidation = (rawInputString) => {
    const characterSequence = convertToCharacterArray(rawInputString);

    if (validateSequenceStructure(characterSequence)) {
        emitOutput("YES");
    } else {
        emitOutput("NO");
    }
};

// Initiates the program by calling the main processing function with acquired input.
processSequenceValidation(acquireSourceInput());